// Emergency registration test script
console.log('🧪 TESTING EMERGENCY REGISTRATION ENDPOINT')
console.log('==========================================')

// Test the emergency registration endpoint
fetch('https://www.clarnote.com/api/auth/register-emergency', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'Emergency Test User',
    email: `emergency-test-${Date.now()}@example.com`,
    password: 'testpass123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('\n📊 EMERGENCY REGISTRATION RESULT:')
  if (data.success) {
    console.log('✅ SUCCESS! Emergency registration is working!')
    console.log('🎉 Your production registration is now functional!')
    console.log('👤 Test user created:', data)
  } else {
    console.log('❌ Emergency registration failed:', data.error)
    console.log('📋 Details:', data.details)
    console.log('🔍 Supabase status:', data.supabaseStatus)
  }
})
.catch(err => {
  console.log('❌ Network error testing emergency endpoint:', err.message)
})

// Also test if regular endpoint is still broken
setTimeout(() => {
  console.log('\n🔍 COMPARING WITH REGULAR ENDPOINT:')
  fetch('https://www.clarnote.com/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName: 'Regular Test User',
      email: `regular-test-${Date.now()}@example.com`,
      password: 'testpass123'
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Regular endpoint result:', data.error || 'Success')
  })
  .catch(err => {
    console.log('Regular endpoint error:', err.message)
  })
}, 2000) 