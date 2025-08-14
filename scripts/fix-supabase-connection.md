# 🔧 Fix Supabase Connection Issues

## 🎯 **Problem Identified:**
- **401 Unauthorized** when connecting to Supabase REST API
- **Database errors** on registration/authentication
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** is invalid or expired

## 🛠️ **Step-by-Step Solution:**

### **Step 1: Get Fresh Supabase Credentials**

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **clarnote project** (`wimumucfuvgqbfwqnwyy`)
3. Navigate to **Settings → API**
4. Copy these values:

```bash
# Project URL (should be the same)
NEXT_PUBLIC_SUPABASE_URL=https://wimumucfuvgqbfwqnwyy.supabase.co

# Get a FRESH anon/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (copy the full key)

# Optional: Service role key (if needed)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (copy the full key)
```

5. Navigate to **Settings → Database**
6. Copy the **Direct connection** string:

```bash
# Use Direct connection (not Transaction pooler)
DATABASE_URL=postgresql://postgres.wimumucfuvgqbfwqnwyy:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### **Step 2: Update Vercel Environment Variables**

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **clarnote** project
3. Go to **Settings → Environment Variables**
4. Update these variables:

| Variable Name | Value | Notes |
|---------------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Fresh key from Step 1 | ⚠️ CRITICAL |
| `DATABASE_URL` | Direct connection string | Use your actual password |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Optional |

5. **Redeploy** your application after updating

### **Step 3: Test Connection**

Run this test after updating Vercel:

```bash
node -e "
fetch('https://www.clarnote.com/api/health/auth')
  .then(res => res.json())
  .then(data => console.log('Health:', data))
  .catch(console.error)
"
```

### **Step 4: Verify Database Tables**

1. Go to **Supabase Dashboard → SQL Editor**
2. Run this query to check if tables exist:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'Account', 'Session');
```

3. If tables are missing, run the table creation script:

```sql
-- Run the contents of scripts/create-supabase-tables.sql
```

### **Step 5: Test Registration**

After fixing the API key, test the original registration endpoint:

```bash
node -e "
fetch('https://www.clarnote.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Test User',
    email: 'test-' + Date.now() + '@example.com',
    password: 'testpass123'
  })
})
.then(res => res.json())
.then(data => console.log('Registration:', data))
.catch(console.error)
"
```

## 🎯 **Expected Results:**

- ✅ Health check returns `ok: true`
- ✅ Registration succeeds without "Database error"
- ✅ Can restore proper Prisma authentication
- ✅ Can disable bypass endpoints

## 🚨 **Common Issues:**

1. **Still getting 401?** 
   - Double-check you copied the **anon/public** key (not service role)
   - Ensure no extra spaces in the key
   - Verify the Supabase project is active

2. **Database connection fails?**
   - Use **Direct connection** string (not Transaction pooler)
   - URL-encode special characters in password
   - Verify database user has proper permissions

3. **Tables missing?**
   - Run the table creation SQL in Supabase SQL Editor
   - Check RLS policies are correctly set

## 📝 **Next Steps After Fix:**

Once Supabase connection is working:

1. **Restore Prisma adapter** in `src/lib/auth.ts`
2. **Re-enable credentials provider** with proper database lookup
3. **Replace bypass endpoints** with original auth endpoints
4. **Clean up temporary scripts** and emergency endpoints

---

**🎉 This should resolve the root cause and restore your proper authentication system!** 