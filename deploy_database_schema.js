#!/usr/bin/env node

/**
 * Database Schema Deployment Script
 * 
 * This script ensures that the database schema is properly deployed to production.
 * Run this when you get "Failed to create user account" errors.
 */

const { PrismaClient } = require('@prisma/client')

async function deploySchema() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🚀 Starting database schema deployment...')
    
    // Test connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if tables exist
    console.log('🔍 Checking existing tables...')
    
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ User table exists with ${userCount} records`)
    } catch (error) {
      console.log('❌ User table does not exist or is not accessible')
      console.log('Error:', error.message)
    }
    
    try {
      const meetingCount = await prisma.meeting.count()
      console.log(`✅ Meeting table exists with ${meetingCount} records`)
    } catch (error) {
      console.log('❌ Meeting table does not exist or is not accessible')
      console.log('Error:', error.message)
    }
    
    // Get database info
    console.log('📊 Database information:')
    const dbInfo = await prisma.$queryRaw`SELECT version()`
    console.log('Database version:', dbInfo[0]?.version)
    
    // Try to create a test user to see what fails
    console.log('🧪 Testing user creation...')
    try {
      const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          name: 'Test User',
          image: null
        }
      })
      console.log('✅ User creation test successful:', testUser.id)
      
      // Clean up test user
      await prisma.user.delete({ where: { id: testUser.id } })
      console.log('🧹 Test user cleaned up')
    } catch (error) {
      console.log('❌ User creation failed:', error.message)
      console.log('This is likely the cause of the upload failure')
    }
    
    console.log('✅ Database schema deployment check complete')
    
  } catch (error) {
    console.error('❌ Database schema deployment failed:', error)
    console.error('Stack:', error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  deploySchema()
}

module.exports = { deploySchema } 