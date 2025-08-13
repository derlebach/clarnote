import { NextRequest, NextResponse } from 'next/server'
import { hash, compare } from 'bcryptjs'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    console.log('[emergency-signin] Attempting login for:', email)

    // Direct Supabase REST API call (bypass everything)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('[emergency-signin] Missing Supabase credentials')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Fetch user from Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/User?email=eq.${email}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('[emergency-signin] Supabase response status:', response.status)

    if (!response.ok) {
      console.error('[emergency-signin] Supabase error:', response.status)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    const users = await response.json()
    console.log('[emergency-signin] Found users:', users.length)

    const user = users[0]
    
    if (!user || !user.password) {
      console.log('[emergency-signin] No user found or no password')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('[emergency-signin] User found, verifying password...')

    // Verify password
    const isPasswordValid = await compare(password, user.password)
    console.log('[emergency-signin] Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('[emergency-signin] Login successful for:', user.email)

    // Create a simple session token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
    
    const token = await new SignJWT({ 
      sub: user.id,
      email: user.email,
      name: user.name,
      emergency: true
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)

    // Set session cookie
    const response_obj = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      message: 'Signed in successfully via emergency endpoint'
    })

    // Set cookie that NextAuth can recognize
    response_obj.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response_obj

  } catch (error) {
    console.error('[emergency-signin] Error:', error)
    return NextResponse.json({ 
      error: 'Sign-in failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 