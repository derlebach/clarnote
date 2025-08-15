import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    console.log('🔐 Password reset attempt with token:', token?.substring(0, 10) + '...');

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase configuration');
      return NextResponse.json(
        { message: 'Configuration error' },
        { status: 500 }
      );
    }

    // Find user with valid reset token using Supabase REST API
    const currentTime = new Date().toISOString();
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/User?resetToken=eq.${encodeURIComponent(token)}&resetTokenExpiry=gt.${encodeURIComponent(currentTime)}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!userResponse.ok) {
      console.error('❌ Failed to check reset token:', userResponse.status);
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const users = await userResponse.json();
    if (users.length === 0) {
      console.log('🔍 Invalid or expired reset token');
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const user = users[0];
    console.log('✅ Valid reset token found for user:', user.email);

    // Hash the new password
    const hashedPassword = await hash(password, 12);
    console.log('🔐 Password hashed successfully');

    // Update user password and clear reset token using Supabase REST API
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/User?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      })
    });

    if (!updateResponse.ok) {
      console.error('❌ Failed to update password:', updateResponse.status);
      return NextResponse.json(
        { message: 'Failed to reset password' },
        { status: 500 }
      );
    }

    console.log(`✅ Password reset successful for user: ${user.email}`);

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 