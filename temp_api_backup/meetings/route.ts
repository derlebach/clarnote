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

    // Get user ID from database if not in session
    let userId = session.user.id
    if (!userId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      if (!user) {
        console.error('Meetings API - User not found in database:', session.user.email)
        return NextResponse.json({ error: "User not found" }, { status: 401 })
      }
      userId = user.id
    }

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