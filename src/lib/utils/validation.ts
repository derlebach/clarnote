// Email validation using RFC 5322 compliant regex
export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

// Simple in-memory rate limiter for demo purposes
// In production, consider using Redis or similar
interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimit>();

export function checkRateLimit(
  identifier: string, 
  maxAttempts: number = 5, 
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const existing = rateLimitMap.get(identifier);
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!existing || now > existing.resetTime) {
    // First attempt or window expired
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxAttempts - 1, resetTime };
  }
  
  if (existing.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime };
  }
  
  // Increment counter
  existing.count++;
  rateLimitMap.set(identifier, existing);
  
  return { 
    allowed: true, 
    remaining: maxAttempts - existing.count, 
    resetTime: existing.resetTime 
  };
}

// Sanitize string for logging (remove sensitive data)
export function sanitizeForLogging(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('email')) {
      // Mask email addresses
      if (typeof value === 'string' && value.includes('@')) {
        const [local, domain] = value.split('@');
        sanitized[key] = `${local.substring(0, 2)}***@${domain}`;
      } else {
        sanitized[key] = '***';
      }
    } else if (lowerKey.includes('ip')) {
      // Mask IP addresses
      if (typeof value === 'string') {
        const parts = value.split('.');
        if (parts.length === 4) {
          sanitized[key] = `${parts[0]}.${parts[1]}.***.***.`;
        } else {
          sanitized[key] = '***';
        }
      } else {
        sanitized[key] = '***';
      }
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
} 