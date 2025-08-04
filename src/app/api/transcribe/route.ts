import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"
import { createReadStream } from "fs"
import { join } from "path"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Post-processing utilities for improving transcription quality
function cleanTranscript(text: string, language: string): string {
  if (!text) return text

  let cleaned = text.trim()

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ')

  // Fix common punctuation issues
  cleaned = cleaned.replace(/\s+([.,!?;:])/g, '$1')
  cleaned = cleaned.replace(/([.,!?;:])\s*([A-Z])/g, '$1 $2')

  // Ensure sentences start with capital letters
  cleaned = cleaned.replace(/([.!?])\s*([a-z])/g, (match, p1, p2) => {
    return p1 + ' ' + p2.toUpperCase()
  })

  // Capitalize the first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }

  // Remove common filler words (configurable)
  const fillerWords = ['um', 'uh', 'er', 'ah', 'hmm', 'ehm']
  const fillerPattern = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi')
  cleaned = cleaned.replace(fillerPattern, '').replace(/\s+/g, ' ').trim()

  // Language-specific improvements
  if (language === 'en') {
    // English-specific cleanup
    cleaned = cleaned.replace(/\bi\b/g, 'I') // Capitalize standalone 'i'
  }

  // Ensure proper sentence ending
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.'
  }

  return cleaned
}

function validateTranscriptionQuality(text: string, duration: number): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (!text || text.trim().length === 0) {
    issues.push("Empty transcription")
    return { isValid: false, issues }
  }

  const wordCount = text.trim().split(/\s+/).length
  const wordsPerSecond = wordCount / Math.max(duration, 1)

  // Check for reasonable speech rate (typically 2-4 words per second)
  if (wordsPerSecond > 6) {
    issues.push("Transcription may be too fast/compressed")
  }
  if (wordsPerSecond < 0.5 && duration > 30) {
    issues.push("Transcription may be incomplete")
  }

  // Check for excessive repetition
  const words = text.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words)
  const repetitionRatio = uniqueWords.size / words.length
  if (repetitionRatio < 0.3 && words.length > 50) {
    issues.push("High repetition detected, may indicate transcription errors")
  }

  // Check for proper sentence structure
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length === 0 && text.length > 100) {
    issues.push("No proper sentence structure detected")
  }

  return { isValid: issues.length === 0, issues }
}

function generateTranscriptionPrompt(language: string, fileName?: string): string {
  const basePrompt = "This is a professional meeting recording. Please provide accurate transcription with proper punctuation, capitalization, and sentence structure."
  
  const languagePrompts: Record<string, string> = {
    'en': "Focus on clear English with proper grammar and professional terminology.",
    'es': "Enfócate en español claro con gramática y terminología profesional apropiadas.",
    'fr': "Concentrez-vous sur un français clair avec une grammaire et une terminologie professionnelles appropriées.",
    'de': "Konzentrieren Sie sich auf klares Deutsch mit angemessener Grammatik und professioneller Terminologie.",
    'cs': "Zaměřte se na jasnou češtinu s vhodnou gramatikou a odbornou terminologií.",
    'pt': "Foque em português claro com gramática e terminologia profissional apropriadas.",
    'it': "Concentrati su italiano chiaro con grammatica e terminologia professionale appropriate.",
    'ru': "Сосредоточьтесь на ясном русском языке с правильной грамматикой и профессиональной терминологией.",
    'ja': "明確な日本語と適切な文法、専門用語に焦点を当ててください。",
    'ko': "명확한 한국어와 적절한 문법, 전문 용어에 중점을 두십시오.",
    'zh': "专注于清晰的中文，使用适当的语法和专业术语。",
    'ar': "ركز على العربية الواضحة مع القواعد والمصطلحات المهنية المناسبة.",
    'hi': "उचित व्याकरण और पेशेवर शब्दावली के साथ स्पष्ट हिंदी पर ध्यान दें।",
    'nl': "Focus op duidelijk Nederlands met juiste grammatica en professionele terminologie.",
    'pl': "Skup się na jasnym polskim z odpowiednią gramatyką i profesjonalną terminologią.",
    'sv': "Fokusera på tydlig svenska med korrekt grammatik och professionell terminologi.",
    'da': "Fokuser på klar dansk med korrekt grammatik og professionel terminologi.",
    'no': "Fokuser på klar norsk med korrekt grammatikk og profesjonell terminologi.",
    'fi': "Keskity selkeään suomeen asianmukaisella kieliopilla ja ammattiterminologialla."
  }

  const languageSpecific = languagePrompts[language] || languagePrompts['en']
  
  return `${basePrompt} ${languageSpecific}`
}

function processSpeakerSegments(segments: any[]): any[] {
  // Enhanced speaker diarization using multiple heuristics
  const speakerSegments: any[] = []
  
  if (segments.length === 0) return speakerSegments

  let currentSpeakerIndex = 0
  let lastEndTime = 0
  let lastSegmentLength = 0
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const text = segment.text?.trim() || ''
    const start = segment.start || 0
    const end = segment.end || 0
    const duration = end - start
    
    // Calculate silence gap between segments
    const silenceGap = start - lastEndTime
    
    // Enhanced speaker change detection using multiple signals
    let shouldChangeSpeaker = false
    
    // 1. Long silence gaps (>1.5s) often indicate speaker changes
    if (silenceGap > 1.5 && i > 0) {
      shouldChangeSpeaker = true
    }
    
    // 2. Dramatic changes in speech duration patterns
    if (lastSegmentLength > 0) {
      const durationRatio = duration / lastSegmentLength
      if ((durationRatio > 3 || durationRatio < 0.3) && silenceGap > 0.8) {
        shouldChangeSpeaker = true
      }
    }
    
    // 3. Conversational cues that suggest speaker changes
    const speakerChangeIndicators = [
      /^(yes|yeah|no|right|okay|ok|exactly|correct)\b/i,
      /^(i think|i believe|actually|well|so|but|however)\b/i,
      /^(um|uh|ah|hmm|er)\b/i, // Hesitation sounds
      /\?.*$/, // Questions
      /^(what|how|when|where|why|who)\b/i, // Question words
      /^(thank you|thanks|please)\b/i // Polite expressions
    ]
    
    const hasChangeIndicator = speakerChangeIndicators.some(pattern => pattern.test(text))
    if (hasChangeIndicator && silenceGap > 0.5 && i > 0) {
      shouldChangeSpeaker = true
    }
    
    // 4. Content-based analysis for natural conversation flow
    if (i > 0) {
      const prevText = segments[i-1]?.text?.trim() || ''
      
      // If previous segment ended with a question and current starts with an answer
      if (prevText.includes('?') && /^(yes|no|i|that|this|it)/i.test(text)) {
        shouldChangeSpeaker = true
      }
      
      // If there's a shift from formal to informal language or vice versa
      const formalWords = ['however', 'therefore', 'consequently', 'furthermore']
      const informalWords = ['yeah', 'okay', 'sure', 'cool', 'got it']
      
      const prevHasFormal = formalWords.some(word => prevText.toLowerCase().includes(word))
      const currentHasInformal = informalWords.some(word => text.toLowerCase().includes(word))
      
      if (prevHasFormal && currentHasInformal && silenceGap > 0.3) {
        shouldChangeSpeaker = true
      }
    }
    
    // Apply speaker change with some smoothing to avoid too frequent switches
    if (shouldChangeSpeaker) {
      // Cycle through speakers (support up to 4 speakers)
      currentSpeakerIndex = (currentSpeakerIndex + 1) % 4
    }
    
    speakerSegments.push({
      speaker: `speaker_${currentSpeakerIndex}`,
      text: text,
      startTime: start,
      endTime: end
    })
    
    lastEndTime = end
    lastSegmentLength = duration
  }
  
  return mergeSimilarSpeakerSegments(speakerSegments)
}

function mergeSimilarSpeakerSegments(segments: any[]): any[] {
  if (segments.length === 0) return segments
  
  const merged: any[] = []
  let current = { ...segments[0] }
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i]
    
    // If same speaker and close in time (within 2 seconds), merge
    if (segment.speaker === current.speaker && 
        (segment.startTime - current.endTime) < 2.0) {
      current.text += ' ' + segment.text
      current.endTime = segment.endTime
    } else {
      // Only add if text is substantial (more than 3 words)
      if (current.text.split(' ').length >= 3) {
        merged.push(current)
      }
      current = { ...segment }
    }
  }
  
  // Add the last segment if substantial
  if (current.text.split(' ').length >= 3) {
    merged.push(current)
  }
  
  return merged
}

export async function POST(request: NextRequest) {
  try {
    const { meetingId, qualityMode = 'accurate' } = await request.json()

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

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      )
    }

    // Update status to transcribing
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "TRANSCRIBING" },
    })

    try {
      // Get the file path
      const filePath = join(process.cwd(), "uploads", meeting.fileUrl!.replace("/uploads/", ""))
      
      // Create a readable stream for the audio file
      const audioFile = createReadStream(filePath)
      
      // Determine transcription settings based on quality mode
      const isAccurateMode = qualityMode === 'accurate'
      const usePrompt = isAccurateMode

      // Prepare high-quality transcription options
      const transcriptionOptions: any = {
        file: audioFile,
        model: "whisper-1", // Most accurate model available
        response_format: "verbose_json", // Get detailed metadata
        temperature: 0, // Deterministic output for consistency
        timestamp_granularities: ["segment"] // Get segment-level timestamps for better structure
      }

      // Add language for better accuracy
      if (meeting.language && meeting.language !== 'auto') {
        transcriptionOptions.language = meeting.language
        console.log(`Transcribing in specified language: ${meeting.language}`)
        
        // Add language-specific prompt for better results
        if (usePrompt) {
          transcriptionOptions.prompt = generateTranscriptionPrompt(meeting.language, meeting.originalFileName || undefined)
        }
      } else {
        console.log('Auto-detecting language for transcription')
        if (usePrompt) {
          transcriptionOptions.prompt = generateTranscriptionPrompt('en', meeting.originalFileName || undefined)
        }
      }

      console.log(`Starting ${qualityMode} transcription for meeting ${meetingId}`)
      
      // Transcribe using Whisper with retry logic
      let transcription: any
      let retryCount = 0
      const maxRetries = 2

      while (retryCount <= maxRetries) {
        try {
          transcription = await openai.audio.transcriptions.create(transcriptionOptions)
          break
        } catch (error: any) {
          retryCount++
          console.error(`Transcription attempt ${retryCount} failed:`, error.message)
          
          if (retryCount > maxRetries) {
            throw error
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
          
          // Create new file stream for retry
          transcriptionOptions.file = createReadStream(filePath)
        }
      }

      // Extract metadata from verbose response
      const transcriptionData = transcription as any
      const rawText = transcription.text || ""
      const detectedLanguage = transcriptionData.language || meeting.language || 'auto'
      const duration = transcriptionData.duration || null
      const segments = transcriptionData.segments || []

      console.log(`Raw transcription completed. Language: ${detectedLanguage}, Duration: ${duration}s, Segments: ${segments.length}`)

      // Process speaker diarization from segments
      const speakerSegments = processSpeakerSegments(segments)
      console.log(`Speaker diarization completed. Found ${speakerSegments.length} speaker segments`)
      console.log('Speaker segments preview:', speakerSegments.slice(0, 3).map(s => ({
        speaker: s.speaker,
        preview: s.text.substring(0, 80) + '...'
      })))

      // Validate transcription quality
      if (duration) {
        const qualityCheck = validateTranscriptionQuality(rawText, duration)
        if (!qualityCheck.isValid) {
          console.warn(`Transcription quality issues detected:`, qualityCheck.issues)
          // Log but don't fail - let the user decide
        }
      }

      // Post-process for better quality
      const cleanedText = cleanTranscript(rawText, detectedLanguage)
      
      // Prepare transcription metadata for debugging
      const transcriptionMetadata = {
        raw_text: rawText,
        detected_language: detectedLanguage,
        duration: duration,
        segments_count: segments.length,
        speaker_segments_count: speakerSegments.length,
        quality_mode: qualityMode,
        timestamp: new Date().toISOString(),
        model_used: "whisper-1",
        temperature: 0
      }

      console.log(`Post-processing completed. Original length: ${rawText.length}, Cleaned length: ${cleanedText.length}`)

      // Update meeting with high-quality transcript and speaker data
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          transcript: cleanedText,
          // transcriptSegments: JSON.stringify(speakerSegments), // TODO: Enable after resolving TypeScript types
          duration: duration ? Math.round(duration) : null,
          language: detectedLanguage,
          status: "TRANSCRIBED",
          // Store metadata in description field for debugging (can be separate field in production)
          description: meeting.description ? meeting.description : `Transcription metadata: ${JSON.stringify(transcriptionMetadata)}`
        },
      })

      // Start AI summary generation asynchronously
      fetch(`${process.env.NEXTAUTH_URL}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingId }),
      }).catch(console.error)

      console.log(`High-quality transcription completed for meeting ${meetingId}`)

      return NextResponse.json({
        message: "High-quality transcription completed",
        transcript: cleanedText,
        detectedLanguage: detectedLanguage,
        duration: duration,
        qualityMode: qualityMode,
        segmentsProcessed: segments.length
      })

    } catch (transcriptionError: any) {
      console.error("Transcription error:", transcriptionError)
      
      // Provide more specific error information
      let errorMessage = "Transcription failed"
      if (transcriptionError.message?.includes("audio")) {
        errorMessage = "Audio file processing failed - please check file format and quality"
      } else if (transcriptionError.message?.includes("token")) {
        errorMessage = "API authentication failed - please check OpenAI API key"
      } else if (transcriptionError.message?.includes("rate")) {
        errorMessage = "API rate limit exceeded - please try again in a few minutes"
      }
      
      // Update status to error with specific message
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { 
          status: "ERROR",
          description: `Transcription failed: ${errorMessage} (${new Date().toISOString()})`
        },
      })

      return NextResponse.json(
        { 
          error: errorMessage,
          details: transcriptionError.message 
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Transcribe API error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    )
  }
} 