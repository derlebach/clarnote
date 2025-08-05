# 🔐 Google OAuth Setup for Clarnote Production

## 📋 **Required Steps for Production**

### 1. **Google Cloud Console Configuration**

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Select your project** or create a new one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google People API"

### 2. **Configure OAuth Consent Screen**

1. **Go to**: "APIs & Services" > "OAuth consent screen"
2. **Choose**: External (for public access)
3. **Fill required fields**:
   - App name: `Clarnote`
   - User support email: `your-email@domain.com`
   - Developer contact: `your-email@domain.com`
   - App domain: `https://www.clarnote.com`
   - Privacy policy: `https://www.clarnote.com/privacy` (optional)
   - Terms of service: `https://www.clarnote.com/terms` (optional)

### 3. **Configure OAuth Credentials**

1. **Go to**: "APIs & Services" > "Credentials"
2. **Click**: "Create Credentials" > "OAuth 2.0 Client IDs"
3. **Application type**: Web application
4. **Name**: `Clarnote Production`
5. **Authorized redirect URIs** (CRITICAL):
   ```
   https://www.clarnote.com/api/auth/callback/google
   ```

### 4. **Vercel Environment Variables**

Add these to your Vercel dashboard (Settings > Environment Variables):

```bash
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=https://www.clarnote.com
NEXTAUTH_SECRET=your_random_secret_here_32_chars_min

# Database (if using PostgreSQL on Vercel)
DATABASE_URL=postgresql://...your_vercel_postgres_url

# Stripe (if needed)
STRIPE_SECRET_KEY=sk_live_...your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...your_stripe_public

# WhisperX (if using)
WHISPERX_ENDPOINT=https://derlebach--clarnote-whisperx-api.modal.run
```

### 5. **Generate NEXTAUTH_SECRET**

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## 🔍 **Troubleshooting**

### Common Issues:

1. **"OAuthAccountNotLinked"**:
   - Check redirect URI matches exactly
   - Ensure NEXTAUTH_URL is set correctly
   - Verify Google OAuth credentials

2. **"Access Denied"**:
   - Check OAuth consent screen is configured
   - Ensure APIs are enabled in Google Cloud

3. **"Invalid Client"**:
   - Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - Check if credentials are for correct environment

## ✅ **Testing Checklist**

- [ ] Google Cloud Console project created
- [ ] OAuth consent screen configured
- [ ] Redirect URI: `https://www.clarnote.com/api/auth/callback/google`
- [ ] Environment variables set in Vercel
- [ ] NEXTAUTH_SECRET generated and set
- [ ] Test login flow

## 🚀 **After Setup**

Once configured, redeploy your Vercel project to apply the new environment variables. 