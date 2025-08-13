#!/usr/bin/env node

console.log(`
🔍 COMPREHENSIVE AUTH DIAGNOSIS
===============================

This will help identify the REAL problem with your authentication system.
`);

// Test 1: Check if we can connect to Supabase at all
async function testSupabaseConnection() {
  console.log('\n1️⃣ TESTING SUPABASE CONNECTION...');
  
  try {
    const response = await fetch('https://wimumucfuvgqbfwqnwyy.supabase.co/rest/v1/', {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing'}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase project is accessible');
      return true;
    } else {
      console.log(`❌ Supabase connection failed: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Supabase connection error: ${error.message}`);
    return false;
  }
}

// Test 2: Check production registration endpoint
async function testProductionRegistration() {
  console.log('\n2️⃣ TESTING PRODUCTION REGISTRATION...');
  
  try {
    const response = await fetch('https://www.clarnote.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Diagnostic Test',
        email: `test-${Date.now()}@diagnostic.com`,
        password: 'testpass123'
      })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (data.error === 'Database error') {
      console.log('🎯 CONFIRMED: Database connection is the issue');
      return 'database_error';
    } else if (data.success) {
      console.log('✅ Registration is working!');
      return 'working';
    } else {
      console.log('❓ Unexpected error:', data);
      return 'unknown_error';
    }
  } catch (error) {
    console.log(`❌ Registration test failed: ${error.message}`);
    return 'network_error';
  }
}

// Test 3: Check Google OAuth flow
async function testGoogleOAuth() {
  console.log('\n3️⃣ TESTING GOOGLE OAUTH CONFIGURATION...');
  
  try {
    const response = await fetch('https://www.clarnote.com/api/auth/providers');
    const providers = await response.json();
    
    if (providers.google) {
      console.log('✅ Google OAuth provider is configured');
      console.log('Callback URL:', providers.google.callbackUrl);
      return true;
    } else {
      console.log('❌ Google OAuth provider not found');
      return false;
    }
  } catch (error) {
    console.log(`❌ OAuth test failed: ${error.message}`);
    return false;
  }
}

// Test 4: Check Vercel environment
async function testVercelEnvironment() {
  console.log('\n4️⃣ TESTING VERCEL ENVIRONMENT...');
  
  try {
    const response = await fetch('https://www.clarnote.com/api/health/auth');
    const health = await response.json();
    
    console.log('Health check:', health);
    
    if (health.ok) {
      console.log('✅ All auth environment variables are set');
      return true;
    } else {
      console.log('❌ Missing environment variables:', health.problems);
      return false;
    }
  } catch (error) {
    console.log(`❌ Environment test failed: ${error.message}`);
    return false;
  }
}

// Main diagnosis
async function runDiagnosis() {
  console.log('🚀 Starting comprehensive diagnosis...\n');
  
  const results = {
    supabase: await testSupabaseConnection(),
    registration: await testProductionRegistration(),
    oauth: await testGoogleOAuth(),
    environment: await testVercelEnvironment()
  };
  
  console.log('\n📊 DIAGNOSIS SUMMARY:');
  console.log('===================');
  console.log(`Supabase Connection: ${results.supabase ? '✅' : '❌'}`);
  console.log(`Registration Status: ${results.registration}`);
  console.log(`Google OAuth: ${results.oauth ? '✅' : '❌'}`);
  console.log(`Environment: ${results.environment ? '✅' : '❌'}`);
  
  console.log('\n🎯 RECOMMENDATIONS:');
  
  if (results.registration === 'database_error') {
    console.log(`
❌ PRIMARY ISSUE: Database Connection
   
LIKELY CAUSES:
1. Supabase project is paused/inactive
2. Wrong database password in Vercel
3. Database user doesn't have proper permissions
4. Network/firewall blocking connection

NEXT STEPS:
1. Check Supabase dashboard - is project active?
2. Verify database password is correct
3. Try creating tables manually in Supabase SQL editor
4. Consider using Supabase Auth instead of custom registration
`);
  } else if (!results.supabase) {
    console.log(`
❌ PRIMARY ISSUE: Supabase Project Access

NEXT STEPS:
1. Check if Supabase project is active
2. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Check Supabase project status in dashboard
`);
  } else if (results.registration === 'working') {
    console.log(`
✅ GREAT NEWS: Registration is actually working now!
   Try testing on the website again.
`);
  }
}

runDiagnosis().catch(console.error); 