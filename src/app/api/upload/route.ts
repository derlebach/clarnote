import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { validateAudioFile, isValidLanguageCode } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabaseServer"
import { SUPABASE_BUCKET } from "@/lib/storage"

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
    const file = formData.get("file") as File | null
    const title = (formData.get("title") as string) || ''
    const description = (formData.get("description") as string) || ''
    const tagsString = (formData.get("tags") as string) || ''
    const language = (formData.get("language") as string) || 'auto'
    const qualityMode = (formData.get("qualityMode") as string) || "accurate"

    // Support direct-to-storage uploads: client provides fileUrl, originalFileName, fileSize
    const providedFileUrl = (formData.get("fileUrl") as string) || ''
    const providedOriginalName = (formData.get("originalFileName") as string) || ''
    const providedFileSize = formData.get("fileSize") ? Number(formData.get("fileSize")) : undefined

    if ((!file && !providedFileUrl) || !title) {
      return NextResponse.json(
        { error: "File (or fileUrl) and title are required" },
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

    let storedFileUrl: string | null = null
    let originalFileName = providedOriginalName || (file ? file.name : '')
    let fileSize = providedFileSize || (file ? file.size : 0)

    if (providedFileUrl) {
      // Expect a Supabase Storage URL prepared by the client
      if (!providedFileUrl.startsWith('supabase://')) {
        return NextResponse.json(
          { error: "Unsupported fileUrl. Expected supabase:// URL" },
          { status: 400 }
        )
      }
      storedFileUrl = providedFileUrl
    } else if (file) {
      // Validate file
      const validation = validateAudioFile(file)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }

      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop() || ''
      const sanitizedExt = fileExtension.replace(/[^a-zA-Z0-9]/g, '') || 'm4a'
      const fileName = `${userId}_${timestamp}.${sanitizedExt}`

      // Convert to buffer once
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      if (supabase) {
        const bucket = SUPABASE_BUCKET
        const objectPath = `${userId}/${fileName}`
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(objectPath, buffer, {
            contentType: (file as any).type || 'application/octet-stream',
            upsert: true,
          })

        if (uploadError) {
          console.error('Upload API - Supabase Storage upload failed:', uploadError)
          return NextResponse.json(
            { error: "Upload failed. Please try again." },
            { status: 500 }
          )
        }

        storedFileUrl = `supabase://${bucket}/${objectPath}`
        console.log(`File uploaded to Supabase Storage: ${storedFileUrl}`)
      } else {
        // Fallback: local disk (works locally, not persistent on Vercel)
        const uploadDir = join(process.cwd(), "uploads")
        try {
          await mkdir(uploadDir, { recursive: true })
        } catch (error) {
          // Directory might already exist
        }
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, buffer)
        storedFileUrl = `/uploads/${fileName}`
        console.log(`File saved locally: ${storedFileUrl}`)
      }
    }

    if (!storedFileUrl) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Create meeting record in database using Prisma
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        tags: tags.join(','), // Convert array to comma-separated string
        language: language || 'auto',
        originalFileName: originalFileName || null,
        fileUrl: storedFileUrl,
        fileSize: fileSize || null,
        status: "UPLOADED",
        userId: userId,
      }
    })

    // Start transcription process asynchronously
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