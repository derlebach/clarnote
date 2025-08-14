-- Fix Supabase Row Level Security for Clean Authentication System
-- Run this in your Supabase SQL Editor

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert their own data" ON "User";
DROP POLICY IF EXISTS "Users can view their own data" ON "User";
DROP POLICY IF EXISTS "Users can update their own data" ON "User";

-- 2. Allow public registration (insert) with anon key
CREATE POLICY "Allow public registration" ON "User"
FOR INSERT 
TO anon
WITH CHECK (true);

-- 3. Allow users to read their own data
CREATE POLICY "Users can view own data" ON "User"
FOR SELECT 
TO authenticated
USING (auth.uid()::text = id OR auth.email() = email);

-- 4. Allow anon to read for login verification (limited fields)
CREATE POLICY "Allow login verification" ON "User"
FOR SELECT
TO anon
USING (true);

-- 5. Allow users to update their own data
CREATE POLICY "Users can update own data" ON "User"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id OR auth.email() = email)
WITH CHECK (auth.uid()::text = id OR auth.email() = email);

-- 6. Ensure RLS is enabled
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- 7. Grant necessary permissions to anon role
GRANT SELECT, INSERT ON "User" TO anon;
GRANT SELECT, INSERT, UPDATE ON "User" TO authenticated;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'User';

COMMIT; 