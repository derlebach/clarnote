import { NextRequest, NextResponse } from 'next/server';
import { verifyConfirmationToken } from '@/lib/utils/email';

// Handle confirmation link clicks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/waitlist/error?message=Invalid+confirmation+link', request.url)
      );
    }

    const verification = verifyConfirmationToken(token);

    if (!verification.valid || !verification.data) {
      return NextResponse.redirect(
        new URL('/waitlist/error?message=Confirmation+link+expired+or+invalid', request.url)
      );
    }

    const { email, context } = verification.data;

    return NextResponse.redirect(
      new URL(`/waitlist/confirmed?context=${context}&email=${encodeURIComponent(email)}`, request.url)
    );

  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.redirect(
      new URL('/waitlist/error?message=Something+went+wrong', request.url)
    );
  }
} 