import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabaseServer"

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  console.log('🚀 Simple Upload API - Starting request')
  
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.error('❌ No authenticated session')
      return NextResponse.json({ error: "Please sign in" }, { status: 401 })
    }

    console.log('✅ User authenticated:', session.user.email)

    // 2. Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('📝 Creating new user...')
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
        }
      })
      console.log('✅ User created:', user.id)
    } else {
      console.log('✅ User found:', user.id)
    }

    // 3. Parse form data
    const formData = await request.formData()
    const title = (formData.get("title") as string) || 'Untitled Meeting'
    const language = (formData.get("language") as string) || 'auto'
    const storagePath = (formData.get("storagePath") as string) || ''
    const originalFileName = (formData.get("originalFileName") as string) || ''
    const fileSize = formData.get("fileSize") ? Number(formData.get("fileSize")) : null

    console.log('📋 Form data:', { title, language, storagePath: !!storagePath, originalFileName })

    if (!storagePath || !title) {
      console.error('❌ Missing required data:', { storagePath: !!storagePath, title: !!title })
      return NextResponse.json({ error: "Missing file or title" }, { status: 400 })
    }

    // 4. Create meeting record
    console.log('💾 Creating meeting record...')
    const meeting = await prisma.meeting.create({
      data: {
        title: title.trim(),
        description: null,
        tags: '',
        language: language || 'auto',
        originalFileName: originalFileName || null,
        fileUrl: `supabase://Clarnote/${storagePath}`,
        fileSize: fileSize || null,
        status: "UPLOADED",
        userId: user.id,
      }
    })

    console.log('✅ Meeting created:', meeting.id)

    // 5. Start transcription (fire and forget)
    const transcribeUrl = `${request.nextUrl.origin}/api/transcribe-simple`
    console.log('🚀 Starting transcription:', transcribeUrl)
    
    fetch(transcribeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId: meeting.id }),
    }).catch(error => {
      console.error('❌ Failed to start transcription:', error)
    })

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      message: "Upload successful"
    })

  } catch (error) {
    console.error('💥 Simple Upload API Error:', error)
    return NextResponse.json({
      error: "Upload failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 