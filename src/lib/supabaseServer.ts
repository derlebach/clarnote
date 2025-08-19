import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface WaitlistEntry {
  id?: string;
  email: string;
  context: 'integrations' | 'api';
  marketing_consent: boolean;
  terms_consent: boolean;
  ip?: string;
  user_agent: string;
  source?: string;
  created_at?: string;
}

export async function addToWaitlist(entry: WaitlistEntry): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { error } = await supabase
      .from('waitlist')
      .insert([{
        email: entry.email,
        context: entry.context,
        marketing_consent: entry.marketing_consent,
        terms_consent: entry.terms_consent,
        ip: entry.ip,
        user_agent: entry.user_agent,
        source: entry.source,
      }]);

    if (error) {
      // Handle unique constraint violation (duplicate email for same context)
      if (error.code === '23505') {
        return { success: false, error: 'You are already on this waitlist' };
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Supabase waitlist error:', error);
    return { success: false, error: 'Database error occurred' };
  }
}

export async function isSupabaseConfigured(): Promise<boolean> {
  return supabase !== null;
} 