"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  TranscriptSegment, 
  SpeakerMap, 
  parseTranscriptSegments, 
  parseSpeakerMap, 
  getSpeakerDisplayName, 
  generateSpeakerSegments 
} from "@/lib/utils"
import ProfileMenu from '@/components/ProfileMenu'
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

interface Meeting {
  id: string
  title: string
  description?: string
  tags: string[]
  language: string
  originalFileName?: string
  fileSize?: number
  duration?: number
  status: string
  transcript?: string
  transcriptSegments?: string
  speakerMap?: string
  summary?: string
  actionItems?: string
  followUpEmail?: string
  createdAt: string
}

interface ActionItemsData {
  actionItems: string[]
  keyDecisions: string[]
  nextSteps: string[]
}

export default function MeetingDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [speakerMap, setSpeakerMap] = useState<SpeakerMap>({})
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null)
  const [editedSpeakerName, setEditedSpeakerName] = useState('')

  const fetchMeeting = async () => {
    try {
      const response = await fetch(`/api/meetings/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMeeting(data.meeting)
        setEditedTitle(data.meeting.title) // Initialize edited title
        setSpeakerMap(parseSpeakerMap(data.meeting.speakerMap)) // Initialize speaker map
      }
    } catch (error) {
      console.error("Error fetching meeting:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateTitle = async () => {
    if (!meeting || !editedTitle.trim() || editedTitle === meeting.title) {
      setIsEditingTitle(false)
      setEditedTitle(meeting?.title || '')
      return
    }

    try {
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editedTitle.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setMeeting(prev => prev ? { ...prev, title: editedTitle.trim() } : null)
        setIsEditingTitle(false)
      } else {
        // Reset on error
        setEditedTitle(meeting.title)
        setIsEditingTitle(false)
        console.error('Failed to update title')
      }
    } catch (error) {
      console.error('Error updating title:', error)
      setEditedTitle(meeting.title)
      setIsEditingTitle(false)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateTitle()
    } else if (e.key === 'Escape') {
      setEditedTitle(meeting?.title || '')
      setIsEditingTitle(false)
    }
  }

  const updateSpeakerName = async (speakerId: string, newName: string) => {
    if (!meeting || !newName.trim()) {
      setEditingSpeaker(null)
      setEditedSpeakerName('')
      return
    }

    const updatedSpeakerMap = { ...speakerMap, [speakerId]: newName.trim() }

    try {
      const response = await fetch(`/api/meetings/${meeting.id}/speakers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ speakerMap: updatedSpeakerMap }),
      })

      if (response.ok) {
        setSpeakerMap(updatedSpeakerMap)
        setEditingSpeaker(null)
        setEditedSpeakerName('')
      } else {
        console.error('Failed to update speaker name')
        setEditingSpeaker(null)
        setEditedSpeakerName('')
      }
    } catch (error) {
      console.error('Error updating speaker name:', error)
      setEditingSpeaker(null)
      setEditedSpeakerName('')
    }
  }

  const handleSpeakerNameKeyDown = (e: React.KeyboardEvent, speakerId: string) => {
    if (e.key === 'Enter') {
      updateSpeakerName(speakerId, editedSpeakerName)
    } else if (e.key === 'Escape') {
      setEditingSpeaker(null)
      setEditedSpeakerName('')
    }
  }

  const startEditingSpeaker = (speakerId: string, currentName: string) => {
    setEditingSpeaker(speakerId)
    setEditedSpeakerName(currentName)
  }

  const getTranscriptSegments = (): TranscriptSegment[] => {
    if (!meeting) return []
    
    // Try to get speaker segments from the meeting data
    const segments = parseTranscriptSegments(meeting.transcriptSegments)
    if (segments.length > 0) {
      return segments
    }
    
    // Fallback: generate segments from regular transcript for existing meetings
    if (meeting.transcript) {
      return generateSpeakerSegments(meeting.transcript)
    }
    
    return []
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchMeeting()
    }
  }, [status, params.id])

  // Auto-refresh when processing
  useEffect(() => {
    if (meeting && isProcessing) {
      const interval = setInterval(fetchMeeting, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [meeting?.status])

  // Calculate estimated time remaining based on file size
  const getEstimatedTime = (fileSize?: number): string => {
    if (!fileSize) return "≈ 30 seconds"
    
    const fileSizeMB = fileSize / (1024 * 1024)
    if (fileSizeMB < 5) return "≈ 15 seconds"
    if (fileSizeMB < 10) return "≈ 30 seconds"
    if (fileSizeMB < 25) return "≈ 60 seconds"
    return "≈ 90-120 seconds"
  }

  // Get processing status details
  const getProcessingStatus = (status: string, fileSize?: number) => {
    switch (status.toUpperCase()) {
      case 'UPLOADED':
        return {
          title: "Starting Processing...",
          message: "Preparing your file for transcription",
          timeEstimate: getEstimatedTime(fileSize),
          color: "blue"
        }
      case 'TRANSCRIBING':
        return {
          title: "Transcribing...",
          message: "Converting your audio to text using AI",
          timeEstimate: getEstimatedTime(fileSize),
          color: "blue"
        }
      case 'TRANSCRIBED':
        return {
          title: "Generating Summary...",
          message: "Analyzing transcript to create insights and summaries",
          timeEstimate: "≈ 30 seconds",
          color: "purple"
        }
      case 'GENERATING_SUMMARY':
        return {
          title: "Generating Summary...",
          message: "Analyzing transcript to create insights and summaries",
          timeEstimate: "≈ 30 seconds",
          color: "purple"
        }
      default:
        return {
          title: "Processing...",
          message: "Working on your meeting analysis",
          timeEstimate: getEstimatedTime(fileSize),
          color: "blue"
        }
    }
  }

  const parseActionItems = (actionItemsJson?: string): ActionItemsData => {
    if (!actionItemsJson) {
      return { actionItems: [], keyDecisions: [], nextSteps: [] }
    }
    
    try {
      return JSON.parse(actionItemsJson)
    } catch {
      return { actionItems: [], keyDecisions: [], nextSteps: [] }
    }
  }

  const parseSummary = (summaryJson?: string): { summary: string; actionItems: string[] } => {
    if (!summaryJson) {
      return { summary: '', actionItems: [] }
    }

    // Check if it's already plain text (not JSON)
    if (!summaryJson.trim().startsWith('{') && !summaryJson.trim().startsWith('```')) {
      return { summary: summaryJson, actionItems: [] }
    }

    try {
      // Remove markdown code block formatting if present
      let cleanJson = summaryJson.replace(/```json\s*/, '').replace(/```\s*$/, '').trim()
      
      const parsed = JSON.parse(cleanJson)
      return {
        summary: parsed.summary || '',
        actionItems: parsed.actionItems || []
      }
    } catch {
      // If parsing fails, try to extract text content
      const textMatch = summaryJson.match(/"summary":\s*"([^"]*)"/)
      const summary = textMatch ? textMatch[1] : summaryJson.replace(/```json|```/g, '').trim()
      return { summary, actionItems: [] }
    }
  }

  const handleExport = async (type: 'pdf' | 'email') => {
    try {
      const endpoint = type === 'pdf' ? 'export' : 'send-email'
      const response = await fetch(`/api/meetings/${meeting?.id}/${endpoint}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        if (type === 'pdf') {
          // Add haptic feedback on native platforms
          if (Capacitor.isNativePlatform()) {
            try {
              await Haptics.impact({ style: ImpactStyle.Medium })
            } catch (error) {
              // Haptics not available, continue
            }
          }
          
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${meeting?.title || 'meeting'}-summary.pdf`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          // Add haptic feedback for email success
          if (Capacitor.isNativePlatform()) {
            try {
              await Haptics.impact({ style: ImpactStyle.Light })
            } catch (error) {
              // Haptics not available, continue
            }
          }
          alert('Follow-up email sent successfully!')
        }
      } else {
        alert(`Failed to ${type === 'pdf' ? 'export' : 'send email'}`)
      }
    } catch (error) {
      console.error(`Export ${type} error:`, error)
      alert(`Failed to ${type === 'pdf' ? 'export' : 'send email'}`)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading meeting...</p>
      </div>
    </div>
  }

  if (!meeting) {
    return <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Meeting not found</p>
      </div>
    </div>
  }

  const isProcessing = ['UPLOADED', 'TRANSCRIBING', 'TRANSCRIBED', 'GENERATING_SUMMARY'].includes(meeting.status.toUpperCase())
  const statusInfo = getProcessingStatus(meeting.status, meeting.fileSize)
  const actionItemsData = parseActionItems(meeting.actionItems)
  const summaryData = parseSummary(meeting.summary)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4]">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/80 border-b border-gray-200/30">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">Clarnote</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2 group">
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={updateTitle}
                onKeyDown={handleTitleKeyDown}
                className="bg-transparent focus:outline-none text-4xl font-bold text-gray-900 w-full text-center border-none"
                autoFocus
                style={{ minHeight: '3.5rem' }} // Prevent layout shift
              />
            ) : (
              <div className="flex items-center justify-center">
                <span>{meeting.title}</span>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="ml-2 text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit title"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>{new Date(meeting.createdAt).toLocaleDateString()}</span>
            {meeting.originalFileName && (
              <>
                <span>•</span>
                <span>{meeting.originalFileName}</span>
              </>
            )}
            <span>•</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              meeting.status.toUpperCase() === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              isProcessing ? `bg-${statusInfo.color}-100 text-${statusInfo.color}-800` :
              'bg-gray-100 text-gray-800'
            }`}>
              {meeting.status.toUpperCase() === 'COMPLETED' ? 'Completed' : 
               meeting.status.toUpperCase() === 'TRANSCRIBING' ? 'Transcribing' :
               meeting.status.toUpperCase() === 'GENERATING_SUMMARY' ? 'Analyzing' :
               meeting.status}
            </span>
          </div>
        </div>

        {isProcessing ? (
          /* Enhanced Processing State */
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-12 text-center">
            <div className={`w-16 h-16 bg-${statusInfo.color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-${statusInfo.color}-600`}></div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-2">
              <h2 className="text-2xl font-semibold text-gray-900">{statusInfo.title}</h2>
              <div className="flex space-x-1">
                <div className={`w-2 h-2 bg-${statusInfo.color}-600 rounded-full animate-pulse`}></div>
                <div className={`w-2 h-2 bg-${statusInfo.color}-600 rounded-full animate-pulse`} style={{animationDelay: '0.2s'}}></div>
                <div className={`w-2 h-2 bg-${statusInfo.color}-600 rounded-full animate-pulse`} style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-2">{statusInfo.message}</p>
            <p className="text-sm text-gray-500 mb-8">
              <span className="font-medium">{statusInfo.timeEstimate}</span> remaining
            </p>
            
            <div className="space-y-4">
              {meeting.fileSize && (
                <div className="text-xs text-gray-500">
                  File size: {(meeting.fileSize / (1024 * 1024)).toFixed(1)} MB
                </div>
              )}
              <Button
                onClick={fetchMeeting}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </Button>
            </div>
          </div>
        ) : (
          /* Results */
          <>
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-1 inline-flex">
                {['summary', 'transcript', 'insights'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 mb-8">
              {activeTab === 'summary' && (
                <div className="prose prose-gray max-w-none">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Meeting Summary</h2>
                  {summaryData.summary ? (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {summaryData.summary}
                      {summaryData.actionItems.length > 0 && (
                        <>
                          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Action Items</h3>
                          <ul className="space-y-2">
                            {summaryData.actionItems.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center justify-center mt-0.5 mr-3">
                                  {index + 1}
                                </span>
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Summary not available</p>
                  )}
                </div>
              )}

              {activeTab === 'transcript' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Full Transcript</h2>
                    <Button
                      onClick={async () => {
                        try {
                          const segments = getTranscriptSegments()
                          if (segments.length === 0 || segments.every(s => s.speaker === 'speaker_0')) {
                            // Need to fix missing or poor speaker segments
                            console.log('Fixing speaker segments...')
                            const response = await fetch(`/api/meetings/${meeting.id}/fix-segments`, {
                              method: 'POST'
                            })
                            if (response.ok) {
                              const result = await response.json()
                              console.log('Speaker segments fixed:', result)
                              alert(`✅ Fixed! Generated ${result.segmentCount} segments with ${result.speakers.length} speakers: ${result.speakers.join(', ')}`)
                              // Refresh the meeting data to show new segments
                              fetchMeeting()
                            } else {
                              console.error('Failed to fix speaker segments')
                              alert('❌ Failed to fix speaker segments')
                            }
                          } else {
                            // Test existing segments
                            console.log('Testing existing speaker segments...')
                            const response = await fetch(`/api/meetings/${meeting.id}/regenerate-speakers`, {
                              method: 'POST'
                            })
                            if (response.ok) {
                              const result = await response.json()
                              console.log('Speaker analysis result:', result)
                              alert(`✅ Analysis: ${result.segmentCount} segments with ${result.speakers.length} speakers: ${result.speakers.join(', ')}`)
                            } else {
                              console.error('Failed to analyze speaker segments')
                            }
                          }
                        } catch (error) {
                          console.error('Error with speaker detection:', error)
                          alert('❌ Error with speaker detection')
                        }
                      }}
                      variant="outline"
                      className="text-xs border-gray-300 hover:bg-gray-50 px-3 py-1"
                    >
                      ✨ Fix Speaker Detection
                    </Button>
                    
                    {/* Show retry button for failed transcriptions */}
                    {meeting.status === 'ERROR' && meeting.description?.includes('quality issues') && (
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/meetings/${meeting.id}/retry-transcription`, {
                              method: 'POST'
                            })
                            if (response.ok) {
                              const result = await response.json()
                              alert(`✅ ${result.message}`)
                              // Refresh to show processing status
                              fetchMeeting()
                            } else {
                              const error = await response.json()
                              alert(`❌ Failed to retry: ${error.error}`)
                            }
                          } catch (error) {
                            console.error('Error retrying transcription:', error)
                            alert('❌ Error retrying transcription')
                          }
                        }}
                        variant="outline"
                        className="text-xs border-red-300 text-red-600 hover:bg-red-50 px-3 py-1"
                      >
                        🔄 Retry Transcription
                      </Button>
                    )}
                    
                    {/* Show clean transcript button for corrupted transcripts */}
                    {meeting.transcript && meeting.transcript.length > 500 && (
                      meeting.transcript.substring(0, 100) === meeting.transcript.substring(100, 200) ||
                      meeting.transcript.includes('posílat víc a můžeme je posílat')
                    ) && (
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/meetings/${meeting.id}/retry-transcription`, {
                              method: 'POST'
                            })
                            if (response.ok) {
                              const result = await response.json()
                              alert(`✅ ${result.message}`)
                              fetchMeeting()
                            } else {
                              alert('❌ Failed to fix transcript')
                            }
                          } catch (error) {
                            console.error('Error fixing transcript:', error)
                            alert('❌ Error fixing transcript')
                          }
                        }}
                        variant="outline"
                        className="text-xs border-orange-300 text-orange-600 hover:bg-orange-50 px-3 py-1"
                      >
                        🧹 Fix Corrupted Transcript
                      </Button>
                    )}
                  </div>
                  
                  {/* Show error message for failed transcriptions */}
                  {meeting.status === 'ERROR' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Transcription Failed</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{meeting.description || 'The transcription could not be completed due to quality issues.'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {meeting.transcript ? (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="space-y-4">
                        {getTranscriptSegments().map((segment, index) => {
                          const speakerDisplayName = getSpeakerDisplayName(segment.speaker, speakerMap)
                          const isEditingThisSpeaker = editingSpeaker === segment.speaker
                          
                          return (
                            <div key={index} className="text-gray-700 leading-relaxed">
                              {/* Speaker Label */}
                              <div className="flex items-center mb-2 group">
                                {isEditingThisSpeaker ? (
                                  <input
                                    type="text"
                                    value={editedSpeakerName}
                                    onChange={(e) => setEditedSpeakerName(e.target.value)}
                                    onBlur={() => updateSpeakerName(segment.speaker, editedSpeakerName)}
                                    onKeyDown={(e) => handleSpeakerNameKeyDown(e, segment.speaker)}
                                    className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-1 border-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-1">
                                      {speakerDisplayName}
                                    </span>
                                    <button
                                      onClick={() => startEditingSpeaker(segment.speaker, speakerDisplayName)}
                                      className="ml-1 text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Edit speaker name"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {/* Transcript Text */}
                              <div className="text-sm font-mono whitespace-pre-wrap pl-4 border-l-2 border-gray-200">
                                {segment.text}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Transcript not available</p>
                  )}
                </div>
              )}

              {activeTab === 'insights' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Actionable Insights</h2>
                  
                  <div className="grid gap-8">
                    {/* Action Items */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Action Items
                      </h3>
                      {actionItemsData.actionItems.length > 0 ? (
                        <ul className="space-y-2">
                          {actionItemsData.actionItems.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center justify-center mt-0.5 mr-3">
                                {index + 1}
                              </span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No action items identified</p>
                      )}
                    </div>

                    {/* Key Decisions */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Key Decisions
                      </h3>
                      {actionItemsData.keyDecisions.length > 0 ? (
                        <ul className="space-y-2">
                          {actionItemsData.keyDecisions.map((decision, index) => (
                            <li key={index} className="flex items-start">
                              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center justify-center mt-0.5 mr-3">
                                ✓
                              </span>
                              <span className="text-gray-700">{decision}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No key decisions recorded</p>
                      )}
                    </div>

                    {/* Next Steps */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Next Steps
                      </h3>
                      {actionItemsData.nextSteps.length > 0 ? (
                        <ul className="space-y-2">
                          {actionItemsData.nextSteps.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-800 text-xs font-medium rounded-full flex items-center justify-center mt-0.5 mr-3">
                                →
                              </span>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No next steps identified</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export Actions */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Share</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleExport('pdf')}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </Button>
                <Button
                  onClick={() => handleExport('email')}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 