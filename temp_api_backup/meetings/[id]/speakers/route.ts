import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  console.log('Speaker Update API - Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
    requestedMeetingId: id
  })

  if (!session?.user?.email) {
    console.error('Speaker Update API - No valid session or user email')
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let userId = session.user.id
  if (!userId) {
    console.log('Speaker Update API - Looking up user by email:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (user) {
      userId = user.id
    }
  }

  if (!userId) {
    console.error('Speaker Update API - Could not determine user ID')
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { speakerMap } = body

    if (!speakerMap || typeof speakerMap !== 'object') {
      return NextResponse.json({ error: "Valid speaker map is required" }, { status: 400 })
    }

    // Validate speaker map values
    for (const [speakerId, speakerName] of Object.entries(speakerMap)) {
      if (typeof speakerName !== 'string' || speakerName.trim().length === 0) {
        return NextResponse.json({ error: "All speaker names must be non-empty strings" }, { status: 400 })
      }
      if (speakerName.trim().length > 50) {
        return NextResponse.json({ error: "Speaker names must be 50 characters or less" }, { status: 400 })
      }
    }

    // Verify the meeting exists and belongs to the user
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id: id,
        userId: userId,
      }
    })

    if (!existingMeeting) {
      console.error('Speaker Update API - Meeting not found or access denied')
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Update the speaker map
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: { speakerMap: JSON.stringify(speakerMap) }
    })

    console.log('Speaker Update API - Successfully updated speaker map:', id)
    return NextResponse.json({ 
      success: true,
      speakerMap: JSON.parse(updatedMeeting.speakerMap || '{}')
    })
  } catch (error) {
    console.error('Speaker Update API - Database error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 