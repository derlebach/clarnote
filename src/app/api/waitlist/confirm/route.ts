import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Simple token storage - in production, use Redis or database
const tokenStore = new Map<string, { email: string; context: string; expires: number }>();

// Clean up expired tokens periodically
function cleanupTokens() {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expires) {
      tokenStore.delete(token);
    }
  }
}

// Generate secure token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send confirmation email
export async function sendConfirmationEmail(
  email: string, 
  context: 'integrations' | 'api'
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Generate token
    const token = generateToken();
    const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    tokenStore.set(token, { email, context, expires });
    
    // Clean up old tokens (1% chance)
    if (Math.random() < 0.01) {
      cleanupTokens();
    }
    
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://clarnote.com'}/api/waitlist/confirm?token=${token}`;
    
    const contextName = context === 'integrations' ? 'Integrations' : 'API Early Access';
    
    const { error } = await resend.emails.send({
      from: 'Clarnote <hello@clarnote.com>',
      to: email,
      subject: `Confirm your ${contextName} waitlist signup`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Confirm your waitlist signup</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #1f2937; font-size: 28px; font-weight: bold; margin: 0;">Clarnote</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 40px 30px; border-radius: 16px; text-align: center;">
              <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                Almost there! 🎉
              </h2>
              
              <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px 0;">
                Please confirm your email to join the <strong>${contextName} waitlist</strong>. 
                We'll notify you as soon as it's ready.
              </p>
              
              <a href="${confirmUrl}" 
                 style="display: inline-block; background: #1f2937; color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                Confirm Email
              </a>
              
              <p style="color: #9ca3af; font-size: 14px; margin: 32px 0 0 0;">
                This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; color: #9ca3af; font-size: 14px;">
              <p>
                Clarnote - The World's Most Accurate AI Meeting Assistant<br>
                <a href="https://clarnote.com" style="color: #6b7280;">clarnote.com</a>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        Clarnote - Confirm your ${contextName} waitlist signup
        
        Almost there! Please confirm your email to join the ${contextName} waitlist.
        
        Click here to confirm: ${confirmUrl}
        
        This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
        
        ---
        Clarnote - The World's Most Accurate AI Meeting Assistant
        https://clarnote.com
      `.trim(),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: 'Failed to send confirmation email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Email confirmation error:', error);
    return { success: false, error: 'Email service error' };
  }
}

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
    
    const tokenData = tokenStore.get(token);
    
    if (!tokenData) {
      return NextResponse.redirect(
        new URL('/waitlist/error?message=Confirmation+link+expired+or+invalid', request.url)
      );
    }
    
    if (Date.now() > tokenData.expires) {
      tokenStore.delete(token);
      return NextResponse.redirect(
        new URL('/waitlist/error?message=Confirmation+link+expired', request.url)
      );
    }
    
    // Token is valid - mark as confirmed
    // In a real app, you'd update the database record here
    tokenStore.delete(token); // Clean up used token
    
    const contextName = tokenData.context === 'integrations' ? 'Integrations' : 'API';
    
    return NextResponse.redirect(
      new URL(`/waitlist/confirmed?context=${tokenData.context}&email=${encodeURIComponent(tokenData.email)}`, request.url)
    );
    
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.redirect(
      new URL('/waitlist/error?message=Something+went+wrong', request.url)
    );
  }
} 