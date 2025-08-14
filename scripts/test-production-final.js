console.log('🧪 TESTING CLEANED UP PRODUCTION SYSTEM');
console.log('=====================================');

async function testProduction() {
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ HEALTH CHECK:');
    const healthResponse = await fetch('https://www.clarnote.com/api/health/auth');
    const healthData = await healthResponse.json();
    console.log('Health Status:', healthResponse.ok ? '✅ OK' : '❌ FAILED');
    if (healthData.problems && healthData.problems.length > 0) {
      console.log('Problems found:', healthData.problems);
    }

    // Test 2: Registration
    console.log('\n2️⃣ REGISTRATION TEST:');
    const testEmail = `test-prod-${Date.now()}@example.com`;
    const registrationResponse = await fetch('https://www.clarnote.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Production Test User',
        email: testEmail,
        password: 'testpass123'
      })
    });
    
    const registrationData = await registrationResponse.json();
    if (registrationData.success) {
      console.log('✅ Registration WORKING!');
      console.log('👤 User created:', registrationData.user);
      
      // Test 3: Sign-in with new user
      console.log('\n3️⃣ SIGN-IN TEST (New User):');
      const signinResponse = await fetch('https://www.clarnote.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'testpass123'
        })
      });
      
      const signinData = await signinResponse.json();
      if (signinData.success) {
        console.log('✅ Sign-in WORKING!');
        console.log('👤 User signed in:', signinData.user);
        console.log('\n🎉 COMPLETE SUCCESS! Authentication system is fully functional!');
      } else {
        console.log('❌ Sign-in failed:', signinData.error || signinData.message);
      }
      
    } else {
      console.log('❌ Registration failed:', registrationData.error || registrationData.message);
      console.log('📋 Full response:', registrationData);
      
      // If registration failed, it might be RLS - check if we need to run the SQL fix
      if (registrationData.message && registrationData.message.includes('row-level security')) {
        console.log('\n🔧 ACTION NEEDED:');
        console.log('Run the SQL from scripts/fix-supabase-rls-final.sql in your Supabase SQL Editor');
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testProduction(); 