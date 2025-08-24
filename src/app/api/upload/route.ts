import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { isValidLanguageCode } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

// Configure the route
export const runtime = 'nodejs'
export const maxDuration = 30 // Reduced since we're not handling file uploads

/**
 * DEPRECATED: This route no longer handles file uploads directly.
 * Use the new flow: /api/upload-url -> signed URL upload -> /api/transcribe
 * 
 * This route now only creates meeting records after files are uploaded via signed URLs.
 */
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
    const title = (formData.get("title") as string) || ''
    const description = (formData.get("description") as string) || ''
    const tagsString = (formData.get("tags") as string) || ''
    const language = (formData.get("language") as string) || 'auto'
    const qualityMode = (formData.get("qualityMode") as string) || "accurate"

    // NEW: Support for signed URL uploads - expect storagePath instead of file
    const storagePath = (formData.get("storagePath") as string) || ''
    const originalFileName = (formData.get("originalFileName") as string) || ''
    const fileSize = formData.get("fileSize") ? Number(formData.get("fileSize")) : null

    if (!storagePath || !title) {
      console.error('Upload API - Missing required fields:', { storagePath: !!storagePath, title: !!title })
      return NextResponse.json(
        { error: "storagePath and title are required" },
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

    // Parse tags
    const tags = tagsString ? tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

    console.log('Upload API - Creating meeting record:', {
      userId,
      title,
      storagePath,
      originalFileName,
      language
    })

    // Create meeting record in database using Prisma
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        tags: tags.join(','), // Convert array to comma-separated string
        language: language || 'auto',
        originalFileName: originalFileName || null,
        fileUrl: `supabase://Clarnote/${storagePath}`, // Store as supabase:// URL for transcription
        fileSize: fileSize || null,
        status: "UPLOADED",
        userId: userId,
      }
    })

    console.log('Upload API - Meeting created:', meeting.id)

    // Start transcription process asynchronously
    fetch(`${request.nextUrl.origin}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId: meeting.id, qualityMode }),
    }).catch(error => {
      console.error('Upload API - Failed to trigger transcription:', error)
    })

    return NextResponse.json({
      message: "Meeting record created successfully",
      meetingId: meeting.id,
    })
  } catch (error) {
    console.error("Upload API - Error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 