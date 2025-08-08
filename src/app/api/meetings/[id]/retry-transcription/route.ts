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

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      )
    }

    // Reset meeting status to allow retranscription
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: "UPLOADED",
        transcript: null,
        transcriptSegments: null,
        description: `Retrying transcription - ${new Date().toISOString()}`
      },
    })

    // Trigger new transcription
    const requestOrigin = (() => { try { return new URL(request.url).origin } catch { return undefined } })()
    const baseUrl = process.env.NEXTAUTH_URL || requestOrigin || ''
    fetch(`${baseUrl}/api/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        meetingId,
        qualityMode: 'accurate'
      }),
    }).catch(console.error)

    console.log(`Retrying transcription for meeting ${meetingId}`)

    return NextResponse.json({
      success: true,
      message: 'Transcription retry initiated. The meeting will be reprocessed with enhanced settings.'
    })

  } catch (error) {
    console.error('Retry transcription error:', error)
    return NextResponse.json({ 
      error: 'Failed to retry transcription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 