import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { validateAudioFile, isValidLanguageCode } from "@/lib/utils"

// Configure the route to handle large request bodies
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout for uploads

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('Upload API - Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    })

    if (!session?.user?.email) {
      console.error('Upload API - No valid session or user email')
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 })
    }

    // Get user ID from database if not in session
    let userId = session.user.id
    if (!userId) {
      // Use Supabase REST API to find user
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.error('Upload API - Missing Supabase configuration')
        return NextResponse.json({ error: "Configuration error" }, { status: 500 })
      }

      const userResponse = await fetch(`${supabaseUrl}/rest/v1/User?email=eq.${session.user.email}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      })

      if (!userResponse.ok) {
        console.error('Upload API - Failed to fetch user:', userResponse.status)
        return NextResponse.json({ error: "User not found" }, { status: 401 })
      }

      const users = await userResponse.json()
      if (users.length === 0) {
        console.error('Upload API - User not found in database:', session.user.email)
        return NextResponse.json({ error: "User not found" }, { status: 401 })
      }
      
      userId = users[0].id
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tagsString = formData.get("tags") as string
    const language = formData.get("language") as string
    const qualityMode = formData.get("qualityMode") as string || "accurate"

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required" },
        { status: 400 }
      )
    }

    // Validate language if provided
    if (language && !isValidLanguageCode(language)) {
      return NextResponse.json(
        { error: "Invalid language code" },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateAudioFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Parse tags
    const tags = tagsString ? tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || ''
    const fileName = `${session.user.id}_${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    console.log(`File uploaded: ${fileName}, Language: ${language || 'auto'}, Quality: ${qualityMode}`)

    // Create meeting record in database using Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Upload API - Missing Supabase configuration for meeting creation')
      return NextResponse.json({ error: "Configuration error" }, { status: 500 })
    }

    const meetingData = {
      title,
      description: description || null,
      tags: tags.join(','), // Convert array to comma-separated string
      language: language || 'auto',
      originalFileName: file.name,
      fileUrl: `/uploads/${fileName}`,
      fileSize: file.size,
      status: "UPLOADED",
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const meetingResponse = await fetch(`${supabaseUrl}/rest/v1/Meeting`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(meetingData)
    })

    if (!meetingResponse.ok) {
      console.error('Upload API - Failed to create meeting:', meetingResponse.status)
      const errorText = await meetingResponse.text()
      console.error('Meeting creation error:', errorText)
      return NextResponse.json({ error: "Failed to create meeting record" }, { status: 500 })
    }

    const meetings = await meetingResponse.json()
    const meeting = meetings[0]

    // Start transcription process asynchronously
    // We'll implement this in a separate API route to avoid timeout issues
    fetch(`${process.env.NEXTAUTH_URL}/api/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ meetingId: meeting.id, qualityMode }),
    }).catch(console.error)

    return NextResponse.json({
      message: "File uploaded successfully",
      meetingId: meeting.id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 