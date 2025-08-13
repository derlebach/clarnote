// Test script to debug credentials authentication
console.log('🔍 DEBUGGING CREDENTIALS AUTHENTICATION')
console.log('=====================================')

// Test what's in the database
const supabaseUrl = 'https://wimumucfuvgqbfwqnwyy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbXVtdWNmdXZncWJmd3Fubnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MDcwNjQsImV4cCI6MjA1MjM4MzA2NH0.VBg7CWCrUK9_4Y4W8s7KAD6yvAH1ksKTqRYnL3Ywsxw'

async function testCredentials() {
  try {
    console.log('\n1️⃣ CHECKING DATABASE USERS:')
    
    // Fetch all users to see what's there
    const response = await fetch(`${supabaseUrl}/rest/v1/User`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.log('❌ Failed to fetch users:', response.status, response.statusText)
      return
    }

    const users = await response.json()
    console.log(`✅ Found ${users.length} users in database:`)
    
    users.forEach((user, i) => {
      console.log(`  ${i + 1}. Email: ${user.email}`)
      console.log(`     Name: ${user.name}`)
      console.log(`     Has Password: ${!!user.password}`)
      console.log(`     ID: ${user.id}`)
      console.log('')
    })

    console.log('\n2️⃣ TESTING SPECIFIC EMAIL LOOKUP:')
    
    // Test the exact query our auth provider uses
    const testEmail = 'de.erlebach@gmail.com'
    const emailResponse = await fetch(`${supabaseUrl}/rest/v1/User?email=eq.${testEmail}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!emailResponse.ok) {
      console.log('❌ Email lookup failed:', emailResponse.status)
      return
    }

    const emailUsers = await emailResponse.json()
    console.log(`✅ Email lookup for ${testEmail}:`)
    console.log('Result:', emailUsers.length > 0 ? emailUsers[0] : 'No user found')

    console.log('\n3️⃣ TESTING PASSWORD VERIFICATION:')
    if (emailUsers.length > 0 && emailUsers[0].password) {
      const bcrypt = require('bcryptjs')
      const testPassword = 'your_test_password_here' // You'll need to replace this
      
      console.log('Stored hash:', emailUsers[0].password.substring(0, 20) + '...')
      console.log('Test password:', testPassword)
      
      // Note: You'll need to run this with the actual password you used
      console.log('⚠️  Replace testPassword with your actual password to test hash comparison')
    }

  } catch (error) {
    console.error('❌ Error during diagnosis:', error)
  }
}

testCredentials() 