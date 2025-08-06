/**
 * Environment Variable Validator
 * Ensures all required environment variables are present and valid
 */

type EnvVar = {
  name: string;
  required: boolean;
  type?: 'string' | 'number' | 'boolean' | 'url';
  defaultValue?: string;
  validator?: (value: string) => boolean;
};

const envVars: EnvVar[] = [
  // Database
  { name: 'DATABASE_URL', required: true, type: 'string' },
  
  // NextAuth
  { name: 'NEXTAUTH_URL', required: true, type: 'url' },
  { name: 'NEXTAUTH_SECRET', required: true, type: 'string' },
  
  // Google OAuth
  { name: 'GOOGLE_CLIENT_ID', required: false, type: 'string' },
  { name: 'GOOGLE_CLIENT_SECRET', required: false, type: 'string' },
  
  // OpenAI
  { name: 'OPENAI_API_KEY', required: false, type: 'string' },
  
  // Anthropic
  { name: 'ANTHROPIC_API_KEY', required: false, type: 'string' },
  
  // Supabase
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: false, type: 'url' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: false, type: 'string' },
  
  // Stripe
  { name: 'STRIPE_SECRET_KEY', required: false, type: 'string' },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', required: false, type: 'string' },
  
  // WhisperX
  { name: 'WHISPERX_ENDPOINT', required: false, type: 'url' },
  { name: 'WHISPERX_API_KEY', required: false, type: 'string' },
  
  // Mobile
  { name: 'NEXT_PUBLIC_API_URL', required: false, type: 'url' },
  { name: 'NEXT_PUBLIC_AUTH_URL', required: false, type: 'url' },
];

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Skip validation during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { valid: true, errors: [] };
  }
  
  for (const envVar of envVars) {
    const value = process.env[envVar.name];
    
    // Check if required variable is missing
    if (envVar.required && !value) {
      errors.push(`Missing required environment variable: ${envVar.name}`);
      continue;
    }
    
    // Skip validation if optional and not provided
    if (!envVar.required && !value) {
      continue;
    }
    
    // Type validation
    if (value && envVar.type) {
      switch (envVar.type) {
        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push(`Invalid URL for ${envVar.name}: ${value}`);
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`Invalid number for ${envVar.name}: ${value}`);
          }
          break;
        case 'boolean':
          if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
            errors.push(`Invalid boolean for ${envVar.name}: ${value}`);
          }
          break;
      }
    }
    
    // Custom validation
    if (value && envVar.validator && !envVar.validator(value)) {
      errors.push(`Invalid value for ${envVar.name}`);
    }
  }
  
  // Check for feature dependencies
  if (process.env.ENABLE_WHISPERX === 'true') {
    if (!process.env.WHISPERX_ENDPOINT || !process.env.WHISPERX_API_KEY) {
      errors.push('WhisperX is enabled but WHISPERX_ENDPOINT or WHISPERX_API_KEY is missing');
    }
  }
  
  // Check OAuth configuration
  const hasGoogleOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_SECRET) {
    errors.push('GOOGLE_CLIENT_ID is set but GOOGLE_CLIENT_SECRET is missing');
  }
  if (!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    errors.push('GOOGLE_CLIENT_SECRET is set but GOOGLE_CLIENT_ID is missing');
  }
  
  // Check Stripe configuration
  if (process.env.STRIPE_SECRET_KEY && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    errors.push('STRIPE_SECRET_KEY is set but NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing');
  }
  if (!process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set but STRIPE_SECRET_KEY is missing');
  }
  
  // Check Supabase configuration
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is set but NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is set but NEXT_PUBLIC_SUPABASE_URL is missing');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && defaultValue !== undefined) {
    return defaultValue;
  }
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

export function getPublicEnvVar(name: string, defaultValue?: string): string {
  if (typeof window === 'undefined') {
    return getEnvVar(name, defaultValue);
  }
  
  // On client side, only NEXT_PUBLIC_ variables are available
  if (!name.startsWith('NEXT_PUBLIC_')) {
    throw new Error(`Cannot access non-public environment variable ${name} on client side`);
  }
  
  const value = process.env[name];
  if (!value && defaultValue !== undefined) {
    return defaultValue;
  }
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

// Log environment status on startup (development only)
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  const validation = validateEnv();
  if (!validation.valid) {
    console.warn('⚠️  Environment variable issues detected:');
    validation.errors.forEach(error => console.warn(`   - ${error}`));
  } else {
    console.log('✅ All environment variables are properly configured');
  }
} 