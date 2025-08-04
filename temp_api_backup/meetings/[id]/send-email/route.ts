import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const meetingId = params.id

    // Fetch meeting data
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
        userId: session.user.id, // Ensure user owns this meeting
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Generate email content
    const emailContent = generateEmailContent(meeting, session.user)

    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer with SMTP
    
    // For this MVP, we'll simulate sending an email
    console.log('Email would be sent to:', session.user.email)
    console.log('Email content:', emailContent)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Here you would actually send the email:
    /*
    await sendEmail({
      to: session.user.email,
      subject: `Meeting Summary: ${meeting.title}`,
      html: emailContent,
    })
    */

    return NextResponse.json({ 
      message: "Email sent successfully",
      recipient: session.user.email 
    })

  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}

function generateEmailContent(meeting: any, user: any): string {
  const actionItems = meeting.actionItems ? JSON.parse(meeting.actionItems) : null
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px 20px; }
        .section { margin-bottom: 30px; }
        .summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .insights { display: flex; gap: 20px; }
        .insight-box { flex: 1; background: #f3f4f6; padding: 15px; border-radius: 8px; }
        .insight-box h4 { margin: 0 0 10px 0; color: #1f2937; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0;">Meeting Summary</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${meeting.title}</p>
      </div>
      
      <div class="content">
        <p>Hi ${user.name || user.email},</p>
        
        <p>Here's your AI-generated meeting summary for <strong>${meeting.title}</strong>, processed on ${new Date(meeting.createdAt).toLocaleDateString()}.</p>

        ${meeting.summary ? `
          <div class="section">
            <h3>Executive Summary</h3>
            <div class="summary">
              ${meeting.summary.replace(/\n/g, '<br>')}
            </div>
          </div>
        ` : ''}

        ${actionItems ? `
          <div class="section">
            <h3>Key Takeaways</h3>
            <div class="insights">
              ${actionItems.actionItems?.length > 0 ? `
                <div class="insight-box">
                  <h4>🎯 Action Items</h4>
                  <ul>
                    ${actionItems.actionItems.map((item: string) => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${actionItems.keyDecisions?.length > 0 ? `
                <div class="insight-box">
                  <h4>✅ Key Decisions</h4>
                  <ul>
                    ${actionItems.keyDecisions.map((decision: string) => `<li>${decision}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${actionItems.nextSteps?.length > 0 ? `
                <div class="insight-box">
                  <h4>👉 Next Steps</h4>
                  <ul>
                    ${actionItems.nextSteps.map((step: string) => `<li>${step}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <p>You can view the full transcript and download a PDF report by logging into your Clarnote dashboard.</p>
        
        <p>Best regards,<br>The Clarnote Team</p>
      </div>
      
      <div class="footer">
        <p>This email was generated by Clarnote AI Meeting Assistant</p>
        <p>Visit your dashboard to view more details and manage your meetings</p>
      </div>
    </body>
    </html>
  `
} 