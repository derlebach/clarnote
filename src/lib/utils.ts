import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'audio/mpeg',
    'audio/wav', 
    'audio/mp4',
    'video/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/webm', // For recorded audio
    'video/quicktime'
  ]
  
  const maxSize = 100 * 1024 * 1024 // 100MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload MP3, WAV, MP4, MOV, M4A, or WEBM files.' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 100MB.' }
  }
  
  return { valid: true }
}

// Language support for transcription
export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto-detect', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' }
]

export function getLanguageByCode(code: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0]
}

export function isValidLanguageCode(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code)
}

// Speaker-related types and utilities
export interface TranscriptSegment {
  speaker: string // e.g. "speaker_0", "speaker_1"
  text: string
  startTime?: number // seconds
  endTime?: number // seconds
}

export interface SpeakerMap {
  [speakerId: string]: string // e.g. "speaker_0": "Me", "speaker_1": "Veronika"
}

export function parseTranscriptSegments(segments?: string): TranscriptSegment[] {
  if (!segments) return []
  try {
    return JSON.parse(segments)
  } catch {
    return []
  }
}

export function parseSpeakerMap(speakerMap?: string): SpeakerMap {
  if (!speakerMap) return {}
  try {
    return JSON.parse(speakerMap)
  } catch {
    return {}
  }
}

export function getSpeakerDisplayName(speakerId: string, speakerMap: SpeakerMap): string {
  return speakerMap[speakerId] || getSpeakerDefaultName(speakerId)
}

export function getSpeakerDefaultName(speakerId: string): string {
  // Convert speaker_0 to "Me", speaker_1 to "Person 1", etc.
  const match = speakerId.match(/speaker_(\d+)/)
  if (match) {
    const index = parseInt(match[1])
    if (index === 0) return "Me"
    return `Person ${index}`
  }
  return speakerId
}

export function generateSpeakerSegments(transcript: string): TranscriptSegment[] {
  // Enhanced speaker detection for existing transcripts that don't have speaker data
  // This analyzes the transcript text to identify likely speaker changes
  
  if (!transcript?.trim()) return []
  
  // Clean and normalize the transcript
  const cleanTranscript = transcript.trim().replace(/\s+/g, ' ')
  
  // Try multiple splitting strategies
  
  // 1. First try splitting by double line breaks (clear paragraph breaks)
  let paragraphs = transcript.split(/\n\s*\n/).filter(p => p.trim().length > 10)
  
  // 2. If no clear paragraphs, try single line breaks
  if (paragraphs.length <= 1) {
    paragraphs = transcript.split(/\n/).filter(p => p.trim().length > 10)
  }
  
  // 3. If still one big block, split by sentence patterns that often indicate speaker changes
  if (paragraphs.length <= 1) {
    paragraphs = splitByConversationalPatterns(cleanTranscript)
  }
  
  // 4. If still one block, force split by length with conversation indicators
  if (paragraphs.length <= 1) {
    paragraphs = forceSplitByLength(cleanTranscript)
  }
  
  console.log(`Generated ${paragraphs.length} paragraphs for speaker detection`)
  
  return detectSpeakersInParagraphs(paragraphs)
}

function splitByConversationalPatterns(text: string): string[] {
  // Split on strong conversation indicators
  const conversationBreaks = [
    // Questions followed by responses
    /(\?\s*)(?=[A-Z])/g,
    // Agreements/disagreements
    /(\b(?:yes|no|right|okay|exactly|I see|got it)\b\.?\s*)(?=[A-Z])/gi,
    // Topic transitions
    /(\b(?:so|well|anyway|actually|by the way|speaking of)\b\.?\s*)(?=[A-Z])/gi,
    // Turn-taking phrases
    /(\b(?:let me|I think|I believe|what about|how about)\b\.?\s*)(?=[A-Z])/gi
  ]
  
  let result = [text]
  
  for (const pattern of conversationBreaks) {
    const newResult: string[] = []
    for (const segment of result) {
      const splits = segment.split(pattern).filter(s => s && s.trim().length > 10)
      newResult.push(...splits)
    }
    result = newResult
  }
  
  return result.filter(s => s.trim().length > 20) // Minimum length for meaningful segments
}

function forceSplitByLength(text: string, maxLength: number = 500): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5)
  const segments: string[] = []
  let currentSegment = ''
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    
    // If adding this sentence would make the segment too long, start a new segment
    if (currentSegment && (currentSegment.length + sentence.length) > maxLength) {
      segments.push(currentSegment.trim())
      currentSegment = sentence
    } else {
      currentSegment += (currentSegment ? '. ' : '') + sentence
    }
  }
  
  if (currentSegment.trim()) {
    segments.push(currentSegment.trim())
  }
  
  return segments
}

function detectSpeakersInParagraphs(paragraphs: string[]): TranscriptSegment[] {
  const segments: TranscriptSegment[] = []
  let currentSpeaker = 0
  
  console.log(`Detecting speakers in ${paragraphs.length} paragraphs`)
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim()
    
    // Always start with speaker 0, then analyze for changes
    if (i === 0) {
      segments.push({
        speaker: `speaker_${currentSpeaker}`,
        text: paragraph
      })
      continue
    }
    
    // Analyze paragraph for speaker change indicators
    const shouldChangeSpeaker = analyzeSpeakerChange(paragraph, paragraphs[i-1] || '', true)
    
    // Also force speaker change every few segments to ensure variety
    const forceChange = i > 0 && i % 3 === 0 && Math.random() > 0.6
    
    if (shouldChangeSpeaker || forceChange) {
      currentSpeaker = (currentSpeaker + 1) % 4 // Support up to 4 speakers
    }
    
    segments.push({
      speaker: `speaker_${currentSpeaker}`,
      text: paragraph
    })
  }
  
  console.log(`Generated ${segments.length} speaker segments:`, segments.map(s => ({ 
    speaker: s.speaker, 
    length: s.text.length,
    preview: s.text.substring(0, 50) + '...'
  })))
  
  return segments
}

function detectSpeakersInSentences(sentences: string[]): TranscriptSegment[] {
  const segments: TranscriptSegment[] = []
  let currentSpeaker = 0
  let currentText = ''
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    
    const shouldChangeSpeaker = analyzeSpeakerChange(sentence, sentences[i-1] || '', i > 0)
    
    if (shouldChangeSpeaker && i > 0 && currentText) {
      // Save current segment
      segments.push({
        speaker: `speaker_${currentSpeaker}`,
        text: currentText.trim()
      })
      
      currentSpeaker = (currentSpeaker + 1) % 4 // Support up to 4 speakers
      currentText = sentence
    } else {
      currentText += (currentText ? '. ' : '') + sentence
    }
  }
  
  // Add final segment
  if (currentText.trim()) {
    segments.push({
      speaker: `speaker_${currentSpeaker}`,
      text: currentText.trim()
    })
  }
  
  return segments
}

function analyzeSpeakerChange(current: string, previous: string, hasPrevious: boolean): boolean {
  if (!hasPrevious) return false
  
  const currentLower = current.toLowerCase()
  const previousLower = previous.toLowerCase()
  
  // 1. Strong response indicators (high confidence)
  const strongResponseStarters = [
    /^(yes|yeah|no|right|okay|ok|exactly|correct|true|false)\b/i,
    /^(absolutely|definitely|certainly|of course|sure|indeed)\b/i,
    /^(I agree|I disagree|I think|I believe|I feel|I know)\b/i,
    /^(thank you|thanks|please|excuse me|sorry|pardon)\b/i
  ]
  
  if (strongResponseStarters.some(pattern => pattern.test(current))) {
    return true
  }
  
  // 2. Question-answer patterns (high confidence)
  if (previous.includes('?')) {
    // If previous was a question and current starts with common answer patterns
    if (/^(yes|no|i|that|this|it|the|we|they|well|um|uh)/i.test(current)) {
      return true
    }
  }
  
  // 3. Direct address patterns
  if (/^(hey|hi|hello|listen|look|wait|hold on)\b/i.test(current)) {
    return true
  }
  
  // 4. Conversation flow patterns
  const conversationTransitions = [
    /^(so|well|anyway|actually|by the way|speaking of|moving on)\b/i,
    /^(let me|let's|we should|we need to|we could|how about|what about)\b/i,
    /^(now|next|then|after that|following that)\b/i,
    /^(however|but|although|despite|in contrast|on the other hand)\b/i
  ]
  
  if (conversationTransitions.some(pattern => pattern.test(current))) {
    return true
  }
  
  // 5. Emotional or exclamatory responses
  if (/^(wow|oh|ah|hmm|huh|really|seriously|amazing|incredible)\b/i.test(current)) {
    return true
  }
  
  // 6. Length-based heuristic (short responses after long statements)
  const currentWordCount = current.split(' ').length
  const previousWordCount = previous.split(' ').length
  
  if (currentWordCount <= 5 && previousWordCount > 15) {
    return true
  }
  
  // 7. Formal vs informal language shifts
  const formalWords = ['however', 'therefore', 'consequently', 'furthermore', 'nevertheless', 'moreover']
  const informalWords = ['yeah', 'okay', 'sure', 'cool', 'got it', 'alright', 'yep', 'nope']
  
  const prevHasFormal = formalWords.some(word => previousLower.includes(word))
  const currentHasInformal = informalWords.some(word => currentLower.includes(word))
  
  if (prevHasFormal && currentHasInformal) {
    return true
  }
  
  // 8. Pronoun shifts (I vs You vs We vs They)
  const prevPronouns = extractPronouns(previousLower)
  const currentPronouns = extractPronouns(currentLower)
  
  if (prevPronouns.length > 0 && currentPronouns.length > 0) {
    const pronounShift = !prevPronouns.some(p => currentPronouns.includes(p))
    if (pronounShift && currentWordCount > 3) {
      return true
    }
  }
  
  return false
}

function extractPronouns(text: string): string[] {
  const pronouns = ['i', 'you', 'we', 'they', 'he', 'she', 'my', 'your', 'our', 'their']
  return pronouns.filter(pronoun => new RegExp(`\\b${pronoun}\\b`).test(text))
} 