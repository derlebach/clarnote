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

  useEffect(() => {
    if (status === "authenticated") {
      fetchMeetings()
    }
  }, [status])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer)
      }
    }
  }, [recordingTimer])

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/meetings", {
        credentials: 'include' // Include cookies for session authentication
      })
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      }
    } catch (error) {
      console.error("Error fetching meetings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    // Log file info for debugging
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    })

    // Get file extension
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

    // Define allowed MIME types and extensions
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/wav', 
      'audio/x-m4a',
      'audio/mp4',
      'video/mp4',
      'video/quicktime'
    ]
    
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.mp4', '.mov']

    // Validate file type (check both MIME type and extension for better compatibility)
    const isMimeTypeValid = allowedMimeTypes.includes(file.type)
    const isExtensionValid = allowedExtensions.includes(fileExtension)

    if (!isMimeTypeValid && !isExtensionValid) {
      console.log('File validation failed:', {
        mimeType: file.type,
        extension: fileExtension,
        allowedMimeTypes,
        allowedExtensions
      })
      alert('Please select a valid audio or video file (MP3, WAV, MP4, MOV, M4A)')
      return
    }

    // Validate file size (max 100MB)
    const maxSizeInBytes = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSizeInBytes) {
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1)
      alert(`File size (${fileSizeInMB}MB) exceeds the maximum limit of 100MB. Please select a smaller file.`)
      return
    }

    console.log('File validation successful - ready to upload')
    setSelectedFile(file)
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const triggerFileSelect = () => {
    if (typeof window !== 'undefined') {
      // Add haptic feedback for native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          Haptics.impact({ style: ImpactStyle.Light })
        } catch (error) {
          // Haptics not available, continue without feedback
        }
      }
      fileInputRef.current?.click()
    }
  }

  const startRecording = async () => {
    try {
      // Check if running on native platform first
      if (typeof window !== 'undefined' && !navigator.mediaDevices) {
        alert('Audio recording is not supported on this device.')
        return
      }

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
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: 'audio/webm' })
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const recordedFile = new File([recordedBlob], `recording-${timestamp}.webm`, {
          type: 'audio/webm'
        })
        
        // Set the recorded file as selected file
        setSelectedFile(recordedFile)
        if (!uploadTitle) {
          setUploadTitle(`Recording ${new Date().toLocaleString()}`)
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        setRecordedChunks([])
        setRecordingTime(0)
        if (recordingTimer) {
          clearInterval(recordingTimer)
          setRecordingTimer(null)
        }
      }
      
      setRecordedChunks(chunks)
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      setRecordingTimer(timer)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check your browser permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) {
      alert('Please select a file and provide a title')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', uploadTitle.trim())
      formData.append('description', '')
      formData.append('tags', '')
      formData.append('language', selectedLanguage)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for session authentication
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to processing/results page
        router.push(`/meeting/${result.meetingId}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
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
      <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4]">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/80 border-b border-gray-200/30">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/logo.svg" 
                alt="Clarnote" 
                width={127}
                height={42}
                className="h-8 w-auto"
              />
            </Link>
            
            <div className="flex items-center space-x-4">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Your Meeting</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload an audio or video file to get AI-powered transcription, summaries, and actionable insights.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-sm mb-8">
          {!selectedFile ? (
            /* File Drop Zone */
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Drag & drop your file here
              </h3>
              <p className="text-gray-600 mb-6">
                Or click to browse and select a file
              </p>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="audio/mpeg,audio/wav,audio/x-m4a,audio/mp4,video/mp4,video/quicktime,.mp3,.wav,.m4a,.mp4,.mov"
                onChange={handleFileInputChange}
              />
              
              <div className="space-y-3">
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerFileSelect()
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl"
                >
                  Select File
                </Button>
                
                <div className="text-sm text-gray-500">or</div>
                
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isRecording) {
                      stopRecording()
                    } else {
                      startRecording()
                    }
                  }}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg"
                >
                  {isRecording ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Stop Recording ({formatRecordingTime(recordingTime)})</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <span>Record Audio</span>
                    </div>
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Supports MP3, WAV, MP4, MOV, M4A files up to 100MB
              </p>
            </div>
          ) : (
            /* File Selected */
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      {selectedFile.name.includes('recording-') && ' • Recorded Audio'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Remove
                </Button>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title
                </label>
                <Input
                  id="title"
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter a title for this meeting"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Transcription Language
                </label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
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

              <Button
                onClick={handleUpload}
                disabled={isUploading || !uploadTitle.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-medium text-lg"
              >
                {isUploading ? "Processing..." : "Upload & Analyze"}
              </Button>
            </div>
          )}
        </div>

        {/* Recent Meetings */}
        {meetings.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Meetings</h2>
            <div className="space-y-4">
              {meetings.slice(0, 3).map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meeting/${meeting.id}`}
                  className="block p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(meeting.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      meeting.status.toUpperCase() === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : meeting.status.toUpperCase() === 'TRANSCRIBING'
                        ? 'bg-orange-100 text-orange-800'
                        : meeting.status.toUpperCase() === 'GENERATING_SUMMARY'
                        ? 'bg-yellow-100 text-yellow-800'
                        : meeting.status.toUpperCase() === 'UPLOADED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {meeting.status.toUpperCase() === 'COMPLETED' ? 'Completed' :
                       meeting.status.toUpperCase() === 'TRANSCRIBING' ? 'Transcribing' :
                       meeting.status.toUpperCase() === 'GENERATING_SUMMARY' ? 'Analyzing' :
                       meeting.status.toUpperCase() === 'UPLOADED' ? 'Processing' :
                       meeting.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            
            {meetings.length > 3 && (
              <div className="mt-6 text-center">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                  View All Meetings
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 