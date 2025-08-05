import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateSpeakerSegments } from '@/lib/utils'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: meetingId } = await params

    // Get meeting from database
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    })

    if (!meeting || !meeting.transcript) {
      return NextResponse.json(
        { error: "Meeting not found or transcript not available" },
        { status: 404 }
      )
    }

    // Generate speaker segments from the existing transcript
    const speakerSegments = generateSpeakerSegments(meeting.transcript)
    
    // Update the meeting with the generated segments
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        transcriptSegments: JSON.stringify(speakerSegments)
      },
    })

    console.log(`Fixed speaker segments for meeting ${meetingId}:`, {
      segmentCount: speakerSegments.length,
      speakers: [...new Set(speakerSegments.map(s => s.speaker))]
    })

    return NextResponse.json({
      success: true,
      segmentCount: speakerSegments.length,
      speakers: [...new Set(speakerSegments.map(s => s.speaker))],
      message: `Generated ${speakerSegments.length} speaker segments and saved to database`
    })

  } catch (error) {
    console.error('Fix segments error:', error)
    return NextResponse.json({ 
      error: 'Failed to fix speaker segments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 