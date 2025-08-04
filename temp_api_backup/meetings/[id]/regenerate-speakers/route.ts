import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSpeakerSegments } from "@/lib/utils"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let userId = session.user.id
  if (!userId) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (user) {
      userId = user.id
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    // Get the meeting
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: id,
        userId: userId,
      }
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    if (!meeting.transcript) {
      return NextResponse.json({ error: "No transcript available" }, { status: 400 })
    }

    // Generate speaker segments using improved algorithm
    console.log(`\n=== Testing enhanced speaker detection for meeting ${id} ===`)
    console.log(`Transcript length: ${meeting.transcript.length} characters`)
    
    const speakerSegments = generateSpeakerSegments(meeting.transcript)
    
    console.log(`\n=== Enhanced speaker detection results ===`)
    console.log(`Generated ${speakerSegments.length} speaker segments`)
    console.log('Unique speakers:', [...new Set(speakerSegments.map(s => s.speaker))])
    console.log('Segment breakdown:')
    speakerSegments.forEach((segment, index) => {
      console.log(`  ${index + 1}. ${segment.speaker}: ${segment.text.length} chars - "${segment.text.substring(0, 100)}..."`)
    })

    // For now, just return the results without updating the database
    // You can uncomment the update below to save the results
    /*
    await prisma.meeting.update({
      where: { id },
      data: { 
        transcriptSegments: JSON.stringify(speakerSegments)
      }
    })
    */

    return NextResponse.json({ 
      success: true,
      speakerSegments: speakerSegments,
      segmentCount: speakerSegments.length,
      speakers: [...new Set(speakerSegments.map(s => s.speaker))],
      analysis: {
        totalCharacters: meeting.transcript.length,
        averageSegmentLength: Math.round(speakerSegments.reduce((sum, s) => sum + s.text.length, 0) / speakerSegments.length),
        speakerDistribution: speakerSegments.reduce((acc, s) => {
          acc[s.speaker] = (acc[s.speaker] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    })
  } catch (error) {
    console.error('Enhanced speaker detection error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 