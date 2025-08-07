import { NextRequest, NextResponse } from 'next/server'

interface ZoomWebhookEvent {
  event: string
  payload: {
    account_id?: string
    plainToken?: string // For validation challenge
    object?: ZoomRecordingData
  }
  event_ts?: number
}

interface ZoomRecordingData {
  id: string
  uuid: string
  account_id: string
  host_id: string
  host_email: string
  topic: string
  type: number
  start_time: string
  timezone: string
  duration: number
  total_size: number
  recording_count: number
  recording_files: ZoomRecordingFile[]
  participant_audio_files?: ZoomParticipantAudioFile[]
}

interface ZoomRecordingFile {
  id: string
  meeting_id: string
  recording_start: string
  recording_end: string
  file_type: string
  file_extension: string
  file_size: number
  play_url: string
  download_url: string
  status: string
  recording_type: string
}

interface ZoomParticipantAudioFile {
  id: string
  recording_start: string
  recording_end: string
  file_name: string
  file_type: string
  file_extension: string
  file_size: number
  play_url: string
  download_url: string
  status: string
}

// Handle different webhook events
const handleWebhookEvent = async (event: ZoomWebhookEvent) => {
  console.log(`🔄 Processing webhook event: ${event.event}`)

  switch (event.event) {
    case 'recording.completed':
      console.log(`📹 Recording completed for meeting: ${event.payload.object?.topic || 'Unknown'}`)
      console.log(`📊 Recording details:`, {
        meetingId: event.payload.object?.id,
        hostEmail: event.payload.object?.host_email,
        duration: event.payload.object?.duration,
        fileCount: event.payload.object?.recording_files?.length || 0
      })
      // TODO: Queue for processing when database integration is ready
      break
    
    case 'recording.transcript_completed':
      console.log(`📝 Transcript completed for meeting: ${event.payload.object?.topic || 'Unknown'}`)
      // TODO: Process transcript when ready
      break
    
    case 'recording.trashed':
      console.log(`🗑️ Recording trashed for meeting: ${event.payload.object?.id}`)
      // TODO: Mark recording as deleted when database integration is ready
      break
    
    case 'recording.deleted':
      console.log(`❌ Recording deleted for meeting: ${event.payload.object?.id}`)
      // TODO: Remove recording from database when integration is ready
      break
    
    default:
      console.log(`❓ Unhandled webhook event: ${event.event}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-zm-signature')
    const timestamp = request.headers.get('x-zm-request-timestamp')

    console.log('🚀 Zoom webhook received:', {
      timestamp: new Date().toISOString(),
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      bodyLength: body.length,
      userAgent: request.headers.get('user-agent') || 'Unknown'
    })

    // Parse the webhook event
    const event: ZoomWebhookEvent = JSON.parse(body)

    console.log('📋 Webhook event details:', {
      event: event.event,
      eventTimestamp: event.event_ts ? new Date(event.event_ts * 1000).toISOString() : 'N/A',
      accountId: event.payload?.account_id || 'N/A'
    })

    // ⚡ CRITICAL: Handle URL validation challenge (for webhook setup)
    if (event.event === 'endpoint.url_validation') {
      const challenge = event.payload?.plainToken
      if (challenge) {
        const response = { plainToken: challenge }
        console.log('✅ Validation challenge received, responding with:', response)
        console.log('🎯 This response will activate your Zoom app!')
        return NextResponse.json(response, { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } else {
        console.error('❌ Validation challenge missing plainToken')
        console.error('📋 Full payload:', event.payload)
        return NextResponse.json(
          { error: 'Missing plainToken in validation challenge' },
          { status: 400 }
        )
      }
    }

    // For non-validation events, signature verification is recommended
    if (!signature || !timestamp) {
      console.warn('⚠️ Missing webhook signature or timestamp for event:', event.event)
      console.warn('⚠️ In production, you should verify webhook signatures for security')
      // Continue processing but log the security concern
    }

    // Process the webhook event
    await handleWebhookEvent(event)

    console.log('✅ Webhook processed successfully:', event.event)
    return NextResponse.json({ 
      status: 'success',
      event: event.event,
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    console.error('📋 Request details:', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification and health checks
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const challenge = url.searchParams.get('challenge')
  
  console.log('🔍 GET request to webhook endpoint:', {
    challenge: !!challenge,
    timestamp: new Date().toISOString()
  })
  
  if (challenge) {
    console.log('✅ Responding to GET challenge:', challenge)
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({ 
    message: 'Zoom webhook endpoint is active',
    timestamp: new Date().toISOString(),
    url: 'https://www.clarnote.com/api/webhooks/zoom',
    status: 'ready_for_validation'
  })
} 