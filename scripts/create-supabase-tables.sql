-- Emergency table creation for Clarnote
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS "Session" CASCADE;
-- DROP TABLE IF EXISTS "Account" CASCADE;
-- DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create Account table (for OAuth providers like Google)
CREATE TABLE IF NOT EXISTS "Account" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    UNIQUE("provider", "providerAccountId")
);

-- Create Session table (for NextAuth sessions)
CREATE TABLE IF NOT EXISTS "Session" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Session_sessionToken_idx" ON "Session"("sessionToken");

-- Enable Row Level Security (RLS) - recommended for Supabase
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- Create policies (basic ones - you may want to customize)
CREATE POLICY "Users can read own data" ON "User" FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON "User" FOR UPDATE USING (auth.uid()::text = id);

-- Grant necessary permissions
GRANT ALL ON "User" TO postgres;
GRANT ALL ON "Account" TO postgres;
GRANT ALL ON "Session" TO postgres;

-- Show success message
SELECT 'Tables created successfully! You can now test registration.' as status; 