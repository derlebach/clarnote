import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(`Starting transcription for ${file.name} (${file.size} bytes)`)

    // TODO: Replace with your actual WhisperX backend endpoint
    // Options: Modal, RunPod, or custom GPU server
    const whisperXEndpoint = process.env.WHISPERX_ENDPOINT || 'https://your-whisperx-backend.com/transcribe'

    // Forward the file to WhisperX backend
    const transcriptionFormData = new FormData()
    transcriptionFormData.append('file', file)
    
    // Add optional parameters for WhisperX
    transcriptionFormData.append('language', 'auto') // or specific language code
    transcriptionFormData.append('task', 'transcribe') // or 'translate'
    
    console.log(`Sending file to WhisperX backend: ${whisperXEndpoint}`)

    const res = await fetch(whisperXEndpoint, {
      method: 'POST',
      body: transcriptionFormData,
      headers: {
        // Add any required API keys for your WhisperX backend
        'Authorization': `Bearer ${process.env.WHISPERX_API_KEY || ''}`,
      },
    })

    if (!res.ok) {
      console.error(`WhisperX API error: ${res.status} ${res.statusText}`)
      return NextResponse.json({ 
        error: 'Transcription service unavailable', 
        details: `Backend returned ${res.status}`
      }, { status: 500 })
    }

    const data = await res.json()
    console.log('Transcription completed successfully')

    // Return standardized response format
    // WhisperX typically returns: { text: string, segments: [...], language: string }
    return NextResponse.json({
      text: data.text || data.transcript || '',
      segments: data.segments || [],
      language: data.language || 'unknown',
      duration: data.duration || 0,
      success: true
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ 
      error: 'Internal transcription error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 