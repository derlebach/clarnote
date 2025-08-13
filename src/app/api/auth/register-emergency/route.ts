import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password } = await req.json()

    // Validate input
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Direct Supabase REST API call (bypassing Prisma completely)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await fetch(`${supabaseUrl}/rest/v1/User`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name: fullName,
        email: email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    })

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'User registered successfully via emergency endpoint',
        bypass: true 
      })
    } else {
      const error = await response.text()
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Registration failed', 
        details: error,
        supabaseStatus: response.status 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Emergency registration error:', error)
    return NextResponse.json({ 
      error: 'Emergency registration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 