console.log('🧪 FINAL COMPREHENSIVE AUTHENTICATION TEST');
console.log('=========================================');

async function runFinalTests() {
  const results = {
    healthCheck: false,
    registration: false,
    signin: false,
    googleOAuth: false
  };

  try {
    // Test 1: Health Check
    console.log('\n1️⃣ HEALTH CHECK TEST:');
    const healthResponse = await fetch('https://www.clarnote.com/api/health/auth');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health check: PASSED');
      results.healthCheck = true;
    } else {
      console.log('❌ Health check: FAILED');
    }

    // Test 2: Registration Flow
    console.log('\n2️⃣ REGISTRATION FLOW TEST:');
    const testEmail = `final-test-${Date.now()}@example.com`;
    const registrationResponse = await fetch('https://www.clarnote.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Final Test User',
        email: testEmail,
        password: 'securepass123'
      })
    });
    
    const registrationData = await registrationResponse.json();
    if (registrationData.success) {
      console.log('✅ Registration: PASSED');
      console.log(`   Created user: ${registrationData.user.name} (${registrationData.user.email})`);
      results.registration = true;
      
      // Test 3: Sign-in Flow (with the user we just created)
      console.log('\n3️⃣ SIGN-IN FLOW TEST:');
      const signinResponse = await fetch('https://www.clarnote.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'securepass123'
        })
      });
      
      const signinData = await signinResponse.json();
      if (signinData.success) {
        console.log('✅ Sign-in: PASSED');
        console.log(`   Signed in user: ${signinData.user.name}`);
        results.signin = true;
      } else {
        console.log('❌ Sign-in: FAILED');
        console.log(`   Error: ${signinData.error}`);
      }
    } else {
      console.log('❌ Registration: FAILED');
      console.log(`   Error: ${registrationData.error}`);
    }

    // Test 4: Google OAuth availability check
    console.log('\n4️⃣ GOOGLE OAUTH AVAILABILITY:');
    const providersResponse = await fetch('https://www.clarnote.com/api/auth/providers');
    const providersData = await providersResponse.json();
    
    if (providersData.google) {
      console.log('✅ Google OAuth: AVAILABLE');
      results.googleOAuth = true;
    } else {
      console.log('❌ Google OAuth: NOT AVAILABLE');
    }

    // Final Results Summary
    console.log('\n🎯 FINAL TEST RESULTS:');
    console.log('=====================');
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`✅ Health Check: ${results.healthCheck ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Registration: ${results.registration ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Sign-in: ${results.signin ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Google OAuth: ${results.googleOAuth ? 'AVAILABLE' : 'UNAVAILABLE'}`);
    
    console.log(`\n📊 SCORE: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! SYSTEM IS PRODUCTION READY!');
      console.log('🚀 Ready to push to production!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review before deployment.');
    }

  } catch (error) {
    console.log('❌ Test suite failed:', error.message);
  }
}

runFinalTests(); 