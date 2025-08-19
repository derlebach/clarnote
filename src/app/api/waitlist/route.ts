import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { addToWaitlist, isSupabaseConfigured, type WaitlistEntry } from '@/lib/supabaseServer';
import { validateEmail, checkRateLimit, sanitizeForLogging } from '@/lib/utils/validation';
import { sendConfirmationEmail } from '@/lib/utils/email';

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddress = request.headers.get('x-vercel-forwarded-for');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  if (remoteAddress) {
    return remoteAddress.split(',')[0].trim();
  }
  
  return 'unknown';
}

// Fallback to JSON file storage
async function addToJsonFile(entry: WaitlistEntry): Promise<{ success: boolean; error?: string }> {
  try {
    const dataDir = path.join(process.cwd(), 'tmp');
    const filePath = path.join(dataDir, 'waitlist.json');
    
    // Ensure directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    
    let existingData: WaitlistEntry[] = [];
    
    // Read existing data if file exists
    if (existsSync(filePath)) {
      try {
        const fileContent = await readFile(filePath, 'utf-8');
        existingData = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error reading waitlist file:', error);
        // Continue with empty array if file is corrupted
      }
    }
    
    // Check for duplicate email in same context
    const duplicate = existingData.find(
      item => item.email === entry.email && item.context === entry.context
    );
    
    if (duplicate) {
      return { success: false, error: 'You are already on this waitlist' };
    }
    
    // Add new entry
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    
    existingData.push(newEntry);
    
    // Write back to file
    await writeFile(filePath, JSON.stringify(existingData, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('JSON file storage error:', error);
    return { success: false, error: 'Storage error occurred' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      context,
      marketingConsent,
      termsConsent,
      source,
      userAgent,
      timestamp
    } = body;
    
    // Get client IP
    const clientIP = getClientIP(request);
    
    // Rate limiting by IP
    const rateLimit = checkRateLimit(clientIP, 5, 60000); // 5 attempts per minute
    
    if (!rateLimit.allowed) {
      const resetTimeSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { 
          ok: false, 
          message: `Too many attempts. Please try again in ${resetTimeSeconds} seconds.` 
        },
        { status: 429 }
      );
    }
    
    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { ok: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (!validateEmail(email)) {
      return NextResponse.json(
        { ok: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    if (!context || !['integrations', 'api'].includes(context)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid context' },
        { status: 400 }
      );
    }
    
    if (typeof termsConsent !== 'boolean' || !termsConsent) {
      return NextResponse.json(
        { ok: false, message: 'Terms and Privacy Policy consent is required' },
        { status: 400 }
      );
    }
    
    if (typeof marketingConsent !== 'boolean') {
      return NextResponse.json(
        { ok: false, message: 'Marketing consent must be specified' },
        { status: 400 }
      );
    }
    
    // Basic bot protection - check for honeypot field
    if (body.website) {
      console.log('Bot detected (honeypot):', sanitizeForLogging({ ip: clientIP, userAgent }));
      return NextResponse.json({ ok: true }); // Return success to not reveal bot detection
    }
    
    // Create waitlist entry
    const entry: WaitlistEntry = {
      email: email.toLowerCase().trim(),
      context,
      marketing_consent: marketingConsent,
      terms_consent: termsConsent,
      ip: clientIP,
      user_agent: userAgent || 'unknown',
      source: source || `${context}:unknown`,
    };
    
    // Log sanitized entry (for debugging)
    console.log('Waitlist submission:', sanitizeForLogging(entry));
    
    let result;
    
    // Try Supabase first, fallback to JSON
    if (await isSupabaseConfigured()) {
      try {
        result = await addToWaitlist(entry);
      } catch (error) {
        console.error('Supabase failed, falling back to JSON:', error);
        result = await addToJsonFile(entry);
      }
    } else {
      result = await addToJsonFile(entry);
    }
    
    if (!result.success) {
      return NextResponse.json(
        { ok: false, message: result.error },
        { status: 400 }
      );
    }
    
    // TODO: Send confirmation email via Resend if configured
    // This would be implemented in a separate function
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Waitlist API error:', sanitizeForLogging(error));
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 