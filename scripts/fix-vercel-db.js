#!/usr/bin/env node

console.log(`
🚨 VERCEL DATABASE CONNECTION FIX

PROBLEM: Registration failing with "Database error" on production
ROOT CAUSE: DATABASE_URL not properly configured in Vercel

IMMEDIATE ACTION REQUIRED:

1. 🌐 Go to: https://vercel.com/dashboard
2. 📁 Find your project (likely "trackmind" or "clarnote")  
3. ⚙️  Go to: Settings → Environment Variables
4. 🔍 Look for DATABASE_URL

CURRENT STATUS CHECK:
- Local development: ✅ Working (using SQLite)
- Production registration: ❌ Failing (needs PostgreSQL)

EXACT VALUE TO SET:
DATABASE_URL = postgresql://postgres.wimumucfuvgqbfwqnwyy:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

REPLACE [YOUR-PASSWORD] with your actual Supabase database password!

After setting this:
1. ✅ Email registration will work
2. ✅ Google OAuth will work  
3. ✅ All auth flows will be functional

This is NOT a code problem - it's just a missing environment variable! 🎯
`)

// Test the current production endpoint
console.log('Testing production registration endpoint...')
fetch('https://www.clarnote.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Test User',
    email: 'test-' + Date.now() + '@example.com',
    password: 'testpass123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('\n📊 CURRENT PRODUCTION STATUS:')
  if (data.error === 'Database error') {
    console.log('❌ CONFIRMED: Database connection failing')
    console.log('🔧 SOLUTION: Set DATABASE_URL in Vercel Dashboard NOW!')
  } else if (data.success) {
    console.log('✅ FIXED: Registration is now working!')
  } else {
    console.log('❓ Unexpected response:', data)
  }
})
.catch(err => {
  console.log('❌ Network error:', err.message)
}) 