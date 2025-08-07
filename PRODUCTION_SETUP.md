# 🚀 Production Deployment Setup for Clarnote

## 📋 **Required Environment Variables for Vercel**

Add these environment variables in your Vercel dashboard (`Settings > Environment Variables`):

### 🔐 **Authentication (Required)**
```bash
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=jA8CQsVJyno4+6dCHVwNg7NdpEvbygPOROxWEP7f1U4=
```

### 🗄️ **Database (Required)**
```bash
DATABASE_URL=file:./prod.db
```

### 🔑 **Google OAuth (Required for Google Login)**
```bash
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 🤖 **OpenAI (Required for AI Features)**
```bash
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

### 📁 **File Upload Configuration**
```bash
MAX_FILE_SIZE=25000000
ALLOWED_FILE_TYPES=audio/mpeg,audio/wav,audio/mp4,video/mp4,audio/m4a
```

### 🎙️ **WhisperX (Required for Transcription)**
```bash
WHISPERX_ENDPOINT=https://your-whisperx-endpoint-here
WHISPERX_API_KEY=your-whisperx-api-key-here
```

### 💳 **Stripe (Optional - for payments)**
```bash
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key-here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key-here
```

### ☁️ **Supabase (Optional)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```

---

## 🔧 **Google OAuth Setup for Production**

### 1. **Update Google Cloud Console**
Go to [Google Cloud Console](https://console.cloud.google.com/):

1. **Navigate to**: APIs & Services > Credentials
2. **Find your OAuth 2.0 Client ID**: (Use your actual Google Client ID from .env.local)
3. **Add Authorized Redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
4. **Add Authorized JavaScript Origins**:
   ```
   https://your-app-name.vercel.app
   ```

### 2. **Update Authorized Domains**
In the OAuth consent screen, add your production domain:
```
your-app-name.vercel.app
```

---

## 📝 **Step-by-Step Deployment Process**

### 1. **Set Environment Variables on Vercel**
```bash
# Go to Vercel Dashboard > Your Project > Settings > Environment Variables
# Copy the actual values from your .env.local file
```

### 2. **Update NEXTAUTH_URL**
**CRITICAL**: Replace `your-app-name.vercel.app` with your actual Vercel URL:
```bash
NEXTAUTH_URL=https://clarnote.vercel.app  # Replace with your actual URL
```

### 3. **Use Production Secret**
Use this generated secure secret for NEXTAUTH_SECRET:
```bash
NEXTAUTH_SECRET=jA8CQsVJyno4+6dCHVwNg7NdpEvbygPOROxWEP7f1U4=
```

### 4. **Deploy to Vercel**
```bash
# Push to Git (triggers automatic deployment)
git add .
git commit -m "Add production configuration"
git push origin main
```

---

## 🐛 **Common Issues & Solutions**

### ❌ **"Invalid email or password" on Production**
- ✅ Check `NEXTAUTH_URL` matches your production URL exactly
- ✅ Ensure `NEXTAUTH_SECRET` is set and unique
- ✅ Clear browser cache/cookies

### ❌ **Google Login "400 Bad Request"**
- ✅ Add production URL to Google OAuth redirect URIs
- ✅ Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- ✅ Check authorized domains in Google Console

### ❌ **Database Errors**
- ✅ Ensure `DATABASE_URL` is set correctly
- ✅ Run database migrations: `npx prisma db push`

### ❌ **Build Failures**
- ✅ Check all required environment variables are set
- ✅ Verify no syntax errors in configuration files

---

## 🔍 **Testing Production Deployment**

1. **Test Authentication**:
   - Try email login with: `de.erlebach@gmail.com` / `Mind&De2025!`
   - Try Google OAuth login

2. **Test Core Features**:
   - File upload
   - Meeting creation
   - Dashboard access

3. **Check Logs**:
   - Vercel Functions tab for error logs
   - Browser Developer Tools for client errors

---

## 🎯 **Quick Fix Commands**

```bash
# If you need to quickly update production:
git add . && git commit -m "Fix production config" && git push origin main

# To check deployment status:
vercel --prod

# To view production logs:
vercel logs --prod
```

---

## 📧 **Actual Values Reference**

**IMPORTANT**: Use the actual values from your `.env.local` file when setting up Vercel environment variables. The placeholders above are just examples.

Your actual values are stored securely in your local `.env.local` file. 