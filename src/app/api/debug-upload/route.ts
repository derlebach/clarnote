import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabaseServer'
import { SUPABASE_BUCKET } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // Test 1: Session check
    const session = await getServerSession(authOptions)
    console.log('DEBUG - Session:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    })

    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'No session',
        step: 'session_check'
      }, { status: 401 })
    }

    // Test 2: Supabase connection
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        step: 'supabase_check'
      }, { status: 500 })
    }

    // Test 3: Try to create a signed URL
    try {
      const testPath = `${session.user.id}/test-${Date.now()}.txt`
      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .createSignedUploadUrl(testPath, { upsert: true })

      if (error) {
        return NextResponse.json({
          error: 'Signed URL creation failed',
          step: 'signed_url_creation',
          details: error,
          bucket: SUPABASE_BUCKET,
          path: testPath
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'All tests passed',
        bucket: SUPABASE_BUCKET,
        testPath,
        hasSignedUrl: !!data?.signedUrl,
        sessionUserId: session.user.id
      })

    } catch (signedUrlError) {
      return NextResponse.json({
        error: 'Exception during signed URL creation',
        step: 'signed_url_exception',
        details: signedUrlError instanceof Error ? signedUrlError.message : String(signedUrlError)
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Debug upload error:', error)
    return NextResponse.json({
      error: 'Debug endpoint failed',
      step: 'general_error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 