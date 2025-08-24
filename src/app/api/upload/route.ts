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
 * Use the new flow: /api/upload-url -> signed URL upload -> /api/upload
 * 
 * This route now only creates meeting records after files are uploaded via signed URLs.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('Upload API - Request started')
  
  try {
    const session = await getServerSession(authOptions)

    console.log('Upload API - Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email ? session.user.email.substring(0, 5) + '***' : undefined,
      userId: session?.user?.id
    })

    if (!session?.user?.email) {
      console.error('Upload API - No valid session or user email')
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 })
    }

    // Get user ID from database and ensure user exists
    let userId = session.user.id
    let user = null
    
    console.log('Upload API - Looking up user:', { sessionUserId: userId, sessionEmail: session.user.email })
    
    if (userId) {
      // Check if user exists in database
      try {
        user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true }
        })
        console.log('Upload API - User lookup by ID result:', { found: !!user, userId })
      } catch (error) {
        console.error('Upload API - Error looking up user by ID:', error)
      }
    }
    
    if (!user) {
      // Try to find user by email
      try {
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, email: true }
        })
        console.log('Upload API - User lookup by email result:', { found: !!user, email: session.user.email })
      } catch (error) {
        console.error('Upload API - Error looking up user by email:', error)
      }
    }
    
    if (!user) {
      // Create user if they don't exist
      console.log('Upload API - Creating new user:', session.user.email)
      try {
        user = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || null,
            image: session.user.image || null,
          },
          select: { id: true, email: true }
        })
        console.log('Upload API - User created successfully:', { userId: user.id })
      } catch (error) {
        console.error('Upload API - Error creating user:', error)
        return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
      }
    }
    
    userId = user.id

    console.log('Upload API - Parsing form data...')
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

    console.log('Upload API - Form data parsed:', {
      title: !!title,
      storagePath: !!storagePath,
      originalFileName: !!originalFileName,
      fileSize,
      language,
      storagePathPreview: storagePath ? storagePath.substring(0, 50) + '...' : 'none'
    })

    if (!storagePath || !title) {
      console.error('Upload API - Missing required fields:', { storagePath: !!storagePath, title: !!title })
      return NextResponse.json(
        { error: "storagePath and title are required" },
        { status: 400 }
      )
    }

    // Validate language if provided
    if (language && !isValidLanguageCode(language)) {
      console.error('Upload API - Invalid language code:', language)
      return NextResponse.json(
        { error: "Invalid language code" },
        { status: 400 }
      )
    }

    // Parse tags
    const tags = tagsString ? tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

    console.log('Upload API - Creating meeting record:', {
      userId,
      title: title.substring(0, 50),
      storagePath: storagePath.substring(0, 50) + '...',
      originalFileName,
      language,
      tagsCount: tags.length
    })

    // Create meeting record in database using Prisma
    try {
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

      console.log('Upload API - Meeting created successfully:', {
        meetingId: meeting.id,
        fileUrl: meeting.fileUrl,
        status: meeting.status
      })

      // Start transcription process asynchronously
      console.log('Upload API - Triggering transcription...')
      fetch(`${request.nextUrl.origin}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id, qualityMode }),
      }).catch(error => {
        console.error('Upload API - Failed to trigger transcription:', error)
      })

      const totalDuration = Date.now() - startTime
      console.log('Upload API - Request completed successfully:', {
        meetingId: meeting.id,
        duration: `${totalDuration}ms`
      })

      return NextResponse.json({
        message: "Meeting record created successfully",
        meetingId: meeting.id,
      })
    } catch (dbError) {
      console.error("Upload API - Database error creating meeting:", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
        userId,
        storagePath,
        title
      })
      return NextResponse.json(
        { error: "Failed to create meeting record" },
        { status: 500 }
      )
    }
  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error("Upload API - Unexpected error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${totalDuration}ms`,
      errorName: error instanceof Error ? error.name : 'Unknown'
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 