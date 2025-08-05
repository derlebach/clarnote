import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { speakerMap } = await request.json()
    const { id: meetingId } = await params

    // Validate speaker map
    if (!speakerMap || typeof speakerMap !== 'object') {
      return NextResponse.json(
        { error: "Invalid speaker map provided" },
        { status: 400 }
      )
    }

    // Update meeting with new speaker map
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { 
        speakerMap: JSON.stringify(speakerMap)
      },
    })

    console.log(`Updated speaker map for meeting ${meetingId}:`, speakerMap)

    return NextResponse.json({
      success: true,
      speakerMap: speakerMap,
      message: 'Speaker names updated successfully'
    })

  } catch (error) {
    console.error('Update speakers error:', error)
    return NextResponse.json({ 
      error: 'Failed to update speaker names',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 