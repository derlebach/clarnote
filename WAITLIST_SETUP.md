# Clarnote Waitlist System Setup

A premium Apple/Notion-style waitlist modal system with email confirmations, analytics, and graceful fallbacks.

## Features

✅ **Premium UI**: Apple/Notion aesthetic with dark mode support  
✅ **Accessibility**: WCAG AA compliant with focus traps and keyboard navigation  
✅ **GDPR/CCPA Compliant**: Separate required Terms/Privacy consent and optional marketing consent  
✅ **Graceful Fallbacks**: Works with or without Supabase/Resend  
✅ **Bot Protection**: Honeypot fields and time-based validation  
✅ **Rate Limiting**: 5 submissions per minute per IP  
✅ **Analytics**: Emits events to `window.dataLayer` if available  
✅ **Email Confirmations**: Double opt-in via Resend (optional)  

## Quick Start

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Optional: Supabase (for database storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Resend (for email confirmations)
RESEND_API_KEY=your_resend_api_key

# Site URL (for email confirmation links)
NEXT_PUBLIC_SITE_URL=https://clarnote.com
```

### 2. Supabase Setup (Optional)

If using Supabase, create this table:

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  context TEXT NOT NULL CHECK (context IN ('integrations', 'api')),
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  terms_consent BOOLEAN NOT NULL DEFAULT true,
  ip TEXT,
  user_agent TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, context)
);

-- Add RLS policies as needed
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
```

### 3. Usage in Components

```tsx
'use client';

import { useWaitlistModal } from '@/components/waitlist/useWaitlistModal';
import WaitlistModal from '@/components/waitlist/WaitlistModal';

export default function MyPage() {
  const { isOpen, context, source, openIntegrationsWaitlist, openApiWaitlist, closeWaitlist } = useWaitlistModal();

  return (
    <div>
      <button onClick={() => openIntegrationsWaitlist('hero')}>
        Join Integrations Waitlist
      </button>
      
      <button onClick={() => openApiWaitlist('footer')}>
        Join API Waitlist
      </button>

      {/* Modal */}
      {context && (
        <WaitlistModal
          isOpen={isOpen}
          onClose={closeWaitlist}
          context={context}
          source={source}
        />
      )}
    </div>
  );
}
```

## API Endpoints

### POST /api/waitlist

Accepts waitlist signups with validation and bot protection.

**Request Body:**
```json
{
  "email": "user@example.com",
  "context": "integrations", // or "api"
  "marketingConsent": true,
  "termsConsent": true,
  "source": "hero",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{ "ok": true }
```

### GET /api/waitlist/confirm?token=...

Handles email confirmation links (if Resend is configured).

## Storage Options

### Option 1: Supabase (Recommended)
- Reliable database storage
- Built-in duplicate prevention
- Easy to query and export

### Option 2: JSON Fallback
- Stores in `/tmp/waitlist.json`
- No external dependencies
- Good for development/testing

## Analytics Events

The system emits these events to `window.dataLayer`:

```javascript
// Modal opened
{ event: 'waitlist_open', context: 'integrations', source: 'hero' }

// Submission attempted
{ event: 'waitlist_submit_attempt', context: 'api', source: 'footer' }

// Submission successful
{ event: 'waitlist_submit_success', context: 'integrations', source: 'hero' }

// Submission failed
{ event: 'waitlist_submit_error', context: 'api', source: 'footer', error: 'validation_failed' }
```

## Email Confirmations (Optional)

If `RESEND_API_KEY` is set, the system will:

1. Send a confirmation email after signup
2. User clicks confirmation link
3. Redirects to `/waitlist/confirmed` or `/waitlist/error`

The confirmation email uses a premium design matching Clarnote's brand.

## Security Features

- **Rate Limiting**: 5 submissions per minute per IP
- **Honeypot Protection**: Hidden fields to catch bots
- **Time-based Validation**: Rejects submissions faster than 2 seconds
- **Input Sanitization**: Email validation and length limits
- **Data Privacy**: Sanitizes logs to remove sensitive information

## Customization

### Styling
All styles use Tailwind CSS classes and can be customized in the component files.

### Copy/Content
Modal content is defined in `WaitlistModal.tsx` in the `MODAL_CONTENT` and `SUCCESS_CONTENT` objects.

### Validation
Email validation and other rules can be modified in `src/lib/utils/validation.ts`.

## File Structure

```
src/
├── components/waitlist/
│   ├── WaitlistModal.tsx          # Main modal component
│   └── useWaitlistModal.ts        # Hook for modal state
├── app/api/waitlist/
│   ├── route.ts                   # Main API endpoint
│   └── confirm/route.ts           # Email confirmation
├── app/waitlist/
│   ├── confirmed/page.tsx         # Success page
│   └── error/page.tsx             # Error page
├── lib/
│   ├── supabaseServer.ts          # Supabase client
│   └── utils/validation.ts        # Utilities
```

## Troubleshooting

### Modal not opening
- Ensure the page has `'use client'` directive
- Check that the hook is properly imported

### Submissions failing
- Check API route logs for detailed errors
- Verify environment variables are set
- Test without Supabase first (JSON fallback)

### Email confirmations not working
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for sending limits
- Ensure `NEXT_PUBLIC_SITE_URL` is correct

## Production Deployment

1. Set up Supabase database with the provided schema
2. Configure Resend API key for email confirmations
3. Set `NEXT_PUBLIC_SITE_URL` to your domain
4. Test the complete flow in staging
5. Monitor `/tmp/waitlist.json` as backup (if using JSON fallback)

## Support

For issues with the waitlist system, check:
1. Browser console for client-side errors
2. Server logs for API errors
3. Network tab for failed requests
4. Environment variable configuration 