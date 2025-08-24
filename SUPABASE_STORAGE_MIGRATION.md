# Supabase Storage Migration Guide

## Overview
This migration fixes the "new row violates row-level security policy" error by:
1. Correcting bucket name usage throughout the codebase
2. Implementing secure signed URL upload flow
3. Setting up proper RLS policies for authenticated users only

## Changes Made

### 1. Updated Bucket Configuration
- **File**: `src/lib/storage.ts`
- **Change**: Updated default bucket name from 'uploads' to 'Clarnote'
- **Reason**: Match the actual Supabase bucket name (case-sensitive)

### 2. New Signed Upload URL API
- **File**: `src/app/api/upload-url/route.ts` (NEW)
- **Purpose**: Generate signed upload URLs with proper authentication
- **Features**:
  - Requires authentication
  - Creates user-specific paths (`{userId}/{uniqueId}.{ext}`)
  - Returns signed URL and canonical path
  - 10-minute URL expiration for security

### 3. Updated Client Upload Flow
- **File**: `src/app/dashboard/page.tsx`
- **Changes**:
  - Removed direct Supabase client uploads
  - Implemented 3-step signed URL flow:
    1. Request signed URL from `/api/upload-url`
    2. Upload file directly to Supabase using signed URL
    3. Create meeting record via `/api/upload`
  - Added progress indicators
  - Improved error handling

### 4. Server-Side Compatibility
- **Files**: `src/app/api/upload/route.ts`, `src/app/api/transcribe/route.ts`
- **Status**: Already compatible with 'Clarnote' bucket via `SUPABASE_BUCKET` constant
- **Features**: Proper bucket name parsing and file path resolution

## Database Migration Required

### Step 1: Run SQL Migration
Execute the SQL script in `supabase_storage_policies.sql` in your Supabase SQL Editor:

```sql
-- This script will:
-- 1. Drop old conflicting policies
-- 2. Create secure policies for authenticated users only
-- 3. Enforce user-folder isolation (users can only access their own files)
```

### Step 2: Verify Policies
After running the migration, verify with:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Step 3: Test Upload
1. Deploy the updated code
2. Try uploading a file through the dashboard
3. Check that files are stored in `Clarnote` bucket under user-specific folders

## Security Features

### RLS Policy Structure
- **INSERT**: Users can only upload to `Clarnote/{their_user_id}/...`
- **SELECT**: Users can only read from `Clarnote/{their_user_id}/...`
- **UPDATE**: Users can only modify files in their own folder
- **DELETE**: Users can only delete files in their own folder
- **Anonymous Access**: Completely disabled for security

### File Path Structure
All files are now stored with the pattern:
```
Clarnote/{user_id}/{timestamp}_{random}.{extension}
```

### Signed URL Benefits
- No direct client access to storage credentials
- Server-controlled upload permissions
- Automatic path generation with user isolation
- Time-limited upload URLs (10 minutes)

## Environment Variables
Ensure these are set in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_BUCKET=Clarnote` (optional, defaults to 'Clarnote')

## Troubleshooting

### Common Issues
1. **"new row violates row-level security policy"**
   - Ensure SQL migration was run correctly
   - Verify user is authenticated
   - Check that bucket name is exactly 'Clarnote' (case-sensitive)

2. **"Failed to get upload URL"**
   - Verify user is logged in
   - Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
   - Ensure Supabase client is configured properly

3. **Upload fails after getting signed URL**
   - Check file size limits (Supabase default: 50MB)
   - Verify signed URL hasn't expired (10-minute limit)
   - Check network connectivity

### Verification Steps
1. Check policies exist:
   ```sql
   SELECT policyname, cmd, roles FROM pg_policies 
   WHERE tablename = 'objects' AND schemaname = 'storage';
   ```

2. Test file upload through dashboard
3. Verify files appear in correct bucket/folder structure
4. Confirm transcription works with new file paths

## Migration Checklist
- [ ] Update `src/lib/storage.ts` with correct bucket name
- [ ] Create `src/app/api/upload-url/route.ts` API route
- [ ] Update client upload flow in `src/app/dashboard/page.tsx`
- [ ] Run SQL migration script in Supabase
- [ ] Verify RLS policies are created
- [ ] Test upload functionality
- [ ] Deploy to production
- [ ] Verify production uploads work correctly 