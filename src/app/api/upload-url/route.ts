import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.error('Upload URL API - No authenticated session')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      console.error('Upload URL API - Supabase service not configured')
      return NextResponse.json(
        { error: 'Storage service not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    let body: { fileName: string; mime: string }
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Upload URL API - Failed to parse JSON body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { fileName, mime } = body

    if (!fileName || !mime) {
      console.error('Upload URL API - Missing required fields:', { fileName: !!fileName, mime: !!mime })
      return NextResponse.json(
        { error: 'fileName and mime are required' },
        { status: 400 }
      )
    }

    // Sanitize filename and create path with user isolation
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const timestamp = Date.now()
    const objectPath = `${session.user.id}/${timestamp}-${sanitizedFileName}`

    console.log('Upload URL API - Creating signed URL for:', {
      userId: session.user.id,
      objectPath,
      mime,
      bucket: 'Clarnote'
    })

    // Generate signed upload URL using service role
    try {
      const { data, error } = await supabase.storage
        .from('Clarnote')
        .createSignedUploadUrl(objectPath, {
          upsert: true
        })

      if (error) {
        console.error('Upload URL API - Supabase signed URL error:', {
          error: error.message,
          objectPath,
          bucket: 'Clarnote'
        })
        return NextResponse.json(
          { error: 'Failed to generate upload URL' },
          { status: 500 }
        )
      }

      if (!data?.signedUrl) {
        console.error('Upload URL API - No signed URL returned from Supabase')
        return NextResponse.json(
          { error: 'Failed to generate upload URL' },
          { status: 500 }
        )
      }

      console.log('Upload URL API - Successfully created signed URL for:', objectPath)

      return NextResponse.json({
        bucket: 'Clarnote',
        path: objectPath,
        signedUrl: data.signedUrl,
        mime: mime
      })

    } catch (supabaseError) {
      console.error('Upload URL API - Exception during signed URL creation:', {
        error: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        objectPath,
        userId: session.user.id
      })
      return NextResponse.json(
        { error: 'Storage service error' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Upload URL API - Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 