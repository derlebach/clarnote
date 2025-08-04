# Custom Event Tracking Guide

This guide explains how to use Clarnote's custom event tracking system to monitor user behavior and inform product decisions.

## 🎯 Overview

The custom event tracking system allows you to track any user interaction or system event in your Clarnote app. All events are stored in Supabase's `actions` table with rich metadata for analysis.

## 🚀 Quick Start

### Basic Usage

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const { trackEvent } = useAnalytics()
  
  const handleAction = () => {
    // Track a custom event
    trackEvent('recording_started', { 
      source: 'home_page',
      device: 'desktop' 
    })
  }
  
  return <button onClick={handleAction}>Start Recording</button>
}
```

### Using Predefined Events

```typescript
function RecordingComponent() {
  const analytics = useAnalytics()
  
  const startRecording = () => {
    // Use predefined convenience method
    analytics.trackRecordingStarted('dashboard', 0)
    
    // Or use the event constant
    analytics.trackEvent(analytics.CUSTOM_EVENTS.RECORDING_STARTED, {
      source: 'dashboard',
      microphone: 'built-in'
    })
  }
}
```

## 📊 Event Structure

Every tracked event includes:

```typescript
{
  type: string,        // Event type (e.g., 'recording_started')
  page: string,        // Current page path
  meta: object,        // Custom metadata you provide
  user_id: string,     // Supabase user ID (if authenticated)
  session_id: string,  // Unique session identifier
  timestamp: string    // ISO timestamp
}
```

## 🎪 Available Event Types

### Core Recording Events
```typescript
// Recording lifecycle
analytics.trackRecordingStarted('dashboard', 120)
analytics.trackRecordingStopped(300, 'dashboard')
analytics.trackEvent('recording_uploaded', { fileSize: 1024000 })

// Transcription
analytics.trackTranscriptGenerated(300, 1200, 'en')
analytics.trackEvent('transcript_saved', { meetingId: 'abc123' })
```

### AI Features
```typescript
// AI processing
analytics.trackSummaryGenerated(5000, 500)
analytics.trackEvent('action_items_generated', { count: 3 })
analytics.trackEvent('speakers_identified', { speakerCount: 2 })
```

### User Journey
```typescript
// Key milestones
analytics.trackFirstRecording('onboarding', 'upload')
analytics.trackUpgradedToPro('pro', 29.99, 'feature-gate')
analytics.trackFeatureDiscovered('speaker-identification', 'tooltip')
```

### Export & Sharing
```typescript
// Content sharing
analytics.trackPDFExported('meeting123', 5)
analytics.trackEvent('email_shared', { recipientCount: 3 })
analytics.trackEvent('link_shared', { platform: 'slack' })
```

## 🛠️ Advanced Usage

### Complex Event Tracking
```typescript
const handleComplexAction = async () => {
  // Track with rich metadata
  await analytics.trackEvent('workflow_completed', {
    workflowType: 'meeting-analysis',
    duration: performance.now() - startTime,
    steps: ['upload', 'transcribe', 'summarize', 'export'],
    success: true,
    errors: [],
    metadata: {
      fileType: 'mp4',
      fileSize: 15728640,
      processingTime: 45000,
      confidence: 0.94
    }
  })
}
```

### Conditional Tracking
```typescript
const handleFeatureUse = (feature: string) => {
  // Track feature discovery only once per session
  const discovered = sessionStorage.getItem(`discovered_${feature}`)
  if (!discovered) {
    analytics.trackFeatureDiscovered(feature, 'first-use')
    sessionStorage.setItem(`discovered_${feature}`, 'true')
  }
  
  // Always track usage
  analytics.trackEvent(`${feature}_used`, {
    sessionCount: getSessionUsageCount(feature),
    context: getCurrentContext()
  })
}
```

### Error Tracking
```typescript
const handleError = (error: Error, context: string) => {
  analytics.trackEvent('error_occurred', {
    errorType: error.name,
    errorMessage: error.message,
    context,
    stack: error.stack?.substring(0, 500), // Truncate for storage
    url: window.location.href,
    userAgent: navigator.userAgent
  })
}
```

## 📈 Event Analysis

### Popular Queries

**Feature Usage Over Time:**
```sql
SELECT 
  DATE(timestamp) as date,
  action as event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users
FROM actions 
WHERE action LIKE '%recording%'
GROUP BY DATE(timestamp), action
ORDER BY date DESC, event_count DESC;
```

**User Journey Analysis:**
```sql
WITH user_events AS (
  SELECT 
    user_id,
    action,
    details->>'page' as page,
    timestamp,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY timestamp) as event_order
  FROM actions 
  WHERE user_id IS NOT NULL
)
SELECT 
  action,
  AVG(event_order) as avg_step,
  COUNT(*) as occurrences
FROM user_events 
WHERE action IN ('first_recording', 'transcript_generated', 'upgraded_to_pro')
GROUP BY action
ORDER BY avg_step;
```

**Feature Discovery Funnel:**
```sql
SELECT 
  details->>'feature' as feature,
  COUNT(*) as discoveries,
  COUNT(DISTINCT user_id) as unique_discoverers,
  AVG(EXTRACT(EPOCH FROM timestamp - (
    SELECT MIN(timestamp) 
    FROM actions a2 
    WHERE a2.user_id = actions.user_id
  ))) as avg_time_to_discovery
FROM actions 
WHERE action = 'feature_discovered'
GROUP BY details->>'feature'
ORDER BY discoveries DESC;
```

## 🔧 Custom Event Categories

### Product Usage Events
Track how users interact with core features:
```typescript
// Core workflows
'meeting_created'
'recording_processed'
'summary_reviewed'
'action_item_completed'

// Feature adoption
'feature_enabled'
'setting_changed'
'integration_connected'
```

### Business Intelligence Events
Track events that matter for your business:
```typescript
// Conversion events
'trial_started'
'payment_method_added'
'subscription_upgraded'
'referral_sent'

// Engagement events
'daily_active'
'weekly_return'
'content_shared'
'feedback_provided'
```

### Technical Events
Monitor app performance and errors:
```typescript
// Performance
'page_load_slow'
'api_timeout'
'offline_mode_enabled'

// Errors
'upload_failed'
'transcription_error'
'payment_declined'
```

## 🎯 Best Practices

### Event Naming
- Use **snake_case** for consistency
- Be **descriptive** but **concise**
- Group related events with **prefixes**: `recording_`, `user_`, `payment_`

### Metadata Structure
```typescript
// Good: Structured, searchable metadata
analytics.trackEvent('feature_used', {
  feature: 'speaker-identification',
  context: 'meeting-review',
  performance: {
    processingTime: 1200,
    accuracy: 0.94
  },
  user: {
    tier: 'pro',
    daysActive: 15
  }
})

// Avoid: Unstructured or sensitive data
analytics.trackEvent('action', {
  data: 'random string',
  password: 'secret123', // Never track sensitive data
  everything: { /* massive object */ }
})
```

### Privacy & Compliance
- **Never track PII** (personal identifiable information)
- **Hash or anonymize** sensitive identifiers
- **Respect user preferences** for tracking
- **Provide opt-out mechanisms**

### Performance
- **Track meaningful events only** - not every click
- **Batch events** when possible for better performance
- **Use async tracking** - don't block user interactions
- **Set up data retention policies** in Supabase

## 🚨 Development Mode

In development, all events are logged to the console:

```
🔍 Tracked Event: {
  type: "recording_started",
  page: "/dashboard",
  timestamp: "2024-01-15T10:30:00.000Z",
  meta: { source: "dashboard", duration: 0 },
  user_id: "uuid-here",
  session_id: "session-uuid"
}
```

This helps with debugging and ensures your tracking is working correctly.

## 🎉 Examples in Clarnote

### Dashboard Recording Start
```typescript
const startRecording = async () => {
  try {
    // Start recording logic
    await initializeRecording()
    
    // Track the event
    analytics.trackRecordingStarted('dashboard', 0)
    analytics.trackEvent('microphone_access', { 
      granted: true,
      device: await getMicrophoneDevice()
    })
    
  } catch (error) {
    analytics.trackEvent('recording_start_failed', {
      error: error.message,
      context: 'dashboard'
    })
  }
}
```

### Upgrade Flow
```typescript
const handleUpgrade = (plan: string) => {
  // Track upgrade intent
  analytics.trackEvent('upgrade_button_clicked', {
    plan,
    currentPlan: user.plan,
    trigger: 'feature-limit',
    page: pathname
  })
  
  // After successful payment
  analytics.trackUpgradedToPro(plan, pricing[plan], 'feature-limit')
  analytics.trackEvent('onboarding_milestone', {
    milestone: 'pro_user',
    daysFromSignup: getDaysFromSignup(user.createdAt)
  })
}
```

### File Processing
```typescript
const processFile = async (file: File) => {
  const startTime = performance.now()
  
  try {
    // Track upload
    analytics.trackEvent('file_upload_started', {
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name.split('.').pop() // Just extension
    })
    
    const result = await transcribeFile(file)
    const processingTime = performance.now() - startTime
    
    // Track successful processing
    analytics.trackTranscriptGenerated(
      result.duration, 
      result.wordCount, 
      result.language
    )
    
    analytics.trackEvent('processing_completed', {
      processingTime,
      confidence: result.confidence,
      speakersDetected: result.speakers?.length || 0
    })
    
  } catch (error) {
    analytics.trackEvent('processing_failed', {
      error: error.message,
      processingTime: performance.now() - startTime,
      fileSize: file.size
    })
  }
}
```

---

🎉 **You're ready to track!** Use custom events to understand user behavior, identify popular features, and make data-driven product decisions for Clarnote. 