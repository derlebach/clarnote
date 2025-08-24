import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabaseServer'
import { SUPABASE_BUCKET } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: 'Storage service not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { fileName, mimeType } = body

    if (!fileName || !mimeType) {
      return NextResponse.json(
        { error: 'fileName and mimeType are required' },
        { status: 400 }
      )
    }

    // Sanitize file name and create unique path
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileExtension = sanitizedFileName.split('.').pop() || 'bin'
    const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const objectPath = `${session.user.id}/${uniqueId}.${fileExtension}`

    // Generate signed upload URL (valid for 10 minutes)
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .createSignedUploadUrl(objectPath, {
        upsert: true
      })

    if (error) {
      console.error('Supabase signed URL error:', error)
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      path: objectPath,
      signedUrl: data.signedUrl,
      token: data.token,
      fullPath: `supabase://${SUPABASE_BUCKET}/${objectPath}`
    })

  } catch (error) {
    console.error('Upload URL API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 