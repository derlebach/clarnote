import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    console.log('🔐 Password reset request for:', email);

    // Always return success for security (don't reveal if email exists)
    const successResponse = NextResponse.json(
      { message: 'If an account exists, a reset link has been sent.' },
      { status: 200 }
    );

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase configuration');
      return successResponse; // Still return success for security
    }

    // Check if user exists using Supabase REST API
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/User?email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!userResponse.ok) {
      console.error('❌ Failed to check user existence:', userResponse.status);
      return successResponse; // Still return success for security
    }

    const users = await userResponse.json();
    if (users.length === 0) {
      console.log('🔍 User not found for password reset');
      return successResponse; // Return success anyway for security
    }

    const user = users[0];
    console.log('✅ User found for password reset:', user.id);

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token using Supabase REST API
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/User?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString()
      })
    });

    if (!updateResponse.ok) {
      console.error('❌ Failed to save reset token:', updateResponse.status);
      return successResponse; // Still return success for security
    }

    console.log('✅ Reset token saved to database');

    // Generate reset URL
    const headerOrigin = request.headers.get('origin')
    const urlOrigin = (() => { try { return new URL(request.url).origin } catch { return undefined } })()
    const origin = headerOrigin || urlOrigin || process.env.NEXTAUTH_URL
    const baseUrl = origin && origin.startsWith('http') ? origin : (process.env.NEXTAUTH_URL || '')
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`
    
    // Send password reset email
    try {
      const resetTemplate = emailTemplates.passwordReset(resetUrl, user.name || 'User')
      await sendEmail({
        to: email,
        subject: resetTemplate.subject,
        html: resetTemplate.html
      })
      console.log('📧 Password reset email sent to:', email)
    } catch (emailError) {
      console.error('❌ Password reset email failed:', emailError)
      // Still return success for security, but log the error
    }

    return successResponse;
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 