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

    // Generate speaker segments using enhanced algorithm
    console.log(`Saving enhanced speaker detection for meeting ${id}`)
    const speakerSegments = generateSpeakerSegments(meeting.transcript)
    
    // Save the enhanced speaker segments to the database
    // TODO: Enable after confirming Prisma schema is updated
    /*
    await prisma.meeting.update({
      where: { id },
      data: { 
        transcriptSegments: JSON.stringify(speakerSegments)
      }
    })
    */

    console.log(`Generated ${speakerSegments.length} enhanced speaker segments (not saved yet)`)

    return NextResponse.json({ 
      success: true,
      message: `Generated ${speakerSegments.length} speaker segments (ready to save)`,
      segmentCount: speakerSegments.length,
      speakers: [...new Set(speakerSegments.map(s => s.speaker))]
    })
  } catch (error) {
    console.error('Save enhanced speaker detection error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 