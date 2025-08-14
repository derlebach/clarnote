# 🔧 Update Vercel Environment Variables

## ✅ **CONFIRMED WORKING CREDENTIALS:**

We've tested these and they work perfectly:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wimumucfuvgqbfwqnwyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbXVtdWNmdXZncWJmd3Fud3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODQwMDQsImV4cCI6MjA2OTg2MDAwNH0.JuGwGspyVmN5BTdpYFvH-Ty1o4KQKz6T31zVADIN7UM
```

## 🚀 **VERCEL UPDATE STEPS:**

### **Step 1: Go to Vercel Dashboard**
1. Open: https://vercel.com/dashboard
2. Select your **clarnote** project
3. Go to **Settings** → **Environment Variables**

### **Step 2: Update the API Key**
1. Find: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Click **Edit**
3. Replace with: 
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbXVtdWNmdXZncWJmd3Fud3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODQwMDQsImV4cCI6MjA2OTg2MDAwNH0.JuGwGspyVmN5BTdpYFvH-Ty1o4KQKz6T31zVADIN7UM
   ```
4. Click **Save**

### **Step 3: Verify URL (should already be correct)**
1. Check: `NEXT_PUBLIC_SUPABASE_URL`
2. Should be: `https://wimumucfuvgqbfwqnwyy.supabase.co`
3. If different, update it

### **Step 4: Redeploy**
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete (~2 minutes)

## 🧪 **Test After Update:**

Once Vercel redeploys, test with:

```bash
node -e "
fetch('https://www.clarnote.com/api/health/auth')
  .then(res => res.json())
  .then(data => console.log('Health:', data))
  .catch(console.error)
"
```

**Expected result**: `ok: true` with no problems

## 🎯 **What This Will Fix:**

- ✅ Original `/api/auth/register` endpoint will work
- ✅ Proper Prisma database authentication
- ✅ Can restore NextAuth credentials provider
- ✅ Can remove bypass endpoints
- ✅ Full proper authentication system

---

**🎉 After this update, your authentication system will be completely restored to proper architecture!** 