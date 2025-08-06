import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  console.log('Meeting API - Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
    requestedMeetingId: id
  })

  if (!session?.user?.email) {
    console.error('Meeting API - No valid session or user email')
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let userId = session.user.id
  if (!userId) {
    console.log('Meeting API - Looking up user by email:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (user) {
      userId = user.id
    }
  }

  if (!userId) {
    console.error('Meeting API - Could not determine user ID')
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: id,
        userId: userId!,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!meeting) {
      console.error('Meeting API - Meeting not found or access denied')
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    console.log('Meeting API - Successfully fetched meeting:', meeting.id)
    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('Meeting API - Database error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  console.log('Meeting Update API - Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
    requestedMeetingId: id
  })

  if (!session?.user?.email) {
    console.error('Meeting Update API - No valid session or user email')
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let userId = session.user.id
  if (!userId) {
    console.log('Meeting Update API - Looking up user by email:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (user) {
      userId = user.id
    }
  }

  if (!userId) {
    console.error('Meeting Update API - Could not determine user ID')
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { title } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: "Valid title is required" }, { status: 400 })
    }

    if (title.trim().length > 200) {
      return NextResponse.json({ error: "Title too long (max 200 characters)" }, { status: 400 })
    }

    // Verify the meeting exists and belongs to the user
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id: id,
        userId: userId!,
      }
    })

    if (!existingMeeting) {
      console.error('Meeting Update API - Meeting not found or access denied')
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Update the meeting title
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: { title: title.trim() },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log('Meeting Update API - Successfully updated meeting title:', id)
    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    console.error('Meeting Update API - Database error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  console.log('Meeting DELETE API - Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
    requestedMeetingId: id
  })

  if (!session?.user?.email) {
    console.error('Meeting DELETE API - No valid session or user email')
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let userId = session.user.id
  if (!userId) {
    console.log('Meeting DELETE API - Looking up user by email:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (user) {
      userId = user.id
    }
  }

  if (!userId) {
    console.error('Meeting DELETE API - Could not determine user ID')
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    // First, check if the meeting exists and belongs to the user
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id: id,
        userId: userId!,
      }
    })

    if (!existingMeeting) {
      console.error('Meeting DELETE API - Meeting not found or unauthorized:', id)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Delete the meeting
    await prisma.meeting.delete({
      where: {
        id: id,
      }
    })

    console.log('Meeting DELETE API - Successfully deleted meeting:', id)
    return NextResponse.json({ message: "Meeting deleted successfully" })
  } catch (error) {
    console.error('Meeting DELETE API - Database error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 