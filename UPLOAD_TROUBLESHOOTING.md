# Upload Troubleshooting Guide

## Current Issue: Upload Error

The upload is failing with a generic "Upload - Error" message. Here's how to diagnose and fix it:

## Step 1: Check Browser Console for Detailed Errors

After deployment (in ~2 minutes), try uploading again and check the browser console for detailed error messages. Look for:

1. **Upload URL API errors:**
   - `Upload URL API - Session check:` - Shows authentication status
   - `Upload URL API - Request body parsed:` - Shows if file data is being sent correctly
   - `Upload URL API - Supabase signed URL error:` - Shows if RLS policies are blocking

2. **Client-side errors:**
   - `Upload - Requesting signed URL for:` - Shows file being processed
   - `Upload - Received signed URL for path:` - Shows if signed URL was generated
   - `Upload - Storage upload failed:` - Shows if direct upload to Supabase failed
   - `Upload - Detailed error info:` - Shows specific error details

## Step 2: Most Likely Issues and Solutions

### Issue A: RLS Policies Not Applied
**Symptom:** Error contains "new row violates row-level security policy" or "403 Forbidden"

**Solution:** Run the SQL migration in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase_storage_policies_fixed.sql`
3. Execute the script
4. Try upload again

### Issue B: Missing Environment Variables
**Symptom:** Error contains "Storage service not configured" or "Supabase not configured"

**Solution:** Check Vercel environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓ (most critical for signed URLs)

### Issue C: Authentication Issues
**Symptom:** Error contains "Authentication required" or "No session"

**Solution:**
1. Sign out and sign back in
2. Clear browser cookies for the site
3. Check if NextAuth is working properly

### Issue D: File Size or Type Issues
**Symptom:** Error during file validation or upload

**Solution:**
- Ensure file is under 50MB
- Use supported formats: MP3, WAV, M4A, MP4, MOV, AVI

## Step 3: Debug Commands

### Test the Upload URL API directly:
```javascript
// Run this in browser console after signing in:
fetch('/api/upload-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    fileName: 'test.mp3',
    mime: 'audio/mpeg'
  })
})
.then(r => r.json())
.then(data => console.log('Upload URL result:', data))
.catch(e => console.error('Upload URL error:', e))
```

### Test the Debug Endpoint:
```javascript
// Run this in browser console after signing in:
fetch('/api/debug-upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: '{}'
})
.then(r => r.json())
.then(data => console.log('Debug result:', data))
.catch(e => console.error('Debug error:', e))
```

## Step 4: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on the failing function (likely `/api/upload-url`)
3. Check the real-time logs for detailed error messages

## Step 5: Expected Success Flow

When working correctly, you should see this sequence in browser console:

```
Upload - Requesting signed URL for: your-file.mp3
Upload URL API - Request started
Upload URL API - Session check: {hasSession: true, hasUser: true, userId: "..."}
Upload URL API - Request body parsed: {hasFileName: true, hasMime: true, ...}
Upload URL API - Creating signed URL for: {...}
Upload URL API - Successfully created signed URL: {...}
Upload - Received signed URL for path: user-id/timestamp-file.mp3
Upload - Starting direct upload to Supabase Storage
Upload - File successfully uploaded to storage
Upload - Creating meeting record
Upload - Meeting created successfully: meeting-id
```

## Quick Fix Checklist

- [ ] SQL migration run in Supabase
- [ ] Environment variables set in Vercel
- [ ] User is signed in properly
- [ ] File is under 50MB and supported format
- [ ] Browser console shows detailed error logs
- [ ] Vercel function logs checked

## Contact Information

If the issue persists after trying these steps, provide:
1. Browser console logs (full error messages)
2. Vercel function logs
3. File type and size being uploaded
4. Which step in the troubleshooting guide was tried 