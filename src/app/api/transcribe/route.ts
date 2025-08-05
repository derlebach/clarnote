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

    console.log(`Starting WhisperX transcription for ${file.name} (${file.size} bytes)`)

    // Get WhisperX endpoint from environment
    const whisperXEndpoint = process.env.WHISPERX_ENDPOINT
    
    if (!whisperXEndpoint) {
      console.error('WHISPERX_ENDPOINT not configured')
      return NextResponse.json({ 
        error: 'WhisperX service not configured. Please set WHISPERX_ENDPOINT environment variable.' 
      }, { status: 500 })
    }

    // Convert file to buffer for transmission
    const fileBuffer = await file.arrayBuffer()
    const fileBytes = new Uint8Array(fileBuffer)

    // Prepare request data for Modal endpoint
    const requestData = {
      file: Array.from(fileBytes), // Convert to array for JSON serialization
      language: formData.get('language') || 'auto',
      task: formData.get('task') || 'transcribe'
    }

    console.log(`Sending file to WhisperX backend: ${whisperXEndpoint}`)

    const response = await fetch(whisperXEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHISPERX_API_KEY || ''}`,
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`WhisperX API error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json({ 
        error: 'WhisperX transcription failed', 
        details: `Backend returned ${response.status}: ${errorText}`
      }, { status: 500 })
    }

    const data = await response.json()
    
    if (!data.success) {
      console.error('WhisperX transcription failed:', data.error)
      return NextResponse.json({ 
        error: 'Transcription failed', 
        details: data.error 
      }, { status: 500 })
    }

    console.log('✅ WhisperX transcription completed successfully')
    console.log(`Language: ${data.language}, Duration: ${data.duration}s, Segments: ${data.segments?.length || 0}`)

    // Return standardized response format compatible with frontend
    return NextResponse.json({
      text: data.text || '',
      segments: data.segments || [],
      language: data.language || 'unknown',
      duration: data.duration || 0,
      success: true,
      model: data.model || 'whisperx',
      features: data.features || {}
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ 
      error: 'Internal transcription error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 