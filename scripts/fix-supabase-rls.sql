-- Fix RLS policies to allow registration
-- Run this in your Supabase SQL Editor

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can read own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";

-- Create more permissive policies for registration
CREATE POLICY "Allow registration" ON "User" 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow user to read own data" ON "User" 
    FOR SELECT 
    USING (auth.uid()::text = id OR auth.role() = 'authenticated');

CREATE POLICY "Allow user to update own data" ON "User" 
    FOR UPDATE 
    USING (auth.uid()::text = id);

-- Allow Account table operations (for OAuth)
CREATE POLICY "Allow account creation" ON "Account" 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow account read" ON "Account" 
    FOR SELECT 
    USING (true);

-- Allow Session table operations
CREATE POLICY "Allow session creation" ON "Session" 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow session read" ON "Session" 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow session delete" ON "Session" 
    FOR DELETE 
    USING (true);

-- Show success message
SELECT 'RLS policies updated! Registration should now work.' as status; 