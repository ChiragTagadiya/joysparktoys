# Joy Spark Toys — Analytics Setup

## Files added

- `src/analytics/*` — Pixel, GA4, Clarity and shared ecommerce event utilities.
- `src/hooks/usePageTracking.js` — `PageView` on every React Router change.
- `supabase/functions/meta-conversion-api/index.ts` — Server-side Conversion API Edge Function.
- `ANALYTICS_SETUP.md` — this document.

## Environment variables

Add these to your `.env` (not `.env.example` unless you are templating):

```bash
# Pixel
VITE_META_PIXEL_ID=2505782873168327

# Optional test code from Meta Events Manager → Test Events
VITE_META_TEST_EVENT_CODE=

# Google Analytics 4
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Microsoft Clarity (only loads in production)
VITE_MICROSOFT_CLARITY_ID=xxxxxxxxxx

# Supabase Conversion API (optional)
VITE_META_CAPI_ENABLED=false
```

> `META_ACCESS_TOKEN` and `META_TEST_EVENT_CODE` for the Edge Function are stored as Supabase secrets, not in the frontend.

## Supabase Edge Function deploy

```bash
supabase functions deploy meta-conversion-api
```

Set the secret:

```bash
supabase secrets set META_ACCESS_TOKEN=your-graph-api-token
# optional, for testing server events
supabase secrets set META_TEST_EVENT_CODE=TEST12345
```

The function posts to `https://graph.facebook.com/v23.0/2505782873168327/events` and hashes PII server-side.

## Testing

1. **Meta Pixel browser events:** Add `VITE_META_TEST_EVENT_CODE=TESTxxxxx` in dev. Open Meta Events Manager → Test Events.
2. **GA4:** Use the GA4 DebugView.
3. **Clarity:** Only loads when `import.meta.env.MODE === 'production'`.
4. **Conversion API:** Set `VITE_META_CAPI_ENABLED=true` after deploying the Edge Function and watch the Test Events tab.

## Common issues

- **Events not firing in dev?** GA4/Clarity require their IDs; Meta test code only appears in non-production builds.
- **Duplicate PageViews?** `usePageTracking` uses a ref to de-duplicate route changes.
- **CORS error on Edge Function?** The function returns CORS headers for `POST` and `OPTIONS`.
- **Changing Pixel/GA4/Clarity IDs?** Edit only `src/analytics/constants.ts` or the environment variables.
