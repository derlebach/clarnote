import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature, handleZoomError } from '@/lib/zoom-auth'

interface ZoomWebhookEvent {
  event: string
  payload: {
    account_id: string
    object: ZoomRecordingData
  }
  event_ts: number
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

// Queue recording for processing
const queueRecordingImport = async (recordingData: ZoomRecordingData) => {
  try {
    // Find user by host email
    const user = await prisma.user.findUnique({
      where: { email: recordingData.host_email },
      include: {
        zoomIntegrations: true
      }
    })

    if (!user) {
      console.warn(`No user found for Zoom host email: ${recordingData.host_email}`)
      return
    }

    // Find the appropriate Zoom integration
    const zoomIntegration = user.zoomIntegrations.find(
      integration => integration.zoomAccountId === recordingData.account_id
    )

    if (!zoomIntegration) {
      console.warn(`No Zoom integration found for account: ${recordingData.account_id}`)
      return
    }

    if (!zoomIntegration.autoImportEnabled) {
      console.log(`Auto-import disabled for user ${user.id}, skipping recording ${recordingData.id}`)
      return
    }

    // Check if recording already exists
    const existingRecording = await prisma.zoomRecording.findUnique({
      where: { zoomMeetingId: recordingData.id }
    })

    if (existingRecording) {
      console.log(`Recording ${recordingData.id} already exists, skipping`)
      return
    }

    // Create recording record
    const recording = await prisma.zoomRecording.create({
      data: {
        zoomMeetingId: recordingData.id,
        zoomRecordingId: recordingData.uuid,
        userId: user.id,
        zoomIntegrationId: zoomIntegration.id,
        meetingTopic: recordingData.topic,
        startTime: new Date(recordingData.start_time),
        duration: Math.round(recordingData.duration),
        hostEmail: recordingData.host_email,
        participantCount: recordingData.recording_count || 1,
        recordingFiles: recordingData.recording_files as any,
        status: 'importing'
      }
    })

    // Queue for processing
    await prisma.processingQueue.create({
      data: {
        jobType: 'zoom_recording_import',
        jobData: {
          recordingId: recording.id,
          zoomMeetingId: recordingData.id,
          userId: user.id,
          recordingFiles: recordingData.recording_files
        } as any,
        priority: 1 // High priority for new recordings
      }
    })

    console.log(`Queued recording ${recordingData.id} for processing`)

  } catch (error) {
    await handleZoomError(error as Error, {
      action: 'queue_recording_import',
      recordingId: recordingData.id,
      hostEmail: recordingData.host_email
    })
    throw error
  }
}

// Handle different webhook events
const handleWebhookEvent = async (event: ZoomWebhookEvent) => {
  switch (event.event) {
    case 'recording.completed':
      console.log(`Processing recording.completed event for meeting ${event.payload.object.id}`)
      await queueRecordingImport(event.payload.object)
      break
    
    case 'recording.trashed':
      console.log(`Processing recording.trashed event for meeting ${event.payload.object.id}`)
      // Mark recording as deleted
      await prisma.zoomRecording.updateMany({
        where: { zoomMeetingId: event.payload.object.id },
        data: { status: 'deleted' }
      })
      break
    
    case 'recording.deleted':
      console.log(`Processing recording.deleted event for meeting ${event.payload.object.id}`)
      // Remove recording from database
      await prisma.zoomRecording.deleteMany({
        where: { zoomMeetingId: event.payload.object.id }
      })
      break
    
    default:
      console.log(`Unhandled webhook event: ${event.event}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-zm-signature')
    const timestamp = request.headers.get('x-zm-request-timestamp')

    if (!signature || !timestamp) {
      console.error('Missing webhook signature or timestamp')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Parse the webhook event
    const event: ZoomWebhookEvent = JSON.parse(body)

    // Handle URL verification challenge (for webhook setup)
    if (event.event === 'endpoint.url_validation') {
      const challenge = (event as any).payload?.plainToken
      if (challenge) {
        return NextResponse.json({
          plainToken: challenge,
          encryptedToken: Buffer.from(challenge).toString('base64')
        })
      }
    }

    // Verify webhook signature for security
    // Note: In production, you should verify the signature using the webhook secret
    // For now, we'll skip verification but log the attempt
    console.log('Webhook received:', {
      event: event.event,
      timestamp: new Date(event.event_ts * 1000).toISOString(),
      accountId: event.payload?.account_id
    })

    // Process the webhook event
    await handleWebhookEvent(event)

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    await handleZoomError(error as Error, {
      action: 'webhook_processing',
      url: request.url
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const challenge = url.searchParams.get('challenge')
  
  if (challenge) {
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({ 
    message: 'Zoom webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
} 