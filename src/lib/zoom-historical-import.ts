import { prisma } from './prisma'
import { makeZoomApiRequest, handleZoomError } from './zoom-auth'

interface ZoomRecordingsResponse {
  page_count: number
  page_number: number
  page_size: number
  total_records: number
  next_page_token?: string
  meetings: ZoomMeetingRecording[]
}

interface ZoomMeetingRecording {
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

interface ImportProgress {
  total: number
  processed: number
  failed: number
  eta?: string
}

// Import historical recordings for a user
export const importHistoricalRecordings = async (
  userId: string,
  fromDate: string,
  toDate: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<number> => {
  try {
    console.log(`Starting historical import for user ${userId} from ${fromDate} to ${toDate}`)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { zoomIntegrations: true }
    })

    if (!user || user.zoomIntegrations.length === 0) {
      throw new Error('No Zoom integration found for user')
    }

    const zoomIntegration = user.zoomIntegrations[0] // Use first integration

    let recordings: ZoomMeetingRecording[] = []
    let nextPageToken = ''
    let totalRecordings = 0

    // Fetch all recordings with pagination
    do {
      const queryParams = new URLSearchParams({
        from: fromDate,
        to: toDate,
        page_size: '300',
        ...(nextPageToken && { next_page_token: nextPageToken })
      })

      const response = await makeZoomApiRequest(
        userId,
        `/users/${user.email}/recordings?${queryParams.toString()}`
      )

      const data: ZoomRecordingsResponse = await response.json()
      
      if (data.meetings) {
        recordings = recordings.concat(data.meetings)
        totalRecordings = data.total_records
      }
      
      nextPageToken = data.next_page_token || ''

      // Update progress
      if (onProgress) {
        onProgress({
          total: totalRecordings,
          processed: recordings.length,
          failed: 0
        })
      }

    } while (nextPageToken)

    console.log(`Found ${recordings.length} recordings for import`)

    // Process each recording
    let processedCount = 0
    let failedCount = 0

    for (const recording of recordings) {
      try {
        // Check if recording already exists
        const existingRecording = await prisma.zoomRecording.findUnique({
          where: { zoomMeetingId: recording.id }
        })

        if (existingRecording) {
          console.log(`Recording ${recording.id} already exists, skipping`)
          processedCount++
          continue
        }

        // Create recording record
        await prisma.zoomRecording.create({
          data: {
            zoomMeetingId: recording.id,
            zoomRecordingId: recording.uuid,
            userId: user.id,
            zoomIntegrationId: zoomIntegration.id,
            meetingTopic: recording.topic,
            startTime: new Date(recording.start_time),
            duration: Math.round(recording.duration),
            hostEmail: recording.host_email,
            participantCount: recording.recording_count || 1,
            recordingFiles: recording.recording_files,
            status: 'importing'
          }
        })

        // Queue for processing
        await prisma.processingQueue.create({
          data: {
            jobType: 'zoom_recording_import',
            jobData: {
              recordingId: recording.id,
              zoomMeetingId: recording.id,
              userId: user.id,
              recordingFiles: recording.recording_files
            },
            priority: 2 // Normal priority for historical imports
          }
        })

        processedCount++

        // Update progress
        if (onProgress) {
          onProgress({
            total: recordings.length,
            processed: processedCount,
            failed: failedCount
          })
        }

        // Add small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Failed to import recording ${recording.id}:`, error)
        failedCount++
        
        await handleZoomError(error as Error, {
          action: 'historical_import',
          recordingId: recording.id,
          userId
        })
      }
    }

    // Update integration last sync time
    await prisma.zoomIntegration.update({
      where: { id: zoomIntegration.id },
      data: { lastSyncAt: new Date() }
    })

    console.log(`Historical import completed: ${processedCount} processed, ${failedCount} failed`)
    return processedCount

  } catch (error) {
    console.error('Historical import failed:', error)
    await handleZoomError(error as Error, {
      action: 'historical_import_batch',
      userId,
      fromDate,
      toDate
    })
    throw error
  }
}

// Get import progress for a user
export const getImportProgress = async (userId: string): Promise<ImportProgress | null> => {
  try {
    const pendingJobs = await prisma.processingQueue.count({
      where: {
        jobType: 'zoom_recording_import',
        jobData: {
          path: ['userId'],
          equals: userId
        },
        status: 'pending'
      }
    })

    const processingJobs = await prisma.processingQueue.count({
      where: {
        jobType: 'zoom_recording_import',
        jobData: {
          path: ['userId'],
          equals: userId
        },
        status: 'processing'
      }
    })

    const completedJobs = await prisma.processingQueue.count({
      where: {
        jobType: 'zoom_recording_import',
        jobData: {
          path: ['userId'],
          equals: userId
        },
        status: 'completed'
      }
    })

    const failedJobs = await prisma.processingQueue.count({
      where: {
        jobType: 'zoom_recording_import',
        jobData: {
          path: ['userId'],
          equals: userId
        },
        status: 'failed'
      }
    })

    const total = pendingJobs + processingJobs + completedJobs + failedJobs
    
    if (total === 0) {
      return null
    }

    return {
      total,
      processed: completedJobs,
      failed: failedJobs
    }

  } catch (error) {
    console.error('Failed to get import progress:', error)
    return null
  }
}

// Get available date ranges for import
export const getAvailableRecordingsDateRange = async (userId: string): Promise<{
  earliest: string | null
  latest: string | null
  count: number
}> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get recordings from the last 6 months by default (Zoom's typical retention)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const fromDate = sixMonthsAgo.toISOString().split('T')[0]
    const toDate = new Date().toISOString().split('T')[0]

    const response = await makeZoomApiRequest(
      userId,
      `/users/${user.email}/recordings?from=${fromDate}&to=${toDate}&page_size=1`
    )

    const data: ZoomRecordingsResponse = await response.json()

    return {
      earliest: fromDate,
      latest: toDate,
      count: data.total_records || 0
    }

  } catch (error) {
    console.error('Failed to get available recordings date range:', error)
    return {
      earliest: null,
      latest: null,
      count: 0
    }
  }
}

// Cancel ongoing import
export const cancelImport = async (userId: string): Promise<void> => {
  try {
    await prisma.processingQueue.updateMany({
      where: {
        jobType: 'zoom_recording_import',
        jobData: {
          path: ['userId'],
          equals: userId
        },
        status: 'pending'
      },
      data: {
        status: 'cancelled'
      }
    })

    console.log(`Cancelled pending import jobs for user ${userId}`)

  } catch (error) {
    console.error('Failed to cancel import:', error)
    throw error
  }
} 