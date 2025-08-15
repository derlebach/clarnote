const fetch = require('node-fetch');

async function testPasswordReset() {
  console.log('🧪 TESTING PASSWORD RESET FUNCTIONALITY');
  console.log('=====================================');

  // Test with a real email address that exists in your database
  const testEmail = 'erlebach.dan@seznam.cz'; // Use your actual email

  try {
    console.log('📧 Step 1: Requesting password reset...');
    
    // Test forgot password endpoint
    const forgotResponse = await fetch('https://www.clarnote.com/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    const forgotData = await forgotResponse.json();
    console.log('📊 Forgot password response status:', forgotResponse.status);
    console.log('📊 Forgot password response:', forgotData);

    if (forgotResponse.ok) {
      console.log('✅ Password reset request successful - email should be sent');
      console.log('📧 Check your email for the reset link');
    } else {
      console.log('❌ Password reset request failed:', forgotData.message);
    }

    // Test with non-existent email (should still return success for security)
    console.log('\n📧 Step 2: Testing with non-existent email...');
    const nonExistentResponse = await fetch('https://www.clarnote.com/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com' })
    });

    const nonExistentData = await nonExistentResponse.json();
    console.log('📊 Non-existent email response status:', nonExistentResponse.status);
    console.log('📊 Non-existent email response:', nonExistentData);

    if (nonExistentResponse.ok) {
      console.log('✅ Non-existent email handled correctly (returns success for security)');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testPasswordReset().catch(console.error); 