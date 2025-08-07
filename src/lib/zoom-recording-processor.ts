import { prisma } from './prisma'
import { makeZoomApiRequest, handleZoomError, isRetryableError } from './zoom-auth'
import { Readable } from 'stream'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface ProcessingJob {
  id: string
  recordingId: string
  zoomMeetingId: string
  userId: string
  recordingFiles: ZoomRecordingFile[]
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

interface DownloadedFile {
  stream: Readable
  fileName: string
  fileType: string
  fileSize: number
  recordingType: string
  localPath?: string
}

// Create uploads directory if it doesn't exist
const ensureUploadsDir = async () => {
  const uploadsDir = join(process.cwd(), 'uploads', 'zoom-recordings')
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }
  return uploadsDir
}

// Download recording files from Zoom
export const downloadRecordingFiles = async (
  userId: string,
  recordingFiles: ZoomRecordingFile[]
): Promise<DownloadedFile[]> => {
  const downloadableFiles: DownloadedFile[] = []
  const uploadsDir = await ensureUploadsDir()

  for (const file of recordingFiles) {
    // Only download audio/video files
    if (!['MP4', 'M4A', 'WAV', 'MP3'].includes(file.file_type)) {
      console.log(`Skipping file type ${file.file_type} for recording ${file.meeting_id}`)
      continue
    }

    try {
      console.log(`Downloading ${file.file_type} file for meeting ${file.meeting_id}`)
      
      // Make authenticated request to download URL
      const response = await makeZoomApiRequest(userId, '', {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream'
        }
      })

      if (response.ok && response.body) {
        const fileName = `${file.meeting_id}_${file.id}.${file.file_extension.toLowerCase()}`
        const localPath = join(uploadsDir, fileName)

        // Save file to local storage
        const buffer = await response.arrayBuffer()
        await writeFile(localPath, Buffer.from(buffer))

        downloadableFiles.push({
          stream: Readable.from(Buffer.from(buffer)),
          fileName,
          fileType: file.file_type,
          fileSize: file.file_size,
          recordingType: file.recording_type,
          localPath
        })

        console.log(`Successfully downloaded ${fileName} (${file.file_size} bytes)`)
      }
    } catch (error) {
      console.error(`Failed to download file ${file.id}:`, error)
      await handleZoomError(error as Error, {
        action: 'download_recording_file',
        fileId: file.id,
        meetingId: file.meeting_id,
        userId
      })
    }
  }

  return downloadableFiles
}

// Extract metadata from recording
export const extractMeetingMetadata = async (recordingData: any) => {
  return {
    meetingId: recordingData.id,
    topic: recordingData.topic,
    startTime: new Date(recordingData.start_time),
    duration: recordingData.duration,
    hostEmail: recordingData.host_email,
    participantCount: recordingData.recording_count || 1,
    timezone: recordingData.timezone,
    totalSize: recordingData.total_size
  }
}

// Start transcription process
export const startTranscription = async (file: DownloadedFile): Promise<string> => {
  if (!file.localPath) {
    throw new Error('File must be saved locally before transcription')
  }

  // Create a transcription job (this would integrate with your existing transcription system)
  const transcriptionJobId = `zoom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Queue transcription job
  await prisma.processingQueue.create({
    data: {
      jobType: 'transcription',
      jobData: {
        filePath: file.localPath,
        fileName: file.fileName,
        fileType: file.fileType,
        transcriptionJobId
      },
      priority: 2 // Normal priority for transcription
    }
  })

  console.log(`Queued transcription job ${transcriptionJobId} for file ${file.fileName}`)
  return transcriptionJobId
}

// Save recording to database
export const saveRecording = async (recordingData: any) => {
  return await prisma.zoomRecording.update({
    where: { id: recordingData.id },
    data: {
      transcriptionJobId: recordingData.transcriptionJobId,
      status: recordingData.status,
      updatedAt: new Date()
    }
  })
}

// Notify user about recording import
export const notifyUserRecordingImported = async (userId: string, recordingData: any) => {
  // This could integrate with your notification system
  console.log(`Recording imported for user ${userId}: ${recordingData.topic}`)
  
  // You could add email notifications, push notifications, etc. here
  // For now, we'll just log it
}

// Handle recording processing errors
export const handleRecordingError = async (recordingData: any, error: Error) => {
  const errorLog = {
    recordingId: recordingData.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date(),
    retryCount: recordingData.retryCount || 0
  }

  // Update recording with error
  await prisma.zoomRecording.update({
    where: { id: recordingData.id },
    data: {
      processingError: error.message,
      retryCount: errorLog.retryCount + 1,
      status: 'failed'
    }
  })

  // Retry logic for transient errors
  if (isRetryableError(error) && errorLog.retryCount < 3) {
    await scheduleRetry(recordingData, errorLog.retryCount + 1)
  } else {
    // Alert admin for manual intervention
    console.error(`Failed to process Zoom recording after ${errorLog.retryCount} retries:`, {
      recordingId: recordingData.id,
      error: error.message
    })
  }
}

// Schedule retry for failed recording
const scheduleRetry = async (recordingData: any, retryCount: number) => {
  const delayMinutes = Math.pow(2, retryCount) * 5 // Exponential backoff: 5, 10, 20 minutes
  const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000)

  await prisma.processingQueue.create({
    data: {
      jobType: 'zoom_recording_retry',
      jobData: {
        recordingId: recordingData.id,
        retryCount
      },
      scheduledAt,
      priority: 3 // Lower priority for retries
    }
  })

  console.log(`Scheduled retry ${retryCount} for recording ${recordingData.id} in ${delayMinutes} minutes`)
}

// Main recording processing function
export const processRecording = async (job: ProcessingJob) => {
  try {
    console.log(`Processing recording ${job.zoomMeetingId} for user ${job.userId}`)

    // Update status to processing
    await prisma.zoomRecording.update({
      where: { id: job.recordingId },
      data: { status: 'processing' }
    })

    // 1. Download recording file(s)
    const recordingFiles = await downloadRecordingFiles(job.userId, job.recordingFiles)
    
    if (recordingFiles.length === 0) {
      throw new Error('No downloadable recording files found')
    }

    // 2. Start transcription for the primary audio/video file
    const primaryFile = recordingFiles.find(f => 
      f.recordingType === 'shared_screen_with_speaker_view' || 
      f.recordingType === 'speaker_view' ||
      f.fileType === 'MP4'
    ) || recordingFiles[0]

    const transcriptionJobId = await startTranscription(primaryFile)

    // 3. Update recording with transcription job ID
    await prisma.zoomRecording.update({
      where: { id: job.recordingId },
      data: {
        transcriptionJobId,
        transcriptionStatus: 'processing',
        status: 'completed'
      }
    })

    // 4. Notify user (optional)
    await notifyUserRecordingImported(job.userId, {
      id: job.recordingId,
      topic: 'Recording imported successfully'
    })

    console.log(`Successfully processed recording ${job.zoomMeetingId}`)

  } catch (error) {
    console.error(`Error processing recording ${job.zoomMeetingId}:`, error)
    await handleRecordingError({ id: job.recordingId }, error as Error)
    throw error
  }
}

// Process queued jobs
export const processQueuedJobs = async () => {
  const jobs = await prisma.processingQueue.findMany({
    where: {
      status: 'pending',
      scheduledAt: {
        lte: new Date()
      }
    },
    orderBy: [
      { priority: 'asc' },
      { createdAt: 'asc' }
    ],
    take: 5 // Process 5 jobs at a time
  })

  for (const job of jobs) {
    try {
      // Mark job as processing
      await prisma.processingQueue.update({
        where: { id: job.id },
        data: {
          status: 'processing',
          startedAt: new Date(),
          attempts: job.attempts + 1
        }
      })

      // Process based on job type
      switch (job.jobType) {
        case 'zoom_recording_import':
          await processRecording(job.jobData as ProcessingJob)
          break
        
        case 'zoom_recording_retry':
          const retryData = job.jobData as { recordingId: string; retryCount: number }
          const recording = await prisma.zoomRecording.findUnique({
            where: { id: retryData.recordingId }
          })
          if (recording) {
            await processRecording({
              id: job.id,
              recordingId: recording.id,
              zoomMeetingId: recording.zoomMeetingId,
              userId: recording.userId,
              recordingFiles: recording.recordingFiles as ZoomRecordingFile[]
            })
          }
          break
        
        default:
          console.log(`Unknown job type: ${job.jobType}`)
      }

      // Mark job as completed
      await prisma.processingQueue.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      })

    } catch (error) {
      console.error(`Job ${job.id} failed:`, error)
      
      // Mark job as failed
      await prisma.processingQueue.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: (error as Error).message,
          completedAt: new Date()
        }
      })
    }
  }

  return jobs.length
} 