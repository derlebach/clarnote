const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugUser() {
  try {
    console.log('🔍 Looking for user with email: de.erlebach@gmail.com');
    
    const user = await prisma.user.findUnique({
      where: { email: 'de.erlebach@gmail.com' },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        password: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('  - ID:', user.id);
      console.log('  - Email:', user.email);
      console.log('  - Name:', user.name);
      console.log('  - Has password:', !!user.password);
      console.log('  - Password length:', user.password ? user.password.length : 0);
      console.log('  - Created:', user.createdAt);
      console.log('  - Updated:', user.updatedAt);
      
      if (user.password) {
        console.log('  - Password starts with:', user.password.substring(0, 7));
        
        // Test with common passwords
        const testPasswords = ['password', '123456', 'test123', 'admin123', 'password123'];
        console.log('\n🔐 Testing common passwords...');
        
        for (const testPass of testPasswords) {
          try {
            const isValid = await bcrypt.compare(testPass, user.password);
            if (isValid) {
              console.log(`✅ Password "${testPass}" MATCHES!`);
              break;
            }
          } catch (err) {
            console.log(`❌ Error testing "${testPass}":`, err.message);
          }
        }
      }
    } else {
      console.log('❌ User not found');
      
      // Check if there are any users at all
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true }
      });
      console.log('📋 All users in database:', allUsers);
    }
  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUser(); 