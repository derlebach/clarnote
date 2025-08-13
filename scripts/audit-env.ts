import * as fs from 'fs';
import { config } from 'dotenv';

// Load environment variables from .env.local and .env
config({ path: '.env.local' });
config({ path: '.env' });

const env = process.env;
const issues: string[] = [];

const required = [
  'NEXTAUTH_URL',
  'AUTH_TRUST_HOST',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

for (const k of required) {
  if (!env[k]) issues.push(`${k} is missing`);
}

if (env.AUTH_TRUST_HOST !== 'true') issues.push('AUTH_TRUST_HOST must be true');

const publicLeak = Object.entries(env)
  .filter(([k, v]) => k.startsWith('NEXT_PUBLIC_') && /SECRET|KEY|TOKEN/i.test(k) && !/PUBLISHABLE|SUPABASE_ANON/i.test(k));
if (publicLeak.length) issues.push(`Possible secret exposure via NEXT_PUBLIC_: ${publicLeak.map(([k]) => k).join(', ')}`);

if (issues.length) {
  console.error('ENV AUDIT FAILED:\n- ' + issues.join('\n- '));
  process.exit(1);
} else {
  console.log('ENV AUDIT OK');
} 