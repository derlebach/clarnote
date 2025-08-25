import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { createReadStream, existsSync, writeFileSync, mkdirSync } from 'fs'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabaseServer'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for transcription

export async function POST(request: NextRequest) {
  let meetingId: string | undefined
  
  try {
    const { meetingId: id } = await request.json()
    meetingId = id
    
    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 })
    }
    
    console.log('🎯 Simple Transcription starting for meeting:', meetingId)
    
    // 1. Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    // 2. Get meeting details
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    })
    
    if (!meeting || !meeting.fileUrl) {
      throw new Error('Meeting or file not found')
    }
    
    console.log('📁 Meeting found:', meeting.title)
    console.log('🔗 File URL:', meeting.fileUrl)
    
    // 3. Update status to transcribing
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'TRANSCRIBING' }
    })
    
    // 4. Download file from Supabase
    if (!meeting.fileUrl.startsWith('supabase://')) {
      throw new Error('Only Supabase files supported')
    }
    
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    // Parse Supabase URL: supabase://Clarnote/userId/filename
    const urlPath = meeting.fileUrl.replace('supabase://', '')
    const [bucket, ...pathParts] = urlPath.split('/')
    const objectPath = pathParts.join('/')
    
    console.log('⬇️ Downloading from Supabase:', { bucket, objectPath })
    
    const { data, error } = await supabase.storage.from(bucket).download(objectPath)
    if (error || !data) {
      throw new Error(`Download failed: ${error?.message || 'No data'}`)
    }
    
    // 5. Save to temporary file
    const tempDir = join(process.cwd(), '.tmp')
    mkdirSync(tempDir, { recursive: true })
    const tempFile = join(tempDir, `${meetingId}-${Date.now()}.audio`)
    
    const arrayBuffer = await data.arrayBuffer()
    writeFileSync(tempFile, Buffer.from(arrayBuffer))
    
    if (!existsSync(tempFile)) {
      throw new Error('Failed to save temporary file')
    }
    
    console.log('💾 File saved to:', tempFile)
    
    // 6. Transcribe with OpenAI
    console.log('🤖 Starting OpenAI transcription...')
    
    const audioFile = createReadStream(tempFile)
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: meeting.language === 'auto' ? undefined : meeting.language,
      response_format: 'verbose_json',
      temperature: 0
    }) as any
    
    console.log('✅ Transcription completed')
    console.log('📝 Text length:', transcription.text?.length || 0)
    console.log('🌍 Detected language:', transcription.language || 'unknown')
    
    // 7. Update meeting with results
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'COMPLETED',
        transcript: transcription.text || '',
        language: transcription.language || meeting.language,
        duration: Math.round((transcription.duration || 0) * 1000) // Convert to milliseconds
      }
    })
    
    console.log('🎉 Meeting updated successfully!')
    
    // 8. Clean up temp file
    try {
      const fs = require('fs')
      fs.unlinkSync(tempFile)
      console.log('🧹 Temp file cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Failed to cleanup temp file:', cleanupError)
    }
    
    return NextResponse.json({
      success: true,
      transcript: transcription.text,
      language: transcription.language,
      duration: transcription.duration
    })
    
  } catch (error) {
    console.error('💥 Simple Transcription Error:', error)
    
    // Update meeting status to error
    if (meetingId) {
      try {
        await prisma.meeting.update({
          where: { id: meetingId },
          data: { 
            status: 'ERROR',
            description: `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        })
        console.log('❌ Meeting marked as ERROR')
      } catch (updateError) {
        console.error('Failed to update meeting status:', updateError)
      }
    }
    
    return NextResponse.json({
      error: 'Transcription failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 