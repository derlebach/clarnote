import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const cfg = {
    nextAuthUrl: process.env.NEXTAUTH_URL || null,
    authTrustHost: process.env.AUTH_TRUST_HOST || null,
    googleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    supabaseAnonKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nextAuthSecretPresent: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
  };

  const problems: string[] = [];
  if (!cfg.nextAuthUrl) problems.push('NEXTAUTH_URL missing');
  if (cfg.authTrustHost !== 'true') problems.push('AUTH_TRUST_HOST must be true');
  if (!cfg.googleClientId) problems.push('GOOGLE_CLIENT_ID missing');
  if (!cfg.googleClientSecret) problems.push('GOOGLE_CLIENT_SECRET missing');
  if (!cfg.nextAuthSecretPresent) problems.push('NEXTAUTH_SECRET missing');

  return NextResponse.json({ ok: problems.length === 0, problems, cfg }, { status: problems.length ? 500 : 200 });
} 