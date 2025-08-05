import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if we're in development or build process and missing env vars
const isDevelopment = process.env.NODE_ENV === 'development'
const isBuild = typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL
const hasRequiredEnvVars = supabaseUrl && supabaseAnonKey

// Only throw error if we're in production runtime (not build time or development)
if (!hasRequiredEnvVars && !isDevelopment && !isBuild && typeof window !== 'undefined') {
  console.warn('Missing Supabase environment variables - using mock client')
}

// Create mock client for development/build when env vars are missing
const createMockClient = () => ({
  from: () => ({
    insert: () => Promise.resolve({ data: null, error: null }),
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null })
  }
})

// Client for public operations (frontend)
export const supabase = hasRequiredEnvVars 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createMockClient() as any

// Admin client for server-side operations only
export const supabaseAdmin = hasRequiredEnvVars && supabaseServiceKey 
  ? createClient(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      page_views: {
        Row: {
          id: string
          user_id: string | null
          page: string
          timestamp: string
          session_id: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          page: string
          timestamp?: string
          session_id?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
      }
      actions: {
        Row: {
          id: string
          user_id: string | null
          action: string
          details: any | null
          timestamp: string
          session_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          details?: any | null
          timestamp?: string
          session_id?: string | null
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string | null
          session_start: string
          session_end: string | null
          duration: number | null
          pages_visited: number
          last_activity: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_start?: string
          session_end?: string | null
          duration?: number | null
          pages_visited?: number
          last_activity?: string
        }
      }
      churn_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          timestamp: string
          reason: string | null
          value_lost: number | null
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          timestamp?: string
          reason?: string | null
          value_lost?: number | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'] 