# 🚀 Quick Fix for Clarnote Production Issues

## ⚠️ **Current Issues Identified:**
1. Google OAuth "OAuthAccountNotLinked" error
2. Broken logo images in production

## 🔧 **Immediate Fix Steps:**

### 1. **Google OAuth Setup (5 mins)**

**Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)

1. **Enable APIs**:
   - APIs & Services > Library
   - Enable "Google+ API" and "Google People API"

2. **OAuth Credentials**:
   - APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - **Authorized redirect URIs**: `https://www.clarnote.com/api/auth/callback/google`

3. **Get your credentials** and add to Vercel:

### 2. **Vercel Environment Variables**

**Go to**: [vercel.com/dashboard](https://vercel.com/dashboard) > Your Project > Settings > Environment Variables

**Add these variables**:
```bash
GOOGLE_CLIENT_ID=your_google_client_id_from_step_1
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_step_1
NEXTAUTH_URL=https://www.clarnote.com
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
DATABASE_URL=your_database_url_if_needed
```

### 3. **Generate NEXTAUTH_SECRET**

**Run locally**:
```bash
openssl rand -base64 32
```
Copy the output to NEXTAUTH_SECRET in Vercel.

### 4. **Deploy Logo Fix**

**The logo fix is ready** - just commit and push:

```bash
git add -A
git commit -m "🔧 Fix production logo loading and Google OAuth setup"
git push origin main
```

## ✅ **Testing After Setup:**

1. **Wait for Vercel deployment** to complete (~2 minutes)
2. **Test Google login** at: https://www.clarnote.com/auth/signin
3. **Check logo display** on homepage

## 🆘 **If Still Having Issues:**

### Google OAuth:
- Double-check redirect URI: `https://www.clarnote.com/api/auth/callback/google`
- Ensure OAuth consent screen is published (not in testing mode)
- Verify environment variables are set in Vercel

### Logo:
- Hard refresh browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
- Check browser console for any image loading errors
- Ensure logo.svg exists in public directory

## 📞 **Emergency Commands:**

**If you need to rollback**:
```bash
# Revert to previous deployment
vercel rollback
```

**Force redeploy**:
```bash
# Make a small change and push
echo "# Force deploy $(date)" >> README.md
git add README.md
git commit -m "Force redeploy"
git push origin main
```

## 🎯 **Expected Results:**

After completing these steps:
- ✅ Google OAuth login should work
- ✅ Logo should display correctly 
- ✅ No more authentication errors
- ✅ Full Clarnote functionality restored 