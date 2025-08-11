/**
 * Verifies that Vercel env + domains align with:
 *  - NEXTAUTH_URL
 *  - Supabase Auth URL allow-list (prints what to add)
 *  - Google OAuth URIs (prints what to add)
 *
 * Usage:
 *  npx tsx scripts/sync-config.ts
 *  or
 *  node -r ts-node/register scripts/sync-config.ts
 */

const requiredOrigins = [
  "https://www.clarnote.com",
  "https://clarnote.com",
  "https://staging.clarnote.com",
  "http://localhost:3000",
];

const requiredRedirects = requiredOrigins.map(
  (o) => `${o}/api/auth/callback/google`
);

async function getVercelDomains() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) {
    console.warn("VERCEL_TOKEN/VERCEL_PROJECT_ID not set; skipping domain check");
    return [];
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    const resp = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = (await resp.json()) as { domains?: Array<{ name: string }> };
    return (data?.domains || []).map(d => d.name);
  } catch (error) {
    console.warn("Failed to fetch Vercel domains:", error);
    return [];
  }
}

async function main() {
  console.log("=== Verifying NEXTAUTH_URL ===");
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (!nextAuthUrl) {
    console.error("❌ NEXTAUTH_URL is missing!");
  } else {
    console.log("✅ NEXTAUTH_URL:", nextAuthUrl);
  }

  const domains = await getVercelDomains();
  if (domains.length) {
    console.log("📡 Vercel domains:", domains.join(", "));
    // Basic sanity (at least one of the verified domains appears in NEXTAUTH_URL)
    if (!domains.some((d) => (nextAuthUrl || "").includes(d))) {
      console.warn(
        "⚠️  WARNING: NEXTAUTH_URL does not match any Vercel domain. Fix in Vercel Settings."
      );
    }
  }

  console.log("\n=== Required Google OAuth entries ===");
  console.log("📋 Authorized JavaScript Origins:");
  for (const o of requiredOrigins) console.log("   -", o);
  console.log("\n📋 Authorized Redirect URIs:");
  for (const r of requiredRedirects) console.log("   -", r);

  console.log("\n=== Supabase Auth → URL Configuration (manual check) ===");
  console.log(
    "🔗 Ensure Site URL = https://www.clarnote.com and Redirect URLs include:"
  );
  for (const o of requiredOrigins) console.log("   -", `${o}/*`);

  // Basic secret exposure guard
  console.log("\n=== Secret exposure guard ===");
  const bad = Object.keys(process.env).filter(
    (k) =>
      k.startsWith("NEXT_PUBLIC_") &&
      /KEY|SECRET|TOKEN|API/i.test(k) &&
      !/SUPABASE_URL|SUPABASE_ANON_KEY|STRIPE_PUBLISHABLE_KEY|API_URL|AUTH_URL/.test(k)
  );
  if (bad.length) {
    console.warn(
      "⚠️  WARNING: you have publicly-exposed looking variables:\n",
      bad.map(k => `   - ${k}`).join("\n")
    );
  } else {
    console.log("✅ No obvious public secret exposures found.");
  }

  // Check AUTH_TRUST_HOST
  console.log("\n=== Auth Trust Host ===");
  const authTrustHost = process.env.AUTH_TRUST_HOST;
  if (authTrustHost === "true") {
    console.log("✅ AUTH_TRUST_HOST is properly set to true");
  } else {
    console.warn("⚠️  AUTH_TRUST_HOST should be set to 'true' in production");
  }

  // Check Google OAuth configuration
  console.log("\n=== Google OAuth Configuration ===");
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (googleClientId && googleClientSecret) {
    console.log("✅ Google OAuth credentials are configured");
  } else if (googleClientId || googleClientSecret) {
    console.warn("⚠️  Partial Google OAuth configuration - both CLIENT_ID and CLIENT_SECRET are required");
  } else {
    console.log("ℹ️  Google OAuth not configured (optional)");
  }

  console.log("\n✨ Configuration check complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Copy the Google OAuth URLs above to your Google Cloud Console");
  console.log("2. Copy the Supabase redirect URLs to your Supabase dashboard");
  console.log("3. Ensure NEXTAUTH_URL is set correctly in Vercel environment variables");
  console.log("4. Set AUTH_TRUST_HOST=true in production environment");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
}); 