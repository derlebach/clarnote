import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('Upload URL API - Request started')
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    console.log('Upload URL API - Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email ? session.user.email.substring(0, 5) + '***' : undefined
    })
    
    if (!session?.user?.id) {
      console.error('Upload URL API - No authenticated session')
      return NextResponse.json(
        { error: 'Authentication required', step: 'auth_check' },
        { status: 401 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      console.error('Upload URL API - Supabase service not configured')
      return NextResponse.json(
        { error: 'Storage service not configured', step: 'supabase_check' },
        { status: 500 }
      )
    }

    // Parse request body
    let body: { fileName: string; mime: string }
    try {
      body = await request.json()
      console.log('Upload URL API - Request body parsed:', {
        hasFileName: !!body.fileName,
        hasMime: !!body.mime,
        fileName: body.fileName ? body.fileName.substring(0, 20) + '...' : undefined,
        mime: body.mime
      })
    } catch (parseError) {
      console.error('Upload URL API - Failed to parse JSON body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body', step: 'json_parse' },
        { status: 400 }
      )
    }

    const { fileName, mime } = body

    if (!fileName || !mime) {
      console.error('Upload URL API - Missing required fields:', { fileName: !!fileName, mime: !!mime })
      return NextResponse.json(
        { error: 'fileName and mime are required', step: 'validation' },
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
      bucket: 'Clarnote',
      sanitizedFileName
    })

    // Generate signed upload URL using service role
    try {
      const signedUrlStartTime = Date.now()
      const { data, error } = await supabase.storage
        .from('Clarnote')
        .createSignedUploadUrl(objectPath, {
          upsert: true
        })
      
      const signedUrlDuration = Date.now() - signedUrlStartTime
      console.log('Upload URL API - Supabase createSignedUploadUrl completed:', {
        duration: `${signedUrlDuration}ms`,
        hasData: !!data,
        hasError: !!error
      })

      if (error) {
        console.error('Upload URL API - Supabase signed URL error:', {
          error: error.message,
          name: error.name,
          objectPath,
          bucket: 'Clarnote',
          userId: session.user.id,
          fullError: JSON.stringify(error, null, 2)
        })
        return NextResponse.json(
          { 
            error: 'Failed to generate upload URL', 
            step: 'signed_url_creation',
            details: error.message 
          },
          { status: 500 }
        )
      }

      if (!data?.signedUrl) {
        console.error('Upload URL API - No signed URL returned from Supabase:', {
          data: JSON.stringify(data, null, 2),
          objectPath
        })
        return NextResponse.json(
          { error: 'Failed to generate upload URL', step: 'signed_url_missing' },
          { status: 500 }
        )
      }

      const totalDuration = Date.now() - startTime
      console.log('Upload URL API - Successfully created signed URL:', {
        objectPath,
        totalDuration: `${totalDuration}ms`,
        signedUrlLength: data.signedUrl.length,
        hasToken: !!data.token
      })

      return NextResponse.json({
        bucket: 'Clarnote',
        path: objectPath,
        signedUrl: data.signedUrl,
        mime: mime
      })

    } catch (supabaseError) {
      console.error('Upload URL API - Exception during signed URL creation:', {
        error: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        stack: supabaseError instanceof Error ? supabaseError.stack : undefined,
        objectPath,
        userId: session.user.id,
        errorName: supabaseError instanceof Error ? supabaseError.name : 'Unknown'
      })
      return NextResponse.json(
        { 
          error: 'Storage service error', 
          step: 'signed_url_exception',
          details: supabaseError instanceof Error ? supabaseError.message : String(supabaseError)
        },
        { status: 500 }
      )
    }

  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error('Upload URL API - Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${totalDuration}ms`,
      errorName: error instanceof Error ? error.name : 'Unknown'
    })
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        step: 'unexpected_error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 