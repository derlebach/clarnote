# Supabase Analytics Setup Guide

This guide will help you integrate Supabase analytics into your Clarnote app to track user behavior, page views, sessions, and churn events.

## 🎯 What This Integration Tracks

- **Page Views**: Every page visit with user context
- **User Actions**: Button clicks, form submissions, feature usage
- **User Sessions**: Session duration, pages visited, activity patterns
- **Sign-ups**: New user registration events
- **Churn Events**: Subscription cancellations, account deletions, trial endings

## 📋 Prerequisites

1. A [Supabase account](https://supabase.com/) and project
2. Your Clarnote Next.js app running locally
3. Basic knowledge of SQL for database setup

## 🚀 Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Choose your organization and project name
3. Set a strong database password
4. Select your preferred region
5. Wait for the project to be created

## 🔑 Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API keys** → **anon/public** key
   - **Project API keys** → **service_role/secret** key (keep this secure!)

## 📝 Step 3: Add Environment Variables

Add these variables to your `.env.local` file in the root of your project:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Security Note**: Never expose the `SUPABASE_SERVICE_ROLE_KEY` in client-side code. It's only for server-side operations.

## 🗄️ Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of the `supabase-schema.sql` file
3. Paste it into the SQL Editor and click **Run**

This will create:
- **page_views** table - Track page visits
- **actions** table - Track user interactions  
- **user_sessions** table - Track user sessions
- **churn_events** table - Track user churn
- Proper indexes for performance
- Row Level Security (RLS) policies
- Helpful analytics views

## ✅ Step 5: Verify Installation

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000` 
3. Navigate around your app
4. In Supabase dashboard, go to **Table Editor** → **page_views**
5. You should see new rows being created as you navigate

## 📊 Analytics Features Available

### Automatic Tracking
- ✅ **Page views** on every route change
- ✅ **Session management** (start/end/duration)
- ✅ **User context** when signed in

### Manual Tracking
Your app now includes tracking for:

```typescript
// Button clicks
analytics.trackButtonClick('signup', 'header')

// Form submissions  
analytics.trackFormSubmit('email-signup', true)

// File operations
analytics.trackFileUpload('audio', 1024000)
analytics.trackFileTranscribe(120, true)

// App downloads
analytics.trackAppDownload('ios')

// Churn events
analytics.trackSubscriptionCancel('too-expensive')
analytics.trackAccountDelete('privacy-concerns')
```

### Pre-tracked Actions
The following are already tracked in your app:
- 🔘 **Hero CTA buttons** ("Start Today", "Get the App")
- 📧 **Email signups** (coming-soon page)
- 📱 **App download attempts** (iOS/Android)
- 🚀 **Final CTA buttons** ("Start Free Trial", "Schedule Demo")
- 🗂️ **Modal interactions** (open/close)

## 📈 Viewing Your Analytics

### In Supabase Dashboard
1. Go to **Table Editor** to view raw data
2. Use **SQL Editor** for custom queries
3. Check the pre-built views:
   - `daily_page_views` - Daily page view summaries
   - `daily_actions` - Daily action summaries  
   - `user_session_summary` - User engagement metrics

### Example Queries

**Most popular pages:**
```sql
SELECT page, COUNT(*) as views 
FROM page_views 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY page 
ORDER BY views DESC;
```

**User engagement by day:**
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_actions
FROM actions 
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

**Conversion funnel:**
```sql
SELECT 
  action,
  COUNT(*) as count
FROM actions 
WHERE action IN ('email_signup', 'sign_up', 'subscription_start')
GROUP BY action;
```

## 🔧 Customizing Analytics

### Adding New Tracking
To track new actions, use the `useAnalytics` hook:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const analytics = useAnalytics()
  
  const handleSpecialAction = () => {
    analytics.trackAction('special_action', { 
      context: 'my-component',
      value: 100 
    })
  }
  
  return <button onClick={handleSpecialAction}>Special Action</button>
}
```

### Adding New Metrics
1. Add new columns to existing tables or create new tables in Supabase
2. Update the TypeScript interfaces in `src/lib/supabase.ts`
3. Add new tracking functions in `src/lib/analytics.ts`
4. Create new convenience methods in `src/hooks/useAnalytics.ts`

## 🛡️ Privacy & Security

### Data Protection
- ✅ **Row Level Security** enabled on all tables
- ✅ **User data isolation** - users can only see their own data  
- ✅ **Anonymous tracking** supported for non-authenticated users
- ✅ **GDPR compliance** ready (users can request data deletion)

### Best Practices
- Only track necessary data for product improvement
- Avoid tracking sensitive personal information
- Implement data retention policies
- Provide clear privacy policy to users
- Allow users to opt-out of tracking

## 🚨 Troubleshooting

### Common Issues

**1. Environment variables not working:**
- Restart your development server after adding `.env.local`
- Check that variable names match exactly (case-sensitive)
- Ensure `.env.local` is in your project root

**2. Database connection errors:**
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is running
- Ensure RLS policies allow your operations

**3. No data appearing:**
- Check browser console for JavaScript errors
- Verify the database tables were created successfully
- Ensure you're on a page that uses `useAnalytics` hook

**4. TypeScript errors:**
- Run `npm install @types/uuid` if UUID types are missing
- Update TypeScript interfaces if you modify database schema

### Debug Mode
Add this to see tracking events in console:

```typescript
// In src/lib/analytics.ts, add to any tracking function:
console.log('Tracking:', { action, details, userId, sessionId })
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

🎉 **You're all set!** Your Clarnote app now has comprehensive analytics tracking. Monitor user behavior, optimize your conversion funnel, and make data-driven decisions to improve your product. 