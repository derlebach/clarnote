import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: from || 'Clarnote <onboarding@clarnote.com>',
      to: [to],
      subject,
      html,
    })

    console.log('✅ Email sent successfully:', { to, subject, id: result.data?.id })
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Clarnote!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; }
          .header { background: #000000; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 40px 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; padding: 12px 24px; background: #000000; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">Welcome to Clarnote!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered meeting assistant</p>
        </div>
        
        <div class="content">
          <p>Hi ${name},</p>
          
          <p>Welcome to Clarnote! We're excited to help you transform your meetings with AI-powered transcription and summaries.</p>
          
          <p><strong>What you can do with Clarnote:</strong></p>
          <ul>
            <li>📝 Transcribe meetings automatically</li>
            <li>🤖 Generate AI summaries and action items</li>
            <li>📧 Send follow-up emails to participants</li>
            <li>📊 Track meeting insights and analytics</li>
          </ul>
          
          <p>Ready to get started?</p>
          <a href="https://www.clarnote.com/dashboard" class="button">Go to Dashboard</a>
          
          <p>If you have any questions, feel free to reach out to us!</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Clarnote. All rights reserved.</p>
          <p>This email was sent to your registered email address.</p>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (resetUrl: string, name: string) => ({
    subject: 'Reset your Clarnote password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; }
          .header { background: #000000; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 40px 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; padding: 12px 24px; background: #000000; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .warning { background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #6b7280; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">Reset Your Password</h1>
        </div>
        
        <div class="content">
          <p>Hi ${name},</p>
          
          <p>You requested to reset your Clarnote password. Click the button below to create a new password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <div class="warning">
            <p><strong>⚠️ Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password won't change until you create a new one</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Clarnote. All rights reserved.</p>
          <p>This email was sent to your registered email address.</p>
        </div>
      </body>
      </html>
    `
  }),

  meetingFollowUp: (meeting: any, summary: string, actionItems: any[]) => ({
    subject: `Meeting Summary: ${meeting.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; }
          .header { background: #000000; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
          .section { margin-bottom: 30px; }
          .summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
          .action-item { background: #f3f4f6; padding: 10px; border-radius: 6px; margin: 8px 0; border-left: 4px solid #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">Meeting Summary</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${meeting.title}</p>
        </div>
        
        <div class="content">
          <p>Here's your AI-generated meeting summary, processed on ${new Date(meeting.createdAt).toLocaleDateString()}.</p>

          ${summary ? `
            <div class="section">
              <h3>📋 Executive Summary</h3>
              <div class="summary">
                ${summary.replace(/\n/g, '<br>')}
              </div>
            </div>
          ` : ''}

          ${actionItems && actionItems.length > 0 ? `
            <div class="section">
              <h3>✅ Action Items</h3>
              ${actionItems.map(item => `
                <div class="action-item">
                  <strong>${item.task || item}</strong>
                  ${item.assignee ? `<br><small>Assigned to: ${item.assignee}</small>` : ''}
                  ${item.dueDate ? `<br><small>Due: ${item.dueDate}</small>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="section">
            <p>View the full meeting details and transcript in your dashboard:</p>
            <a href="https://www.clarnote.com/meeting/${meeting.id}" style="display: inline-block; padding: 12px 24px; background: #000000; color: white; text-decoration: none; border-radius: 8px;">View Meeting</a>
          </div>
        </div>
        
        <div class="footer">
          <p>© 2024 Clarnote. All rights reserved.</p>
          <p>This summary was generated by AI and sent automatically.</p>
        </div>
      </body>
      </html>
    `
  })
} 