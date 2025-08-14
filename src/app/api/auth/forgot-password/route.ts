import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Always return success for security (don't reveal if email exists)
    const successResponse = NextResponse.json(
      { message: 'If an account exists, a reset link has been sent.' },
      { status: 200 }
    );

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success anyway for security
      return successResponse;
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      } as any,
    });

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