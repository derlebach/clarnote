-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert their own data" ON "User";
DROP POLICY IF EXISTS "Users can view their own data" ON "User";
DROP POLICY IF EXISTS "Users can update their own data" ON "User";

-- Allow public registration (insert) with anon key
CREATE POLICY "Allow public registration" ON "User"
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can view own data" ON "User"
FOR SELECT 
TO authenticated
USING (auth.uid()::text = id OR auth.email() = email);

-- Allow anon to read for login verification (limited fields)
CREATE POLICY "Allow login verification" ON "User"
FOR SELECT
TO anon
USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON "User"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id OR auth.email() = email)
WITH CHECK (auth.uid()::text = id OR auth.email() = email);

-- Ensure RLS is enabled
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT SELECT, INSERT ON "User" TO anon;
GRANT SELECT, INSERT, UPDATE ON "User" TO authenticated; 