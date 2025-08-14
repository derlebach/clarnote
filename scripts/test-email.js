const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('🧪 TESTING RESEND EMAIL INTEGRATION');
  console.log('==================================');
  
  console.log('API Key:', process.env.RESEND_API_KEY ? 'Found ✅' : 'Missing ❌');
  
  try {
    console.log('\n📧 Sending test email...');
    
    const result = await resend.emails.send({
      from: 'Clarnote <onboarding@clarnote.com>',
      to: ['de.erlebach@gmail.com'],
      subject: '🎉 Resend Integration Test - Clarnote',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 40px 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
            .success { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">🎉 Email Integration Success!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Resend + Clarnote</p>
          </div>
          
          <div class="content">
            <div class="success">
              <strong>✅ Success!</strong> Your Resend email integration is working perfectly!
            </div>
            
            <p>This test email confirms that:</p>
            <ul>
              <li>📧 Resend API key is valid</li>
              <li>🔗 Integration is properly configured</li>
              <li>🎨 Email templates are rendering correctly</li>
              <li>🚀 Ready for production use</li>
            </ul>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Welcome emails will be sent to new users</li>
              <li>Password reset emails are now functional</li>
              <li>Meeting follow-up emails are ready</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2024 Clarnote. All rights reserved.</p>
            <p>This is a test email from your development environment.</p>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Email ID:', result.data?.id);
    console.log('Check your inbox at: de.erlebach@gmail.com');
    
  } catch (error) {
    console.log('❌ EMAIL SENDING FAILED:');
    console.error(error);
  }
}

testEmail(); 