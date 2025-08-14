import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
  console.log('📝 Registration attempt started')
  
  try {
    console.log('📋 Validating input fields...')
    const { fullName, email, password } = await req.json()

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'All fields are required', field: !fullName ? 'fullName' : !email ? 'email' : 'password' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Invalid email format', field: 'email' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Password must be at least 6 characters', field: 'password' },
        { status: 400 }
      )
    }

    console.log('🔍 Checking if user exists with email:', email)
    
    // Check if user already exists using Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Configuration error', message: 'Database configuration missing' },
        { status: 500 }
      )
    }

    // Check if user exists
    const existingUserResponse = await fetch(`${supabaseUrl}/rest/v1/User?email=eq.${email}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    })

    if (!existingUserResponse.ok) {
      console.log('❌ Database query failed:', existingUserResponse.status)
      return NextResponse.json(
        { error: 'Database error', message: 'Unable to check existing users' },
        { status: 500 }
      )
    }

    const existingUsers = await existingUserResponse.json()
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User exists', message: 'User with this email already exists', field: 'email' },
        { status: 409 }
      )
    }

    console.log('🔐 Hashing password...')
    const hashedPassword = await hash(password, 12)

    console.log('👤 Creating user in database...')
    
    // Create new user using Supabase REST API
    const createUserResponse = await fetch(`${supabaseUrl}/rest/v1/User`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: fullName,
        email: email,
        password: hashedPassword,
        emailVerified: new Date().toISOString(), // Auto-verify for now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    })

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text()
      console.log('❌ User creation failed:', createUserResponse.status, errorText)
      return NextResponse.json(
        { error: 'Database error', message: 'Unable to create user account' },
        { status: 500 }
      )
    }

    const newUser = await createUserResponse.json()
    const createdUser = Array.isArray(newUser) ? newUser[0] : newUser

    console.log('✅ User created successfully:', createdUser.id)

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email
      }
    }, { status: 201 })

  } catch (error) {
    console.log('❌ Registration error:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred during registration' },
      { status: 500 }
    )
  }
} 