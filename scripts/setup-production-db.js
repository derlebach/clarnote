#!/usr/bin/env node

const { exec } = require('child_process');

console.log(`
🚀 PRODUCTION DATABASE SETUP

This script will create the required database tables on your Supabase PostgreSQL database.

🎯 WHAT THIS DOES:
1. Uses your Vercel DATABASE_URL to connect to Supabase
2. Creates all required tables (User, Account, Session, etc.)
3. Sets up the database schema for NextAuth + Prisma

⚠️  REQUIREMENTS:
- DATABASE_URL must be set in your environment
- Must be the Supabase Transaction pooler URL
- Database password must be correct

Starting database setup...
`);

// First, let's check if we can connect to the database
console.log('🔍 Testing database connection...');

// Set the DATABASE_URL from Vercel (you'll need to copy it here temporarily)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.wimumucfuvgqbfwqnwyy:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

if (DATABASE_URL.includes('YOUR_PASSWORD')) {
  console.log(`
❌ DATABASE_URL SETUP REQUIRED:

You need to set the DATABASE_URL environment variable with your actual Supabase password.

STEPS:
1. Copy your DATABASE_URL from Vercel Dashboard
2. Export it in your terminal:
   export DATABASE_URL="postgresql://postgres.wimumucfuvgqbfwqnwyy:REAL_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
3. Run this script again: node scripts/setup-production-db.js

OR run directly:
DATABASE_URL="your_connection_string_here" node scripts/setup-production-db.js
`);
  process.exit(1);
}

console.log('✅ DATABASE_URL is configured');
console.log('🔧 Running prisma db push to create tables...');

// Run prisma db push to create the database schema
exec('npx prisma db push', { env: { ...process.env, DATABASE_URL } }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Database setup failed:');
    console.error(error.message);
    console.log(`
🔧 MANUAL FIX STEPS:

1. Double-check your DATABASE_URL password is correct
2. Make sure you're using the Transaction pooler URL from Supabase
3. Verify the database exists and is accessible

Try running manually:
DATABASE_URL="your_connection_string" npx prisma db push
`);
    return;
  }

  if (stderr) {
    console.log('⚠️  Warnings:', stderr);
  }

  console.log('📊 Prisma output:');
  console.log(stdout);
  
  console.log(`
🎉 DATABASE SETUP COMPLETE!

✅ Database tables created successfully
✅ Schema is now ready for production
✅ Registration should now work!

🧪 TEST IT:
Go to https://www.clarnote.com/auth/signup and try registering!
`);
}); 