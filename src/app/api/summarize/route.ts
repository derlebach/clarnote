import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"
import { getLanguageByCode } from "@/lib/utils"

// Initialize OpenAI client conditionally to prevent build failures
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured')
  }
  return new OpenAI({ apiKey })
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      )
    }

    const openai = getOpenAIClient()
    const { meetingId } = await request.json()

    if (!meetingId) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      )
    }

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

    // Update status to generating summary
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "GENERATING_SUMMARY" },
    })

    try {
      // Determine the language for AI responses
      const language = getLanguageByCode(meeting.language || 'en')
      const languageInstruction = meeting.language && meeting.language !== 'auto' && meeting.language !== 'en' 
        ? `Please respond in ${language.name}. ` 
        : ""

      console.log(`Generating summary in language: ${language.name} (${language.code})`)

      // Create prompts for AI analysis
      const summaryPrompt = `
${languageInstruction}Please analyze the following meeting transcript and provide:

1. **Executive Summary**: A concise 2-3 paragraph summary of the key points discussed
2. **Action Items**: A numbered list of specific tasks, decisions, or follow-ups mentioned
3. **Key Decisions**: Important decisions made during the meeting
4. **Next Steps**: What should happen next based on the discussion

Format your response as JSON with the following structure:
{
  "summary": "Executive summary here...",
  "actionItems": ["Action item 1", "Action item 2", ...],
  "keyDecisions": ["Decision 1", "Decision 2", ...],
  "nextSteps": ["Next step 1", "Next step 2", ...]
}

Meeting Transcript:
${meeting.transcript}
`

      const emailPrompt = `
${languageInstruction}Based on the following meeting transcript, write a professional follow-up email summarizing the meeting. The email should be suitable for sending to meeting participants and stakeholders.

Include:
- Brief recap of main topics
- Key decisions made
- Action items with owners (if mentioned)
- Next meeting date/time (if mentioned)

Use a professional but friendly tone. Format as a complete email with subject line.

Meeting Title: ${meeting.title}
Meeting Transcript:
${meeting.transcript}
`

      // Generate summary and email in parallel
      const [summaryResponse, emailResponse] = await Promise.all([
        openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: `You are an expert meeting analyst. Provide accurate, actionable summaries of meeting content. ${languageInstruction ? `Respond in ${language.name}.` : ""}`
            },
            {
              role: "user",
              content: summaryPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),

        openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: `You are a professional assistant writing follow-up emails for business meetings. ${languageInstruction ? `Write in ${language.name}.` : ""}`
            },
            {
              role: "user",
              content: emailPrompt
            }
          ],
          temperature: 0.4,
          max_tokens: 1000,
        })
      ])

      let summaryData
      try {
        summaryData = JSON.parse(summaryResponse.choices[0].message.content || '{}')
      } catch (parseError) {
        // If JSON parsing fails, create a fallback structure
        summaryData = {
          summary: summaryResponse.choices[0].message.content || "Summary could not be generated",
          actionItems: [],
          keyDecisions: [],
          nextSteps: []
        }
      }

      const followUpEmail = emailResponse.choices[0].message.content || "Follow-up email could not be generated"

      // Update meeting with AI-generated content
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          summary: summaryData.summary,
          actionItems: JSON.stringify({
            actionItems: summaryData.actionItems || [],
            keyDecisions: summaryData.keyDecisions || [],
            nextSteps: summaryData.nextSteps || []
          }),
          followUpEmail: followUpEmail,
          status: "COMPLETED",
        },
      })

      console.log(`Meeting ${meetingId} processing completed successfully`)

      return NextResponse.json({
        message: "Summary generated successfully",
        summary: summaryData.summary,
        actionItems: summaryData.actionItems,
        keyDecisions: summaryData.keyDecisions,
        nextSteps: summaryData.nextSteps,
        followUpEmail: followUpEmail,
        language: language.code,
      })
    } catch (aiError) {
      console.error("AI processing error:", aiError)
      
      // Update status to error
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: "ERROR" },
      })

      return NextResponse.json(
        { error: "AI processing failed" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Summarize API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 