// Test different Supabase API key configurations to find the working one
console.log('🔍 SUPABASE API KEY TESTER');
console.log('========================');

const supabaseUrl = 'https://wimumucfuvgqbfwqnwyy.supabase.co';

// Different API keys to test (you'll need to provide the real ones)
const keysToTest = [
  {
    name: 'FRESH API Key (2025)',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbXVtdWNmdXZncWJmd3Fud3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODQwMDQsImV4cCI6MjA2OTg2MDAwNH0.JuGwGspyVmN5BTdpYFvH-Ty1o4KQKz6T31zVADIN7UM'
  },
  {
    name: 'Old Production Key (2024)',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbXVtdWNmdXZncWJmd3Fubnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MDcwNjQsImV4cCI6MjA1MjM4MzA2NH0.VBg7CWCrUK9_4Y4W8s7KAD6yvAH1ksKTqRYnL3Ywsxw'
  }
];

async function testSupabaseKey(name, apiKey) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`Key: ${apiKey.substring(0, 20)}...`);
    
    // Test 1: Basic connection
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Key is VALID and working!');
      
      // Test 2: Try to read User table
      const userResponse = await fetch(`${supabaseUrl}/rest/v1/User?limit=1`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        }
      });
      
      if (userResponse.ok) {
        const users = await userResponse.json();
        console.log(`✅ User table accessible, found ${users.length} users`);
        return { success: true, key: apiKey, name };
      } else {
        console.log(`⚠️  Key valid but User table access failed: ${userResponse.status}`);
        return { success: false, reason: 'table_access_failed' };
      }
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Key INVALID: ${errorText}`);
      return { success: false, reason: 'invalid_key' };
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return { success: false, reason: 'network_error' };
  }
}

async function main() {
  console.log(`\n🎯 Testing ${keysToTest.length} API key(s)...\n`);
  
  let workingKey = null;
  
  for (const { name, key } of keysToTest) {
    const result = await testSupabaseKey(name, key);
    if (result.success) {
      workingKey = result;
      break;
    }
  }
  
  console.log('\n📊 FINAL RESULTS:');
  console.log('=================');
  
  if (workingKey) {
    console.log(`✅ WORKING KEY FOUND: ${workingKey.name}`);
    console.log(`Key: ${workingKey.key.substring(0, 30)}...`);
    console.log('');
    console.log('🔧 UPDATE VERCEL WITH THIS KEY:');
    console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${workingKey.key}`);
  } else {
    console.log('❌ NO WORKING KEYS FOUND');
    console.log('');
    console.log('🛠️  NEXT STEPS:');
    console.log('1. Go to Supabase Dashboard → Settings → API');
    console.log('2. Copy the fresh anon/public key');
    console.log('3. Add it to this script and re-run');
    console.log('4. Update Vercel environment variables');
  }
}

main().catch(console.error); 