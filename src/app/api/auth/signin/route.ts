import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  console.log('🔐 Sign-in attempt started')
  
  try {
    console.log('📋 Validating credentials...')
    const { email, password } = await req.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Invalid email format' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking up user with email:', email)
    
    // Find user using Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Configuration error', message: 'Authentication service unavailable' },
        { status: 500 }
      )
    }

    // Look up user by email
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/User?email=eq.${email}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    })

    if (!userResponse.ok) {
      console.log('❌ Database query failed:', userResponse.status)
      return NextResponse.json(
        { error: 'Authentication failed', message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const users = await userResponse.json()
    if (users.length === 0) {
      console.log('❌ User not found')
      return NextResponse.json(
        { error: 'Authentication failed', message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]
    
    // Check if user has a password (might be OAuth-only user)
    if (!user.password) {
      console.log('❌ User has no password (OAuth-only account)')
      return NextResponse.json(
        { error: 'Authentication failed', message: 'This account uses Google sign-in. Please use the "Continue with Google" button.' },
        { status: 401 }
      )
    }

    console.log('🔐 Verifying password...')
    
    // Compare password with stored hash
    const isValidPassword = await compare(password, user.password)
    
    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return NextResponse.json(
        { error: 'Authentication failed', message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('✅ Password verified, creating session...')

    // Create JWT token for session
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
    
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret)

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Sign-in successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }, { status: 200 })

    // Set secure session cookie
    const isProduction = process.env.NODE_ENV === 'production'
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })

    console.log('✅ Sign-in successful for user:', user.id)
    return response

  } catch (error) {
    console.log('❌ Sign-in error:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred during sign-in' },
      { status: 500 }
    )
  }
} 