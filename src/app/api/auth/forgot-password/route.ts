import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

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

    // For now, just log the reset URL (you can implement email sending later)
    const headerOrigin = request.headers.get('origin')
    const urlOrigin = (() => { try { return new URL(request.url).origin } catch { return undefined } })()
    const origin = headerOrigin || urlOrigin || process.env.NEXTAUTH_URL
    const baseUrl = origin && origin.startsWith('http') ? origin : (process.env.NEXTAUTH_URL || '')
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`
    console.log(`Password reset link for ${email}: ${resetUrl}`)
    
    // TODO: Implement email sending
    // await sendEmail({
    //   to: email,
    //   subject: 'Reset your Clarnote password',
    //   html: `
    //     <h2>Reset Your Password</h2>
    //     <p>You requested to reset your password. Click the link below to create a new password:</p>
    //     <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">Reset Password</a>
    //     <p>This link will expire in 1 hour.</p>
    //     <p>If you didn't request this, please ignore this email.</p>
    //   `,
    // });

    return successResponse;
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 