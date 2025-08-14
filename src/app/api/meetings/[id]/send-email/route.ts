import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const meetingId = resolvedParams.id

    // For now, we'll use Supabase REST API to fetch meeting data
    // since we've moved away from Prisma for consistency
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 })
    }

    // Fetch meeting data from Supabase
    const meetingResponse = await fetch(`${supabaseUrl}/rest/v1/Meeting?id=eq.${meetingId}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    })

    if (!meetingResponse.ok) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    const meetings = await meetingResponse.json()
    if (meetings.length === 0) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    const meeting = meetings[0]

    // Parse action items if they exist
    let actionItems = []
    try {
      if (meeting.actionItems) {
        actionItems = JSON.parse(meeting.actionItems)
      }
    } catch (e) {
      console.log('Could not parse action items:', e)
    }

    // Generate and send email
    try {
      const emailTemplate = emailTemplates.meetingFollowUp(
        meeting, 
        meeting.summary || 'No summary available',
        actionItems
      )
      
      const result = await sendEmail({
        to: session.user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      })

      if (result.success) {
        return NextResponse.json({ 
          message: "Meeting summary email sent successfully",
          recipient: session.user.email,
          emailId: result.id
        })
      } else {
        return NextResponse.json(
          { error: "Failed to send email", details: result.error },
          { status: 500 }
        )
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Meeting email error:", error)
    return NextResponse.json(
      { error: "Failed to process email request" },
      { status: 500 }
    )
  }
} 