"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { validateAudioFile, formatFileSize } from "@/lib/utils"
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import ProfileMenu from '@/components/ProfileMenu'

export default function Upload() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [language, setLanguage] = useState("en")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    )
  }

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
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    const validation = validateAudioFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error || "Invalid file")
      return
    }

    setFile(selectedFile)
    setError("")
    
    // Auto-generate title from filename if not set
    if (!title) {
      const name = selectedFile.name.replace(/\.[^/.]+$/, "")
      setTitle(name)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Add haptic feedback on native platforms
    if (Capacitor.isNativePlatform()) {
      try {
        Haptics.impact({ style: ImpactStyle.Light })
      } catch (error) {
        // Haptics not available, continue
      }
    }
    
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file || !title.trim()) {
      setError("Please select a file and enter a title")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title.trim())
      formData.append("description", description.trim())
      formData.append("tags", tags)
      formData.append("language", language)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/meeting/${data.meetingId}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError("An error occurred during upload")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-gradient-header/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container-xl">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                ← Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Upload Meeting</h1>
            </div>
            <div className="flex items-center gap-4">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-md py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-heading text-gray-900 mb-4">Upload Your Meeting</h2>
            <p className="text-lg text-gray-600">
              Upload your audio or video recording to get started with AI transcription and analysis
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <Card className="shadow-large">
              <CardHeader>
                <CardTitle className="text-2xl">Add Meeting Recording</CardTitle>
                <CardDescription className="text-base">
                  Drag and drop your file or fill in the details below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">

              {/* File Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-400 bg-blue-50/50"
                    : file
                    ? "border-green-300 bg-green-50/50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-900 mb-1">{file.name}</p>
                      <p className="text-sm text-green-700 mb-4">{formatFileSize(file.size)}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        Drop your file here, or{" "}
                        <label className="text-blue-600 cursor-pointer hover:text-blue-700 transition-smooth">
                          browse
                          <input
                            type="file"
                            className="hidden"
                            accept="audio/*,video/mp4"
                            capture={Capacitor.isNativePlatform() ? true : undefined}
                            onChange={handleFileInput}
                          />
                        </label>
                      </p>
                      <p className="text-sm text-gray-600">
                        Supports MP3, WAV, MP4, M4A files up to 25MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Meeting Details Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Meeting Title *
                    </label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter meeting title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-12 px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white shadow-soft transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:ring-offset-2 focus-visible:border-gray-300"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                  <Input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the meeting"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags (optional)
                  </label>
                  <Input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="team-meeting, quarterly-review, client-call (comma-separated)"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/dashboard")}
                    className="sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!file || !title.trim() || isUploading}
                    className="sm:w-auto shadow-soft"
                  >
                    {isUploading ? "Uploading..." : "Upload & Process"}
                  </Button>
                </div>
              </form>
            </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 