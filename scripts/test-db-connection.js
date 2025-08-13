#!/usr/bin/env node

console.log(`
🔍 DATABASE CONNECTION TESTER

This script will help you verify the correct DATABASE_URL format for Supabase.

📋 STEPS TO GET THE CORRECT URL:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (wimumucfuvgqbfwqnwyy)
3. Go to Settings → Database
4. Look for "Connection string" section
5. Select "Transaction pooler" (NOT Direct connection)
6. Copy the URL that looks like:
   postgresql://postgres.wimumucfuvgqbfwqnwyy:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

🚨 COMMON MISTAKES:

❌ Using Direct connection instead of Transaction pooler
❌ Not replacing [YOUR-PASSWORD] with actual password
❌ Using Session pooler instead of Transaction pooler
❌ Missing the database name at the end (/postgres)

✅ CORRECT FORMAT:
postgresql://postgres.wimumucfuvgqbfwqnwyy:REAL_PASSWORD_HERE@aws-0-us-west-1.pooler.supabase.com:6543/postgres

🎯 WHAT TO DO:

1. Get the Transaction pooler URL from Supabase
2. Replace [YOUR-PASSWORD] with your actual database password
3. Update it in Vercel Dashboard → Settings → Environment Variables → DATABASE_URL
4. Redeploy your application

After this, registration should work immediately! 🚀
`)

// Try to connect to a test endpoint to verify current status
console.log('\\nTesting current production status...')
fetch('https://www.clarnote.com/api/health/auth')
  .then(res => res.json())
  .then(data => {
    console.log('\\n📊 PRODUCTION HEALTH CHECK:')
    console.log('✅ Auth configuration:', data.ok ? 'OK' : 'FAILED')
    if (data.problems && data.problems.length > 0) {
      console.log('❌ Problems found:', data.problems)
    } else {
      console.log('✅ No auth configuration problems detected')
      console.log('🔍 Issue is likely database connection string format')
    }
  })
  .catch(err => {
    console.log('❌ Failed to check health endpoint:', err.message)
  }) 