import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('Meetings API - Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    })

    if (!session?.user?.email) {
      console.error('Meetings API - No valid session or user email')
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 })
    }

    // Get user ID from database and ensure user exists
    let userId = session.user.id
    let user = null
    
    if (userId) {
      // Check if user exists in database
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true }
      })
    }
    
    if (!user) {
      // Try to find user by email
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true }
      })
    }
    
    if (!user) {
      // Create user if they don't exist
      console.log('Meetings API - Creating new user:', session.user.email)
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
        },
        select: { id: true, email: true }
      })
    }
    
    userId = user.id

    const meetings = await prisma.meeting.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        duration: true,
        status: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 