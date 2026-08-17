// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================
// OTP Auth Edge Function — Joy Spark Toys
// Uses 2factor.in for OTP delivery and Supabase Auth for sessions
// ============================================================

const TWOFACTOR_API_KEY = Deno.env.get('TWOFACTOR_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const OTP_AUTH_SECRET = Deno.env.get('OTP_AUTH_SECRET') || 'JoySpark_OTP_SecureKey_2024!';
const TWOFACTOR_TEMPLATE_NAME = Deno.env.get('TWOFACTOR_TEMPLATE_NAME') || '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Generate a secure password from phone + server secret (never exposed to frontend) */
function derivePassword(phone: string): string {
  const raw = `${OTP_AUTH_SECRET}:${phone}:${phone.split('').reverse().join('')}:${OTP_AUTH_SECRET}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `JST_${Math.abs(hash).toString(36)}_${OTP_AUTH_SECRET.slice(0, 12)}`;
}

/** Validate Indian mobile number */
function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/** Format phone for 2Factor.in (use +91 prefix as per official docs) */
function getTwoFactorPhone(phone: string): string {
  return phone.startsWith('+91') ? phone : `+91${phone}`;
}

/** Build 2Factor.in send OTP URL (with optional SMS template to force SMS) */
function buildOtpUrl(phone: string): string {
  const to = getTwoFactorPhone(phone);
  const template = TWOFACTOR_TEMPLATE_NAME.trim();
  const base = `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${to}/AUTOGEN`;
  return template ? `${base}/${template}` : base;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { action, phone, sessionId, otp, name } = body;

    // ============================================================
    // ACTION: send — Send OTP via 2factor.in
    // ============================================================
    if (action === 'send') {
      if (!phone || !isValidPhone(phone)) {
        return new Response(
          JSON.stringify({ error: 'Invalid Indian mobile number. Must be 10 digits starting with 6-9.' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      // Call 2factor.in to send OTP (uses 91-prefixed number + optional template)
      const otpRes = await fetch(buildOtpUrl(phone));
      const otpData = await otpRes.json();

      if (otpData.Status !== 'Success') {
        return new Response(
          JSON.stringify({ error: 'Failed to send OTP. Please try again.' }),
          { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, sessionId: otpData.Details }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================================
    // ACTION: verify — Verify OTP and create/sign-in user
    // ============================================================
    if (action === 'verify') {
      if (!phone || !isValidPhone(phone)) {
        return new Response(
          JSON.stringify({ error: 'Invalid phone number' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }
      if (!sessionId || !otp) {
        return new Response(
          JSON.stringify({ error: 'Session ID and OTP are required' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      // Verify OTP with 2factor.in
      const verifyRes = await fetch(
        `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
      );
      const verifyData = await verifyRes.json();

      if (verifyData.Status !== 'Success') {
        const msg = verifyData.Details === 'OTP Expired'
          ? 'OTP has expired. Please request a new one.'
          : 'Invalid OTP. Please try again.';
        return new Response(
          JSON.stringify({ error: msg }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      // OTP verified! Now handle Supabase Auth
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const email = `${phone}@joysparktoys.app`;
      const password = derivePassword(phone);
      let isNew = false;

      // Check if user already exists via profiles table
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .single();

      if (existingProfile) {
        // Existing user — update password to ensure consistency, then sign in
        await supabaseAdmin.auth.admin.updateUserById(existingProfile.id, { password });

        // Update phone_verified flag
        await supabaseAdmin
          .from('profiles')
          .update({ phone_verified: true, updated_at: new Date().toISOString() })
          .eq('id', existingProfile.id);
      } else {
        // New user — create account
        isNew = true;
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          password,
          user_metadata: { phone, name: name || '' },
        });

        if (createErr) {
          // If user exists in auth but not in profiles (edge case), find and update
          if (createErr.message?.includes('already')) {
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
            const existing = users?.find((u: any) => u.email === email);
            if (existing) {
              await supabaseAdmin.auth.admin.updateUserById(existing.id, { password });
              await supabaseAdmin.from('profiles').upsert({
                id: existing.id,
                phone,
                phone_verified: true,
                name: name || existing.user_metadata?.name || '',
                role: 'customer',
                updated_at: new Date().toISOString(),
              });
            } else {
              return new Response(
                JSON.stringify({ error: 'Failed to create account' }),
                { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
              );
            }
          } else {
            return new Response(
              JSON.stringify({ error: createErr.message || 'Failed to create account' }),
              { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
          }
        } else if (created?.user) {
          // Create profile for new user
          await supabaseAdmin.from('profiles').upsert({
            id: created.user.id,
            phone,
            phone_verified: true,
            name: name || '',
            role: 'customer',
          });
        }
      }

      // Sign in to get session tokens
      const { data: signInData, error: signInErr } = await supabaseAnon.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr || !signInData?.session) {
        return new Response(
          JSON.stringify({ error: 'Authentication failed. Please try again.' }),
          { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          session: {
            access_token: signInData.session.access_token,
            refresh_token: signInData.session.refresh_token,
          },
          isNew,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================================
    // ACTION: resend — Resend OTP
    // ============================================================
    if (action === 'resend') {
      if (!phone || !isValidPhone(phone)) {
        return new Response(
          JSON.stringify({ error: 'Invalid phone number' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      const otpRes = await fetch(buildOtpUrl(phone));
      const otpData = await otpRes.json();

      if (otpData.Status !== 'Success') {
        return new Response(
          JSON.stringify({ error: 'Failed to resend OTP' }),
          { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, sessionId: otpData.Details }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: send, verify, or resend' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
