-- ============================================================
-- Joy Spark Toys — Migration v3: OTP Phone Auth
-- Adds phone_verified column and unique index on phone
-- ============================================================
-- Run in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Add phone_verified column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- 2. Add unique index on phone (prevents duplicate phone registrations)
-- First, ensure no duplicate phones exist
-- UPDATE profiles SET phone = NULL WHERE phone = '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
  ON profiles (phone)
  WHERE phone IS NOT NULL AND phone != '';

-- 3. Update the handle_new_user trigger to include phone from user_metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, phone_verified, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone',
    CASE WHEN NEW.raw_user_meta_data->>'phone' IS NOT NULL THEN TRUE ELSE FALSE END,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    phone_verified = COALESCE(EXCLUDED.phone_verified, profiles.phone_verified);
  RETURN NEW;
END;
$$;

-- 4. Allow profiles to be inserted by service role (for Edge Function)
-- The existing RLS policies should work since the Edge Function uses service_role key
-- which bypasses RLS. No changes needed for RLS.

-- ============================================================
-- IMPORTANT: Supabase Dashboard Settings Required
-- ============================================================
-- 1. Go to Authentication > Settings > Email
--    - Set "Confirm email" to OFF (disable email confirmation)
--    - OR set "Enable email confirmations" to OFF
--
-- 2. Go to Authentication > Settings > General
--    - Ensure "Enable email signup" stays ON (we use pseudo-emails internally)
--
-- 3. Deploy the otp-auth Edge Function:
--    supabase functions deploy otp-auth --no-verify-jwt
--
-- 4. Set Edge Function secrets:
--    supabase secrets set TWOFACTOR_API_KEY=your_2factor_api_key
--    supabase secrets set OTP_AUTH_SECRET=your_secure_random_string
--
-- Note: SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY
-- are automatically available in Edge Functions.
-- ============================================================
