import { supabase } from './supabase'

// UUID generation - using crypto.randomUUID for better compatibility
const generateUUID = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  // Fallback for older browsers or server-side
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return generateUUID()
  
  let sessionId = sessionStorage.getItem('clarnote_session_id')
  if (!sessionId) {
    sessionId = generateUUID()
    sessionStorage.setItem('clarnote_session_id', sessionId)
    sessionStorage.setItem('clarnote_session_start', new Date().toISOString())
    return sessionId
  }
  return sessionId
}

// Get current user ID from auth
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

// Development logger
const logEvent = (type: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Tracked Event:', { 
      type, 
      page: typeof window !== 'undefined' ? window.location.pathname : 'server',
      timestamp: new Date().toISOString(),
      ...data 
    })
  }
}

// Debug logger for database inserts
const logInsert = (table: string, payload: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 Supabase Insert [${table}]:`, JSON.stringify(payload, null, 2))
  }
}

// Track custom events
export const trackEvent = async (type: string, meta?: any) => {
  try {
    const sessionId = getSessionId()
    const userId = await getCurrentUserId()
    const page = typeof window !== 'undefined' ? window.location.pathname : 'server'
    
    const eventData = {
      user_id: userId, // UUID or null
      action: type, // TEXT NOT NULL
      details: { // JSONB
        page,
        meta: meta || {},
        timestamp: new Date().toISOString()
      },
      session_id: sessionId // UUID
      // timestamp: AUTO DEFAULT NOW() - don't send
    }

    logInsert('actions', eventData)
    await supabase.from('actions').insert(eventData)
    
    // Log in development
    logEvent(type, { page, meta, user_id: userId, session_id: sessionId })
  } catch (error) {
    console.error('Error tracking event:', error)
  }
}

// Track page views
export const trackPageView = async (page: string) => {
  try {
    const sessionId = getSessionId()
    const userId = await getCurrentUserId()
    
    const pageViewData = {
      user_id: userId, // UUID or null
      page, // TEXT NOT NULL
      session_id: sessionId, // UUID
      referrer: typeof window !== 'undefined' ? (document.referrer || null) : null, // TEXT or null
      user_agent: typeof window !== 'undefined' ? (navigator.userAgent || null) : null // TEXT or null
      // id: AUTO UUID PRIMARY KEY - don't send
      // timestamp: AUTO DEFAULT NOW() - don't send
    }

    logInsert('page_views', pageViewData)
    await supabase.from('page_views').insert(pageViewData)

    // Update session activity
    await updateSessionActivity(sessionId, userId)
    
    // Log in development
    logEvent('page_view', { page, user_id: userId, session_id: sessionId })
  } catch (error) {
    console.error('Error tracking page view:', error)
  }
}

// Track user actions
export const trackAction = async (action: string, details?: any) => {
  try {
    const sessionId = getSessionId()
    const userId = await getCurrentUserId()
    const page = typeof window !== 'undefined' ? window.location.pathname : 'server'
    
    const actionData = {
      user_id: userId, // UUID or null
      action, // TEXT NOT NULL
      details: { // JSONB
        page,
        ...details
      },
      session_id: sessionId // UUID
      // id: AUTO UUID PRIMARY KEY - don't send
      // timestamp: AUTO DEFAULT NOW() - don't send
    }

    logInsert('actions', actionData)
    await supabase.from('actions').insert(actionData)
    
    // Log in development
    logEvent(action, { page, details, user_id: userId, session_id: sessionId })
  } catch (error) {
    console.error('Error tracking action:', error)
  }
}

// Track user sign-ups
export const trackSignUp = async (userId: string, method: string = 'email') => {
  try {
    // Track the signup action first
    await trackAction('user_signup', { method, user_id: userId })
    
    // Clear any existing session data and start fresh for the new user
    sessionStorage.removeItem('clarnote_db_session_id')
    
    // The session will be created automatically by the next page view or action
    // via updateSessionActivity, so we don't need to create it here
  } catch (error) {
    console.error('Error tracking sign up:', error)
  }
}

// Update session activity
const updateSessionActivity = async (sessionId: string, userId: string | null) => {
  try {
    // Get or create the database session ID
    let dbSessionId = sessionStorage.getItem('clarnote_db_session_id')
    
    if (dbSessionId) {
      // Try to update existing session
      const { data: session } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', dbSessionId)
        .single()

      if (session) {
        // Update existing session
        const updateData = {
          pages_visited: session.pages_visited + 1
          // last_activity: AUTO DEFAULT NOW() - don't send, it will update automatically
        }

        logInsert('user_sessions (update)', updateData)
        await supabase
          .from('user_sessions')
          .update(updateData)
          .eq('id', dbSessionId)
        return
      }
    }

    // Create new session (either no dbSessionId or session not found)
    const newSessionData = {
      user_id: userId, // UUID or null
      pages_visited: 1 // INTEGER DEFAULT 0
      // id: AUTO UUID PRIMARY KEY - don't send, let DB auto-generate
      // session_start: AUTO DEFAULT NOW() - don't send
      // last_activity: AUTO DEFAULT NOW() - don't send
    }

    logInsert('user_sessions (new)', newSessionData)
    const { data: newSession, error } = await supabase
      .from('user_sessions')
      .insert(newSessionData)
      .select('id')
      .single()

    if (newSession && !error) {
      // Store the database session ID for future updates
      sessionStorage.setItem('clarnote_db_session_id', newSession.id)
    }
  } catch (error) {
    console.error('Error updating session:', error)
  }
}

// End user session
export const endSession = async () => {
  try {
    const dbSessionId = sessionStorage.getItem('clarnote_db_session_id')
    const sessionStart = sessionStorage.getItem('clarnote_session_start')
    
    if (dbSessionId && sessionStart) {
      const duration = Date.now() - new Date(sessionStart).getTime()
      
      const endSessionData = {
        session_end: new Date().toISOString(), // TIMESTAMP WITH TIME ZONE
        duration: Math.round(duration / 1000) // INTEGER (duration in seconds)
      }

      logInsert('user_sessions (end)', endSessionData)
      await supabase
        .from('user_sessions')
        .update(endSessionData)
        .eq('id', dbSessionId)
    }
    
    // Clear session storage
    sessionStorage.removeItem('clarnote_session_id')
    sessionStorage.removeItem('clarnote_session_start')
    sessionStorage.removeItem('clarnote_db_session_id')
  } catch (error) {
    console.error('Error ending session:', error)
  }
}

// Track churn events
export const trackChurn = async (eventType: string, reason?: string, valueLost?: number) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return
    
    const churnData = {
      user_id: userId, // UUID NOT NULL
      event_type: eventType, // TEXT NOT NULL
      reason: reason || null, // TEXT or null
      value_lost: valueLost || null // DECIMAL(10,2) or null
      // id: AUTO UUID PRIMARY KEY - don't send
      // timestamp: AUTO DEFAULT NOW() - don't send
    }

    logInsert('churn_events', churnData)
    await supabase.from('churn_events').insert(churnData)
  } catch (error) {
    console.error('Error tracking churn:', error)
  }
}

// Predefined action types for consistency
export const ACTIONS = {
  // Auth actions
  SIGN_UP: 'sign_up',
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  
  // File actions
  FILE_UPLOAD: 'file_upload',
  FILE_TRANSCRIBE: 'file_transcribe',
  FILE_SUMMARIZE: 'file_summarize',
  FILE_EXPORT: 'file_export',
  
  // UI interactions
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  MODAL_OPEN: 'modal_open',
  MODAL_CLOSE: 'modal_close',
  
  // Navigation
  PAGE_VIEW: 'page_view',
  LINK_CLICK: 'link_click',
  
  // Features
  EMAIL_SIGNUP: 'email_signup',
  DEMO_REQUEST: 'demo_request',
  APP_DOWNLOAD: 'app_download',
  
  // Subscription
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',
  SUBSCRIPTION_UPGRADE: 'subscription_upgrade'
} as const

// Churn event types
export const CHURN_EVENTS = {
  SUBSCRIPTION_CANCEL: 'subscription_cancel',
  ACCOUNT_DELETE: 'account_delete',
  INACTIVE_USER: 'inactive_user',
  TRIAL_END: 'trial_end',
  PAYMENT_FAILED: 'payment_failed'
} as const

// Custom event types for Clarnote-specific tracking
export const CUSTOM_EVENTS = {
  // Recording & Transcription
  RECORDING_STARTED: 'recording_started',
  RECORDING_STOPPED: 'recording_stopped',
  RECORDING_UPLOADED: 'recording_uploaded',
  TRANSCRIPT_GENERATED: 'transcript_generated',
  TRANSCRIPT_SAVED: 'transcript_saved',
  TRANSCRIPT_SHARED: 'transcript_shared',
  
  // AI Features
  SUMMARY_GENERATED: 'summary_generated',
  ACTION_ITEMS_GENERATED: 'action_items_generated',
  SPEAKERS_IDENTIFIED: 'speakers_identified',
  FOLLOWUP_EMAIL_SENT: 'followup_email_sent',
  
  // Export & Sharing
  PDF_EXPORTED: 'pdf_exported',
  EMAIL_SHARED: 'email_shared',
  LINK_SHARED: 'link_shared',
  
  // User Journey
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_RECORDING: 'first_recording',
  UPGRADED_TO_PRO: 'upgraded_to_pro',
  FEATURE_DISCOVERED: 'feature_discovered',
  
  // Engagement
  SETTINGS_UPDATED: 'settings_updated',
  PROFILE_UPDATED: 'profile_updated',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  HELP_ACCESSED: 'help_accessed',
  
  // Mobile Specific
  MOBILE_APP_OPENED: 'mobile_app_opened',
  PUSH_NOTIFICATION_TAPPED: 'push_notification_tapped',
  OFFLINE_RECORDING: 'offline_recording'
} as const 