import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView, trackAction, trackSignUp, endSession, trackChurn, trackEvent, ACTIONS, CHURN_EVENTS, CUSTOM_EVENTS } from '@/lib/analytics'

export const useAnalytics = () => {
  const pathname = usePathname()

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname])

  // End session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        endSession()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return {
    // Direct action tracking
    trackAction,
    trackSignUp,
    trackChurn,
    trackEvent,
    
    // Convenience methods for common actions
    trackButtonClick: (buttonName: string, location?: string) => 
      trackAction(ACTIONS.BUTTON_CLICK, { button_name: buttonName, location }),
    
    trackFormSubmit: (formName: string, success?: boolean) => 
      trackAction(ACTIONS.FORM_SUBMIT, { form_name: formName, success }),
    
    trackLinkClick: (linkUrl: string, linkText?: string) => 
      trackAction(ACTIONS.LINK_CLICK, { url: linkUrl, text: linkText }),
    
    trackEmailSignup: (email: string, source?: string) => 
      trackAction(ACTIONS.EMAIL_SIGNUP, { email, source }),
    
    trackAppDownload: (platform: 'ios' | 'android') => 
      trackAction(ACTIONS.APP_DOWNLOAD, { platform }),
    
    trackModalOpen: (modalName: string) => 
      trackAction(ACTIONS.MODAL_OPEN, { modal_name: modalName }),
    
    trackModalClose: (modalName: string, method?: string) => 
      trackAction(ACTIONS.MODAL_CLOSE, { modal_name: modalName, close_method: method }),
    
    // File operations
    trackFileUpload: (fileType: string, fileSize?: number) => 
      trackAction(ACTIONS.FILE_UPLOAD, { file_type: fileType, file_size: fileSize }),
    
    trackFileTranscribe: (duration?: number, success?: boolean) => 
      trackAction(ACTIONS.FILE_TRANSCRIBE, { duration, success }),
    
    trackFileSummarize: (success?: boolean) => 
      trackAction(ACTIONS.FILE_SUMMARIZE, { success }),
    
    trackFileExport: (format: string) => 
      trackAction(ACTIONS.FILE_EXPORT, { format }),
    
    // Auth tracking
    trackSignIn: (method: string = 'email') => 
      trackAction(ACTIONS.SIGN_IN, { method }),
    
    trackSignOut: () => 
      trackAction(ACTIONS.SIGN_OUT),
    
    // Subscription tracking
    trackSubscriptionStart: (plan: string, amount?: number) => 
      trackAction(ACTIONS.SUBSCRIPTION_START, { plan, amount }),
    
    trackSubscriptionCancel: (reason?: string) => {
      trackAction(ACTIONS.SUBSCRIPTION_CANCEL, { reason })
      trackChurn(CHURN_EVENTS.SUBSCRIPTION_CANCEL, reason)
    },
    
    trackSubscriptionUpgrade: (fromPlan: string, toPlan: string) => 
      trackAction(ACTIONS.SUBSCRIPTION_UPGRADE, { from_plan: fromPlan, to_plan: toPlan }),
    
    // Churn tracking
    trackAccountDelete: (reason?: string) => 
      trackChurn(CHURN_EVENTS.ACCOUNT_DELETE, reason),
    
    trackTrialEnd: (converted: boolean) => 
      trackChurn(CHURN_EVENTS.TRIAL_END, converted ? 'converted' : 'not_converted'),
    
    trackPaymentFailed: (amount: number, reason?: string) => 
      trackChurn(CHURN_EVENTS.PAYMENT_FAILED, reason, amount),
    
    // Clarnote-specific event tracking
    trackRecordingStarted: (source?: string, duration?: number) => 
      trackEvent(CUSTOM_EVENTS.RECORDING_STARTED, { source, duration }),
    
    trackRecordingStopped: (duration: number, source?: string) => 
      trackEvent(CUSTOM_EVENTS.RECORDING_STOPPED, { duration, source }),
    
    trackTranscriptGenerated: (duration: number, wordCount?: number, language?: string) => 
      trackEvent(CUSTOM_EVENTS.TRANSCRIPT_GENERATED, { duration, wordCount, language }),
    
    trackSummaryGenerated: (transcriptLength: number, summaryLength?: number) => 
      trackEvent(CUSTOM_EVENTS.SUMMARY_GENERATED, { transcriptLength, summaryLength }),
    
    trackUpgradedToPro: (plan: string, price?: number, trigger?: string) => 
      trackEvent(CUSTOM_EVENTS.UPGRADED_TO_PRO, { plan, price, trigger }),
    
    trackFeatureDiscovered: (feature: string, context?: string) => 
      trackEvent(CUSTOM_EVENTS.FEATURE_DISCOVERED, { feature, context }),
    
    trackPDFExported: (meetingId?: string, pageCount?: number) => 
      trackEvent(CUSTOM_EVENTS.PDF_EXPORTED, { meetingId, pageCount }),
    
    trackFirstRecording: (source?: string, method?: string) => 
      trackEvent(CUSTOM_EVENTS.FIRST_RECORDING, { source, method }),
    
    // Constants for easy access
    ACTIONS,
    CHURN_EVENTS,
    CUSTOM_EVENTS
  }
} 