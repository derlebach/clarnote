"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SUPPORTED_LANGUAGES, getLanguageByCode } from "@/lib/utils"
import ProfileMenu from '@/components/ProfileMenu'
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import Image from "next/image"
import Navbar from '@/components/Navbar';

interface Meeting {
  id: string
  title: string
  description?: string
  tags: string[]
  duration?: number
  status: string
  createdAt: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("auto")
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const fetchMeetings = useCallback(async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch('/api/meetings')
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      } else {
        console.error('Failed to fetch meetings')
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session?.user) {
      fetchMeetings()
    }
  }, [session, fetchMeetings])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Basic file type validation
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac',
      'audio/ogg', 'audio/webm', 'video/mp4', 'video/webm', 'video/quicktime'
    ]
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm', 'mp4', 'mov', 'avi']
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      alert('Please select a valid audio or video file (MP3, WAV, M4A, MP4, etc.)')
      return
    }

    // File size validation (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB')
      return
    }

    setSelectedFile(file)
    // Auto-generate title from filename
    if (!uploadTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      setUploadTitle(nameWithoutExt)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      setRecordedChunks([])
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data])
        }
      }
      
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      setRecordingTimer(timer)

      // Haptic feedback on mobile
      if (Capacitor.isNativePlatform()) {
        Haptics.impact({ style: ImpactStyle.Medium })
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingTimer) {
        clearInterval(recordingTimer)
        setRecordingTimer(null)
      }

      // Haptic feedback on mobile
      if (Capacitor.isNativePlatform()) {
        Haptics.impact({ style: ImpactStyle.Light })
      }
    }
  }

  const processRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' })
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
      handleFileSelect(file)
      setRecordedChunks([])
      setRecordingTime(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * NEW SIGNED URL UPLOAD FLOW
   * 1. Get signed URL from /api/upload-url
   * 2. Upload file directly to Supabase Storage using signed URL
   * 3. Create meeting record with storage path
   */
  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) {
      alert('Please select a file and provide a title')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Step 1: Get signed upload URL
      console.log('Upload - Requesting signed URL for:', selectedFile.name)
      setUploadProgress(10)

      const uploadUrlResponse = await fetch('/api/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fileName: selectedFile.name,
          mime: selectedFile.type || 'application/octet-stream'
        })
      })

      if (!uploadUrlResponse.ok) {
        const error = await uploadUrlResponse.json()
        throw new Error(error.error || 'Failed to get upload URL')
      }

      const { bucket, path, signedUrl, mime } = await uploadUrlResponse.json()
      console.log('Upload - Received signed URL for path:', path)
      setUploadProgress(25)

      // Step 2: Upload file directly to Supabase Storage using signed URL
      console.log('Upload - Starting direct upload to Supabase Storage')
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': mime,
        }
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('Upload - Storage upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText
        })
        throw new Error(`Storage upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      console.log('Upload - File successfully uploaded to storage')
      setUploadProgress(75)

      // Step 3: Create meeting record with storage path
      console.log('Upload - Creating meeting record')
      const requestBody = new FormData()
      requestBody.append('title', uploadTitle.trim())
      requestBody.append('description', '')
      requestBody.append('tags', '')
      requestBody.append('language', selectedLanguage)
      requestBody.append('storagePath', path) // Use the storage path from signed URL
      requestBody.append('originalFileName', selectedFile.name)
      requestBody.append('fileSize', String(selectedFile.size))

      const meetingResponse = await fetch('/api/upload', {
        method: 'POST',
        body: requestBody,
        credentials: 'include',
      })

      if (!meetingResponse.ok) {
        const error = await meetingResponse.json()
        console.error('Upload - Meeting creation failed:', error)
        throw new Error(error.error || 'Failed to create meeting record')
      }

      const result = await meetingResponse.json()
      console.log('Upload - Meeting created successfully:', result.meetingId)
      setUploadProgress(100)

      // Redirect to processing/results page
      router.push(`/meeting/${result.meetingId}`)

    } catch (error) {
      console.error('Upload - Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.'
      alert(`Upload failed: ${errorMessage}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setUploadTitle("")
    setSelectedLanguage("auto")
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    // Stop recording if active
    if (isRecording) {
      stopRecording()
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Upload and manage your meeting recordings</p>
          </div>
          <ProfileMenu />
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Recording</h2>
          
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg text-gray-600">Drop your audio/video file here</p>
                  <p className="text-sm text-gray-500">or click to browse (Max 50MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.mov,.avi"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {/* Recording Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Or record directly:</h3>
            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={isUploading}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Start Recording
                </Button>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={stopRecording}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    <div className="w-4 h-4 mr-2 bg-white rounded-sm"></div>
                    Stop ({formatTime(recordingTime)})
                  </Button>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm text-gray-600">Recording...</span>
                  </div>
                </div>
              )}
              
              {recordedChunks.length > 0 && !isRecording && (
                <Button
                  onClick={processRecording}
                  variant="outline"
                >
                  Use Recording ({formatTime(recordingTime)})
                </Button>
              )}
            </div>
          </div>

          {/* Upload Form */}
          {selectedFile && (
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Title *
                </label>
                <Input
                  id="title"
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter meeting title..."
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Transcription Language
                </label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="auto">🌐 Auto-detect</option>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-detect will automatically identify the spoken language
                </p>
              </div>

              {/* Upload Button */}
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadTitle.trim() || isUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing... ({uploadProgress}%)
                    </>
                  ) : (
                    'Upload & Transcribe'
                  )}
                </Button>
                
                {isUploading && (
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Meetings List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Meetings</h2>
          </div>
          
          {meetings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
              <p className="text-gray-500">Upload your first recording to get started with AI-powered transcription.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/meeting/${meeting.id}`}
                        className="block hover:text-blue-600 transition-colors"
                      >
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {meeting.title}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{new Date(meeting.createdAt).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            meeting.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800'
                              : meeting.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-800'
                              : meeting.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {meeting.status}
                          </span>
                          {meeting.duration && (
                            <span>{Math.round(meeting.duration / 60)} min</span>
                          )}
                        </div>
                      </Link>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      <Link 
                        href={`/meeting/${meeting.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 