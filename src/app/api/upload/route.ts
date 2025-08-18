import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { validateAudioFile, isValidLanguageCode } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

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

    // Get user ID from database and ensure user exists
    let userId = session.user.id
    let user = null
    
    if (userId) {
      // Check if user exists in database
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true }
      })
    }
    
    if (!user) {
      // Try to find user by email
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true }
      })
    }
    
    if (!user) {
      // Create user if they don't exist
      console.log('Upload API - Creating new user:', session.user.email)
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
        },
        select: { id: true, email: true }
      })
    }
    
    userId = user.id

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

    // Create meeting record in database using Prisma
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        tags: tags.join(','), // Convert array to comma-separated string
        language: language || 'auto',
        originalFileName: file.name,
        fileUrl: `/uploads/${fileName}`,
        fileSize: file.size,
        status: "UPLOADED",
        userId: userId,
      }
    })

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