#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process')
const fs = require('fs')

// Environments to sync
const envs = ['production', 'preview']

// Read .env.local
if (!fs.existsSync('.env.local')) {
  console.error('Missing .env.local. Aborting.')
  process.exit(1)
}

const lines = fs
  .readFileSync('.env.local', 'utf8')
  .split('\n')
  .filter((line) => line.trim() && !line.trim().startsWith('#'))

// Keys that must NOT be public
const privateKeys = new Set([
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'OPENAI_API_KEY',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
])

// Helper to set env var via Vercel CLI without prompt
function setEnv(key, value, env) {
  try {
    // Remove existing value (ignore errors)
    spawnSync('vercel', ['env', 'rm', key, env, '-y'], { stdio: 'ignore' })
    // Add new value
    const proc = spawnSync('vercel', ['env', 'add', key, env], {
      input: value,
      encoding: 'utf8',
      stdio: ['pipe', 'inherit', 'inherit'],
    })
    if (proc.status !== 0) {
      throw new Error(`Failed to set ${key} for ${env}`)
    }
    console.log(`Synced ${key} -> ${env}`)
  } catch (e) {
    console.error(`Error syncing ${key} to ${env}:`, e.message)
  }
}

lines.forEach((line) => {
  const idx = line.indexOf('=')
  if (idx === -1) return
  const key = line.slice(0, idx).trim()
  const value = line.slice(idx + 1).trim()

  // Safety: warn if private keys are public
  if (key.startsWith('NEXT_PUBLIC_')) {
    const raw = key.replace('NEXT_PUBLIC_', '')
    if (privateKeys.has(raw)) {
      console.warn(`WARNING: ${key} seems sensitive. Remove NEXT_PUBLIC_ prefix.`)
    }
  }

  envs.forEach((env) => setEnv(key, value, env))
})

console.log('✅ Vercel env variables synced for production + preview') 