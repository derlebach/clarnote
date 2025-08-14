console.log('🔍 CHECKING FOR EXISTING USERS IN SUPABASE');
console.log('=========================================');

const supabaseUrl = 'https://wimumucfuvgqbfwqnwyy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbXVtdWNmdXZncWJmd3Fud3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODQwMDQsImV4cCI6MjA2OTg2MDAwNH0.JuGwGspyVmN5BTdpYFvH-Ty1o4KQKz6T31zVADIN7UM';

fetch(`${supabaseUrl}/rest/v1/User`, {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  }
})
.then(res => res.json())
.then(users => {
  console.log('Total users found:', users.length);
  users.forEach((user, index) => {
    console.log(`User ${index + 1}:`, {
      email: user.email,
      name: user.name,
      hasPassword: !!user.password,
      id: user.id
    });
  });
  
  if (users.length === 0) {
    console.log('\n💡 No users found. We need to create a test user first.');
  } else {
    console.log('\n✅ Found users! We can test sign-in with these accounts.');
  }
})
.catch(err => {
  console.log('❌ Error fetching users:', err.message);
}); 