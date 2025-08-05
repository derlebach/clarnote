'use client'

import { useState } from 'react'

interface TranscriptionResult {
  text: string
  segments?: Array<{
    speaker?: string
    text: string
    start?: number
    end?: number
  }>
  language: string
  duration: number
  success: boolean
}

export default function TranscriptionUpload() {
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    setLoading(true)
    setError(null)
    setTranscription(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Transcription failed')
      }

      setTranscription(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (seconds?: number) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Full Transcript</h1>
      <p className="text-gray-600 mb-8">Upload an audio file to generate a professional transcript with speaker detection.</p>

      {/* File Upload */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Audio File
        </label>
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg"
          onChange={(e) => {
            if (e.target.files?.[0]) handleUpload(e.target.files[0])
          }}
          disabled={loading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50"
        />
        <p className="text-xs text-gray-500 mt-2">
          Supports MP3, WAV, M4A, FLAC, OGG formats. Maximum file size: 50MB
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-800 font-medium">Transcribing audio with WhisperX...</p>
          </div>
          <p className="text-blue-600 text-sm mt-2">This may take a few minutes depending on file size.</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 className="text-red-800 font-medium mb-2">Transcription Failed</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Transcription Results */}
      {transcription && (
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3">Transcription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Language:</span>
                <span className="ml-2 font-medium">{transcription.language}</span>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-2 font-medium">{formatTimestamp(transcription.duration)}</span>
              </div>
              <div>
                <span className="text-gray-500">Segments:</span>
                <span className="ml-2 font-medium">{transcription.segments?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Full Transcript */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Full Transcript</h3>
            <div className="prose max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {transcription.text}
              </p>
            </div>
          </div>

          {/* Speaker Segments (if available) */}
          {transcription.segments && transcription.segments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Speaker Timeline</h3>
              <div className="space-y-4">
                {transcription.segments.map((segment, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {segment.speaker || `Speaker ${index % 3 + 1}`}
                      </span>
                      {segment.start && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(segment.start)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">
                        {segment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3">Export Options</h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const blob = new Blob([transcription.text], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'transcript.txt'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Download as TXT
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transcription.text)
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 