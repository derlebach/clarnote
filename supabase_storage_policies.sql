-- =====================================================
-- Supabase Storage RLS Policies for Clarnote Bucket
-- =====================================================

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "allow_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "allow_anon_select" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_select" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_delete" ON storage.objects;

-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSERT POLICIES (Upload permissions)
-- =====================================================

-- Allow authenticated users to upload files ONLY to their own folder in Clarnote bucket
CREATE POLICY "authenticated_upload_own_folder" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'Clarnote'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- SELECT POLICIES (Download/Read permissions)
-- =====================================================

-- Allow authenticated users to read files from their own folder in Clarnote bucket
CREATE POLICY "authenticated_read_own_folder" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'Clarnote'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Optional: Allow public read access to all files in Clarnote bucket
-- Uncomment the following policy if you want files to be publicly readable
-- (useful for sharing transcripts or if you use signed URLs for access control)
/*
CREATE POLICY "public_read_clarnote" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'Clarnote');
*/

-- =====================================================
-- UPDATE POLICIES (Modify permissions)
-- =====================================================

-- Allow authenticated users to update files in their own folder
CREATE POLICY "authenticated_update_own_folder" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'Clarnote'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'Clarnote'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- DELETE POLICIES (Remove permissions)
-- =====================================================

-- Allow authenticated users to delete files from their own folder
CREATE POLICY "authenticated_delete_own_folder" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'Clarnote'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these queries to verify the policies are created correctly:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
-- SELECT bucket_id, name, owner FROM storage.objects WHERE bucket_id = 'Clarnote' LIMIT 5; 