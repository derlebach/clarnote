import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Import the enhanced speaker diarization functions from transcribe route
function performEnhancedSpeakerDiarization(segments: any[]): any[] {
  if (!segments || segments.length === 0) return []
  
  console.log('👥 Regenerating speaker diarization...')
  
  const speakerSegments: any[] = []
  let currentSpeakerIndex = 0
  let lastEndTime = 0
  let consecutiveShortSegments = 0
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const text = segment.text?.trim() || ''
    const start = segment.start || 0
    const end = segment.end || 0
    const duration = end - start
    
    // Calculate silence gap between segments
    const silenceGap = start - lastEndTime
    let shouldChangeSpeaker = false
    
    // MAIN HEURISTIC: Long silence gaps (>1.5 seconds) for regeneration
    if (silenceGap > 1.5 && i > 0) {
      shouldChangeSpeaker = true
    }
    
    // SECONDARY HEURISTIC: Detect clear conversational responses
    if (i > 0 && silenceGap > 0.6) {
      const prevText = segments[i-1].text?.trim().toLowerCase() || ''
      const currentTextLower = text.toLowerCase()
      
      // Strong indicators of speaker change
      const strongIndicators = [
        // Direct responses
        /^(yes|no|yeah|nope|right|wrong|correct|incorrect)\b/i,
        /^(ano|ne|jo|jasně|správně|přesně)\b/i, // Czech
        /^(ja|nein|richtig|genau|stimmt)\b/i, // German
        /^(sí|no|exacto|correcto|cierto)\b/i, // Spanish
        /^(oui|non|exact|correct|d'accord)\b/i, // French
        
        // Questions (usually different speakers)
        /^(what|how|when|where|why|who|which)\b/i,
        /^(co|jak|kdy|kde|proč|kdo|který)\b/i, // Czech
        /^(was|wie|wann|wo|warum|wer|welcher)\b/i, // German
        /^(qué|cómo|cuándo|dónde|por qué|quién|cuál)\b/i, // Spanish
        /^(que|comment|quand|où|pourquoi|qui|quel)\b/i, // French
        
        // Interjections and reactions
        /^(oh|ah|wow|really|seriously|actually)\b/i,
        /^(aha|ach|vlastně|opravdu|skutečně)\b/i, // Czech
        /^(oh|ach|wirklich|tatsächlich|eigentlich)\b/i, // German
        /^(oh|ah|realmente|en serio|de verdad)\b/i, // Spanish
        /^(oh|ah|vraiment|sérieusement|en fait)\b/i, // French
        
        // Politeness markers (often indicate speaker changes)
        /^(thank you|thanks|please|sorry|excuse me)\b/i,
        /^(děkuji|díky|prosím|promiňte|omlouvám se)\b/i, // Czech
        /^(danke|bitte|entschuldigung|verzeihung)\b/i, // German
        /^(gracias|por favor|perdón|disculpe)\b/i, // Spanish
        /^(merci|s'il vous plaît|pardon|excusez-moi)\b/i, // French
      ]
      
      // Check if current text starts with a strong indicator
      if (strongIndicators.some(pattern => pattern.test(currentTextLower))) {
        shouldChangeSpeaker = true
      }
      
      // Question-answer pattern detection
      if (prevText.includes('?') && !currentTextLower.match(/^(what|how|when|where|why|who|co|jak|kdy|kde|proč|kdo)/)) {
        shouldChangeSpeaker = true
      }
    }
    
    // TERTIARY HEURISTIC: Detect dramatic changes in speech patterns
    if (i > 0 && silenceGap > 1.0) {
      const prevDuration = segments[i-1].end - segments[i-1].start
      const durationRatio = duration / Math.max(prevDuration, 0.1)
      
      // Very different speech durations might indicate different speakers
      if (durationRatio > 3 || durationRatio < 0.33) {
        shouldChangeSpeaker = true
      }
    }
    
    // QUATERNARY HEURISTIC: Handle very short segments (might be interruptions)
    if (duration < 0.5) {
      consecutiveShortSegments++
      if (consecutiveShortSegments > 2 && silenceGap > 0.4) {
        shouldChangeSpeaker = true
      }
    } else {
      consecutiveShortSegments = 0
    }
    
    // SPECIAL CASE: Overlapping speech (negative silence gap)
    if (silenceGap < -0.1) {
      shouldChangeSpeaker = true
    }
    
    // Apply speaker change
    if (shouldChangeSpeaker) {
      currentSpeakerIndex = (currentSpeakerIndex + 1) % 6 // Limit to 6 speakers for better UX
    }
    
    // Create speaker segment with better confidence scoring
    const segmentConfidence = segment.avg_logprob ? Math.max(0, (segment.avg_logprob + 1)) : 0.8
    const speakerConfidence = shouldChangeSpeaker ? Math.min(1, segmentConfidence + 0.1) : segmentConfidence
    
    speakerSegments.push({
      speaker: `speaker_${currentSpeakerIndex}`,
      text: text,
      start: start,
      end: end,
      confidence: speakerConfidence
    })
    
    lastEndTime = end
  }
  
  // Post-process to merge very short segments with same speaker
  const mergedSegments = mergeShortSegments(speakerSegments)
  
  const uniqueSpeakers = new Set(mergedSegments.map(s => s.speaker)).size
  console.log(`✅ Speaker regeneration completed: ${mergedSegments.length} segments, ${uniqueSpeakers} speakers detected`)
  
  return mergedSegments
}

// Helper function to merge very short segments with the same speaker
function mergeShortSegments(segments: any[]): any[] {
  if (segments.length === 0) return []
  
  const merged: any[] = []
  let currentSegment = { ...segments[0] }
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i]
    
    // If same speaker and very close in time (< 0.8 second gap), merge
    if (segment.speaker === currentSegment.speaker && 
        (segment.start - currentSegment.end) < 0.8) {
      // Merge segments
      currentSegment.text += ' ' + segment.text
      currentSegment.end = segment.end
      currentSegment.confidence = Math.max(currentSegment.confidence, segment.confidence)
    } else {
      // Different speaker or significant gap, save current and start new
      merged.push(currentSegment)
      currentSegment = { ...segment }
    }
  }
  
  // Don't forget the last segment
  merged.push(currentSegment)
  
  return merged
}

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

    let originalSegments = []
    
    // Try to get segments from transcriptSegments first, then generate from transcript
    if (meeting.transcriptSegments) {
      try {
        originalSegments = JSON.parse(meeting.transcriptSegments)
      } catch (e) {
        console.log('Failed to parse existing segments, will regenerate from transcript')
      }
    }
    
    // If no valid segments, try to create from transcript
    if (originalSegments.length === 0 && meeting.transcript) {
      console.log('No existing segments found, creating segments from transcript...')
      // Split transcript into sentences and create basic segments
      const sentences = meeting.transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
      originalSegments = sentences.map((text, index) => ({
        text: text.trim(),
        start: index * 5, // Fake timestamps - 5 seconds per sentence
        end: (index + 1) * 5,
        avg_logprob: -0.2 // Good confidence
      }))
    }
    
    if (originalSegments.length === 0) {
      return NextResponse.json(
        { error: "No transcript or segments available to regenerate speakers" },
        { status: 404 }
      )
    }

    console.log(`🔄 Regenerating speakers for ${originalSegments.length} segments...`)
    
    // Apply enhanced speaker diarization
    const newSpeakerSegments = performEnhancedSpeakerDiarization(originalSegments)
    
    // Update the meeting with the new speaker segments
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        transcriptSegments: JSON.stringify(newSpeakerSegments)
      },
    })

    const speakers = [...new Set(newSpeakerSegments.map(s => s.speaker))].sort()
    
    console.log(`✅ Speaker regeneration completed for meeting ${meetingId}:`, {
      originalSegments: originalSegments.length,
      newSegments: newSpeakerSegments.length,
      speakers: speakers
    })

    return NextResponse.json({
      success: true,
      segmentCount: newSpeakerSegments.length,
      speakers: speakers,
      originalSegmentCount: originalSegments.length,
      message: `✨ Regenerated ${newSpeakerSegments.length} speaker segments with ${speakers.length} distinct speakers. The speaker detection has been improved using advanced conversation analysis.`
    })

  } catch (error) {
    console.error('Regenerate speakers error:', error)
    return NextResponse.json({ 
      error: 'Failed to regenerate speaker segments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 