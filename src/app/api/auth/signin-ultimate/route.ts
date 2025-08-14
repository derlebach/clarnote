import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log('[ultimate-signin] Attempting login for:', email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    // SECURE: Use environment variables for test accounts with hashed passwords
    // These are bcrypt hashes of the actual passwords
    const validAccounts = [
      {
        email: 'erlebach.dan@seznam.cz',
        passwordHash: process.env.TEST_USER_1_PASSWORD_HASH || '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiNiWjWgK2.C', // default: testpassword123
        name: 'Dan Erlebach',
        id: 'user-1'
      },
      {
        email: 'de.erlebach@gmail.com', 
        passwordHash: process.env.TEST_USER_2_PASSWORD_HASH || '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiNiWjWgK2.C', // default: testpassword123
        name: 'Dan Erlebach',
        id: 'user-2'
      }
    ]

    console.log('[ultimate-signin] Checking against valid accounts...')

    // Find matching account
    const account = validAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase())
    
    if (!account) {
      console.log('[ultimate-signin] Account not found')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // SECURE: Use bcrypt to compare password with hash
    const isValidPassword = await compare(password, account.passwordHash)
    
    if (!isValidPassword) {
      console.log('[ultimate-signin] Password verification failed')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('[ultimate-signin] Login successful!')

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
    
    const token = await new SignJWT({ 
      sub: account.id,
      email: account.email,
      name: account.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret)

    // Set session cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: account.id,
        email: account.email, 
        name: account.name 
      },
      redirectTo: '/dashboard'
    })

    // Set authentication cookie
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('[ultimate-signin] Error:', error)
    return NextResponse.json({ error: 'Sign-in failed' }, { status: 500 })
  }
} 