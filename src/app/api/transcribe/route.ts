import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"
import { createReadStream } from "fs"
import { join } from "path"

// Initialize OpenAI client conditionally to prevent build failures
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured')
  }
  return new OpenAI({ apiKey })
}

// CRITICAL: Language code mapping to ensure OpenAI compatibility
function normalizeLanguageCode(language: string): string {
  // Map common language name variations to ISO-639-1 codes
  const languageMap: Record<string, string> = {
    'czech': 'cs',
    'english': 'en', 
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'russian': 'ru',
    'japanese': 'ja',
    'korean': 'ko',
    'chinese': 'zh',
    'hindi': 'hi',
    'arabic': 'ar',
    'dutch': 'nl',
    'polish': 'pl',
    'swedish': 'sv',
    'danish': 'da',
    'norwegian': 'no',
    'finnish': 'fi'
  }
  
  // If it's already a valid 2-letter code, return as is
  if (language.length === 2) {
    return language.toLowerCase()
  }
  
  // Otherwise, try to map from the language name
  return languageMap[language.toLowerCase()] || language
}

// Post-processing utilities for improving transcription quality
function cleanTranscript(text: string, language: string): string {
  if (!text) return text

  let cleaned = text.trim()

  // CRITICAL: Remove repetitive patterns that indicate hallucination
  // Check for repeated phrases (common in hallucinated transcripts)
  const words = cleaned.split(/\s+/)
  if (words.length > 10) {
    // Look for patterns where the same sequence repeats
    for (let patternLength = 3; patternLength <= 20; patternLength++) {
      if (words.length > patternLength * 3) {
        const firstPattern = words.slice(0, patternLength).join(' ')
        const nextPattern = words.slice(patternLength, patternLength * 2).join(' ')
        
        // If we find a repeating pattern, try to extract just the first occurrence
        if (firstPattern === nextPattern) {
          console.warn(`Detected repeating pattern of length ${patternLength}, attempting to clean`)
          // Find where the repetition starts and keep only the content before it
          const nonRepeatingPart = findNonRepeatingPortion(cleaned)
          if (nonRepeatingPart && nonRepeatingPart.length > 50) {
            cleaned = nonRepeatingPart
            break
          }
        }
      }
    }
  }

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

  // Language-specific filler words
  let fillerWords = ['um', 'uh', 'er', 'ah', 'hmm', 'ehm']
  if (language === 'cs') {
    fillerWords = [...fillerWords, 'ehm', 'no', 'tak', 'prostě'] // Czech fillers
  }
  
  const fillerPattern = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi')
  cleaned = cleaned.replace(fillerPattern, '').replace(/\s+/g, ' ').trim()

  // Language-specific improvements
  if (language === 'en') {
    cleaned = cleaned.replace(/\bi\b/g, 'I') // Capitalize standalone 'i'
  }

  // Ensure proper sentence ending
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.'
  }

  return cleaned
}

function findNonRepeatingPortion(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  // Try to find the point where repetition starts
  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      if (sentences[i].trim() === sentences[j].trim()) {
        // Found repetition, return everything before it
        return sentences.slice(0, i + 1).join('. ').trim()
      }
    }
  }
  
  // If no exact sentence repetition, try word-level
  const words = text.split(/\s+/)
  const firstThird = words.slice(0, Math.floor(words.length / 3)).join(' ')
  const restOfText = text.substring(firstThird.length)
  
  if (restOfText.includes(firstThird)) {
    return firstThird
  }
  
  return text // Return original if no clear pattern found
}

// CRITICAL: Much stricter validation to catch hallucinations
function validateTranscriptionQuality(text: string, duration: number): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (!text || text.trim().length === 0) {
    issues.push("CRITICAL: Empty transcription")
    return { isValid: false, issues }
  }

  const wordCount = text.trim().split(/\s+/).length
  const wordsPerSecond = wordCount / Math.max(duration, 1)

  // Check for reasonable speech rate - RELAXED LIMITS for real speech
  if (wordsPerSecond > 12) { // Increased from 8 - some people speak very fast
    issues.push("CRITICAL: Speech rate extremely fast - likely hallucination")
    return { isValid: false, issues }
  }
  if (wordsPerSecond < 0.2 && duration > 60) { // Only flag if very long and very sparse
    issues.push("CRITICAL: Transcription incomplete")
    return { isValid: false, issues }
  }

  // CRITICAL: Much stricter repetition detection  
  const words = text.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words)
  const repetitionRatio = uniqueWords.size / words.length
  
  // Immediate rejection for extreme repetition (hallucination indicator)
  if (repetitionRatio < 0.1 && words.length > 20) { // Keep this strict - clear hallucination
    issues.push("CRITICAL: Extreme repetition detected - clear hallucination")
    return { isValid: false, issues }
  }
  
  // More lenient threshold for high repetition
  if (repetitionRatio < 0.25 && words.length > 100) { // Relaxed from 0.4
    issues.push("WARNING: High repetition detected, may indicate transcription errors")
    // Don't return false - just warn
  }

  // CRITICAL: Check for phrase repetition patterns (50+ character phrases)
  for (let i = 0; i < Math.min(3, text.length - 50); i++) {
    const phraseLength = 50 + (i * 25) // Check 50, 75, 100 character phrases
    const phrase = text.substring(i, Math.min(i + phraseLength, text.length))
    const restOfText = text.substring(i + phraseLength)
    
    if (phrase.length >= 50 && restOfText.includes(phrase)) {
      issues.push("CRITICAL: Identical phrase repetition detected - transcript corrupted")
      return { isValid: false, issues }
    }
  }

  // CRITICAL: Check for obvious AI hallucination patterns
  const hallucination_patterns = [
    /(.{20,})\s*\1\s*\1/i, // Same 20+ char phrase repeated 3+ times
    /(terminologi[aeí].*){8,}/i, // "terminologia" repeated many times 
    /(.{10,})\s*\1\s*\1\s*\1\s*\1/i, // Same 10+ char phrase repeated 5+ times
  ]
  
  for (const pattern of hallucination_patterns) {
    if (pattern.test(text)) {
      issues.push("CRITICAL: Hallucination pattern detected - AI generated nonsense")
      return { isValid: false, issues }
    }
  }

  // Check for proper sentence structure
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length === 0 && text.length > 100) {
    issues.push("WARNING: No proper sentence structure detected")
  }

  // CRITICAL: Any critical issue means immediate rejection
  const hasCriticalIssues = issues.some(issue => issue.includes("CRITICAL"))
  return { isValid: !hasCriticalIssues, issues }
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
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      )
    }

    const openai = getOpenAIClient()
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
        transcriptionOptions.language = normalizeLanguageCode(meeting.language)
        console.log(`Transcribing in specified language: ${meeting.language} -> ${transcriptionOptions.language}`)
        
        // Add language-specific prompt for better results
        if (usePrompt) {
          transcriptionOptions.prompt = generateTranscriptionPrompt(transcriptionOptions.language, meeting.originalFileName || undefined)
        }
      } else {
        console.log('Auto-detecting language for transcription')
        if (usePrompt) {
          transcriptionOptions.prompt = generateTranscriptionPrompt('en', meeting.originalFileName || undefined)
        }
      }

      // CRITICAL: Enhanced transcription with emergency fallback
      let transcription: any
      let retryCount = 0
      const maxRetries = 2 // Reduced from 3 to speed up process
      const emergencyOptions = [
        // Standard attempt
        { ...transcriptionOptions },
        // Emergency attempt without language specification  
        { ...transcriptionOptions, language: undefined, prompt: undefined },
        // Final attempt - minimal options with higher temperature
        { file: transcriptionOptions.file, model: "whisper-1", response_format: "text", temperature: 0.2 }
      ]

      console.log(`🚀 Starting transcription for meeting ${meetingId} (${Math.round((meeting.fileSize || 0) / 1024 / 1024)}MB)`)
      
      while (retryCount <= maxRetries) {
        try {
          const currentOptions = emergencyOptions[Math.min(retryCount, emergencyOptions.length - 1)]
          console.log(`⏱️ Transcription attempt ${retryCount + 1}/${maxRetries + 1} with options:`, {
            hasLanguage: !!currentOptions.language,
            hasPrompt: !!currentOptions.prompt,
            temperature: currentOptions.temperature,
            format: currentOptions.response_format
          })
          
          const startTime = Date.now()
          transcription = await openai.audio.transcriptions.create(currentOptions)
          const transcriptionTime = (Date.now() - startTime) / 1000
          console.log(`⚡ Transcription completed in ${transcriptionTime}s`)
          
          // CRITICAL: Validate quality immediately after transcription
          if (transcription.text) {
            const qualityCheck = validateTranscriptionQuality(transcription.text, meeting.duration || 0)
            
            if (!qualityCheck.isValid) {
              console.error(`❌ Transcription attempt ${retryCount + 1} failed quality check:`, qualityCheck.issues)
              
              if (retryCount < maxRetries) {
                console.log(`🔄 Retrying with emergency settings...`)
                retryCount++
                continue
              } else {
                // Final attempt failed - set meeting to ERROR status
                console.error(`🚨 All transcription attempts failed after ${maxRetries + 1} tries`)
                await prisma.meeting.update({
                  where: { id: meetingId },
                  data: { 
                    status: "ERROR",
                    description: `Transcription failed quality validation: ${qualityCheck.issues.join(', ')}`
                  },
                })
                
                return NextResponse.json(
                  { 
                    error: "Transcription quality validation failed",
                    details: qualityCheck.issues.join(', '),
                    suggestion: "Please try uploading a clearer audio file or try a different quality mode"
                  },
                  { status: 500 }
                )
              }
            } else {
              console.log(`✅ Transcription passed quality validation on attempt ${retryCount + 1}`)
              break // Success!
            }
          }
          
          break
        } catch (error: any) {
          retryCount++
          console.error(`❌ Transcription attempt ${retryCount} failed:`, error.message)
          
          if (retryCount > maxRetries) {
            // Update meeting status to ERROR
            console.error(`🚨 All transcription attempts failed with errors after ${maxRetries + 1} tries`)
            await prisma.meeting.update({
              where: { id: meetingId },
              data: { 
                status: "ERROR",
                description: `Transcription failed after ${maxRetries + 1} attempts: ${error.message}`
              },
            })
            throw error
          }
          
          // Wait before retry (exponential backoff)  
          const waitTime = Math.pow(2, retryCount) * 1000
          console.log(`⏳ Waiting ${waitTime/1000}s before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          
          // Create new file stream for retry
          emergencyOptions.forEach(option => {
            if (option.file) {
              option.file = createReadStream(filePath)
            }
          })
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
          console.error(`CRITICAL transcription quality issues detected:`, qualityCheck.issues)
          
          // For critical issues, reject the transcript and update meeting status
          await prisma.meeting.update({
            where: { id: meetingId },
            data: { 
              status: "ERROR",
              description: `Transcription failed due to quality issues: ${qualityCheck.issues.join(', ')}. The audio may be corrupted or too unclear for accurate transcription. Please try uploading a clearer audio file.`
            },
          })

          return NextResponse.json({
            error: "Transcription quality validation failed",
            issues: qualityCheck.issues,
            suggestion: "The audio quality may be too poor for accurate transcription. Please try uploading a clearer audio file or check if the audio contains actual speech content."
          }, { status: 422 })
        } else if (qualityCheck.issues.length > 0) {
          console.warn(`Transcription quality warnings:`, qualityCheck.issues)
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
          transcriptSegments: JSON.stringify(speakerSegments),
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