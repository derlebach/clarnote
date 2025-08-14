// Script to generate secure password hashes for production use
const bcrypt = require('bcryptjs');

async function generatePasswordHash(password) {
  const saltRounds = 12; // High security
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

async function main() {
  console.log('🔐 PASSWORD HASH GENERATOR');
  console.log('==========================');
  console.log('');
  
  // Get password from command line argument
  const password = process.argv[2];
  
  if (!password) {
    console.log('Usage: node scripts/generate-password-hashes.js "your-password-here"');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/generate-password-hashes.js "mySecurePassword123"');
    console.log('');
    console.log('This will generate a bcrypt hash that you can use in environment variables.');
    process.exit(1);
  }
  
  try {
    console.log(`Generating hash for password: "${password}"`);
    console.log('');
    
    const hash = await generatePasswordHash(password);
    
    console.log('✅ Generated Hash:');
    console.log(hash);
    console.log('');
    console.log('🔧 Add this to your environment variables:');
    console.log(`TEST_USER_1_PASSWORD_HASH="${hash}"`);
    console.log('');
    console.log('🎯 For Vercel:');
    console.log('1. Go to Vercel Dashboard → Environment Variables');
    console.log('2. Add: TEST_USER_1_PASSWORD_HASH');
    console.log(`3. Value: ${hash}`);
    console.log('');
    console.log('⚠️  Keep this hash secure - it\'s equivalent to your password!');
    
  } catch (error) {
    console.error('❌ Error generating hash:', error);
  }
}

main(); 