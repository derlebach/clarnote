import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

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

    if (!meeting || !meeting.transcriptSegments) {
      return NextResponse.json(
        { error: "Meeting not found or transcript segments not available" },
        { status: 404 }
      )
    }

    // Parse existing transcript segments
    const segments = JSON.parse(meeting.transcriptSegments || '[]')
    
    // Extract unique speakers
    const speakers = [...new Set(segments.map((s: any) => s.speaker))].sort()
    
    console.log(`Enhanced speaker detection found ${segments.length} segments with ${speakers.length} speakers:`, speakers)

    return NextResponse.json({
      success: true,
      segmentCount: segments.length,
      speakers: speakers,
      message: `Found ${segments.length} transcript segments with ${speakers.length} distinct speakers`
    })

  } catch (error) {
    console.error('Regenerate speakers error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze speaker segments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 