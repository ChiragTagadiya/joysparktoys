// ============================================================
// 🔧 SUPABASE CONFIGURATION
// ============================================================
// Option A (recommended): Set values in your .env file
//   VITE_SUPABASE_URL=https://your-project.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key
//
// Option B (quick test): Replace the fallback strings below
//   export const SUPABASE_URL = 'https://your-project.supabase.co';
//   export const SUPABASE_ANON_KEY = 'your-anon-key';
//
// Get your keys from:
//   https://app.supabase.com → Project → Settings → API
// ============================================================

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Optional: override the redirect URL used in Supabase auth emails
// e.g. VITE_SITE_URL=https://littlejoy.netlify.app
export const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!SUPABASE_CONFIGURED) {
  console.warn(
    '⚠️  Supabase is not configured.\n' +
    '   Copy .env.example → .env and fill in your project URL and anon key.\n' +
    '   Get them from: https://app.supabase.com → Settings → API'
  );
}
