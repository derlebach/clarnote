import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

// Input validation schema
const registerSchema = z.object({
  fullName: z.string()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
})

export async function POST(request: NextRequest) {
  console.log("📝 Registration attempt started")
  
  try {
    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ Invalid JSON in request body:", parseError)
      return NextResponse.json(
        { 
          error: "Invalid request format",
          message: "Request body must be valid JSON" 
        },
        { status: 400 }
      )
    }

    console.log("📋 Validating input fields...")
    
    // Validate required fields and format
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      console.error("❌ Validation failed:", firstError.message)
      
      return NextResponse.json(
        { 
          error: "Validation failed",
          message: firstError.message,
          field: firstError.path[0] 
        },
        { status: 400 }
      )
    }

    const { fullName, email, password } = validationResult.data

    console.log(`🔍 Checking if user exists with email: ${email}`)

    // Test database connection and check if user exists
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true }
      })
    } catch (dbError: any) {
      console.error("❌ Database connection failed:", {
        error: dbError.message,
        code: dbError.code,
        meta: dbError.meta
      })
      
      // Check if it's a connection issue
      if (dbError.code === 'P5010' || dbError.message?.includes('fetch failed')) {
        return NextResponse.json(
          { 
            error: "Service temporarily unavailable",
            message: "Database connection failed. Please try again later." 
          },
          { status: 503 }
        )
      }
      
      // Generic database error
      return NextResponse.json(
        { 
          error: "Database error",
          message: "Unable to process registration at this time" 
        },
        { status: 500 }
      )
    }

    if (existingUser) {
      console.warn(`⚠️  User already exists with email: ${email}`)
      return NextResponse.json(
        { 
          error: "User already exists",
          message: "An account with this email address already exists" 
        },
        { status: 409 }
      )
    }

    console.log("🔐 Hashing password...")
    
    // Hash password securely
    let hashedPassword
    try {
      hashedPassword = await hashPassword(password)
    } catch (hashError) {
      console.error("❌ Password hashing failed:", hashError)
      return NextResponse.json(
        { 
          error: "Security processing failed",
          message: "Unable to process password securely" 
        },
        { status: 500 }
      )
    }

    console.log("👤 Creating new user...")

    // Create user in database
    let newUser
    try {
      newUser = await prisma.user.create({
        data: {
          name: fullName,  // Map fullName to name field in database
          email: email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      })
    } catch (createError: any) {
      console.error("❌ User creation failed:", {
        error: createError.message,
        code: createError.code
      })

      // Handle unique constraint violation (race condition)
      if (createError.code === 'P2002') {
        return NextResponse.json(
          { 
            error: "User already exists",
            message: "An account with this email address already exists" 
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { 
          error: "Account creation failed",
          message: "Unable to create account at this time" 
        },
        { status: 500 }
      )
    }

    console.log(`✅ User created successfully: ${newUser.id}`)

    // Return success response (201 Created)
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
        }
      },
      { status: 201 }
    )

  } catch (unexpectedError: any) {
    // Catch any unexpected errors
    console.error("❌ Unexpected registration error:", {
      error: unexpectedError.message,
      stack: unexpectedError.stack,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later." 
      },
      { status: 500 }
    )
  }
} 