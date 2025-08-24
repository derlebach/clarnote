import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('DB Test - Starting database connection test')
    
    // Test 1: Basic connection
    console.log('DB Test - Testing basic connection...')
    await prisma.$connect()
    console.log('DB Test - Connection successful')
    
    // Test 2: Check if User table exists and can be queried
    console.log('DB Test - Testing User table query...')
    const userCount = await prisma.user.count()
    console.log('DB Test - User table accessible, count:', userCount)
    
    // Test 3: Check if Meeting table exists
    console.log('DB Test - Testing Meeting table query...')
    const meetingCount = await prisma.meeting.count()
    console.log('DB Test - Meeting table accessible, count:', meetingCount)
    
    // Test 4: Check database info
    console.log('DB Test - Getting database info...')
    const dbInfo = await prisma.$queryRaw`SELECT version()` as any[]
    console.log('DB Test - Database version:', dbInfo[0])
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      meetingCount,
      databaseVersion: dbInfo[0]?.version || 'Unknown'
    })
    
  } catch (error) {
    console.error('DB Test - Error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 