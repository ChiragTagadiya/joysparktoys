# OTP Authentication Setup Guide — Joy Spark Toys

## Overview

This document covers the complete setup for replacing email/password authentication with **mobile OTP verification** using **2Factor.in** as the OTP service provider.

### Architecture

```
┌──────────────┐         ┌─────────────────────────┐         ┌─────────────┐
│   Frontend   │ ──────> │  Supabase Edge Function  │ ──────> │ 2Factor.in  │
│  (React App) │ <────── │      (otp-auth)          │ <────── │  OTP API    │
└──────────────┘         └─────────────────────────┘         └─────────────┘
       │                           │
       │                           ▼
       │                  ┌─────────────────┐
       └──────────────────│  Supabase Auth   │
                          │  + profiles DB   │
                          └─────────────────┘
```

### Flow

1. User enters **10-digit Indian mobile number** → Frontend calls Edge Function → 2Factor.in sends OTP
2. User enters **6-digit OTP** → Edge Function verifies with 2Factor.in
3. Edge Function creates/finds user in Supabase Auth → Returns session tokens
4. Frontend establishes Supabase session → User is authenticated
5. At checkout: Verified phone is **pre-filled and non-editable**
6. Returning users: Must verify via OTP again to sign in

---

## Supabase Changes Required

### 1. Run the Database Migration

Go to **Supabase Dashboard → SQL Editor → New Query** and run:

```sql
-- File: supabase/migration_v3_otp_auth.sql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
  ON profiles (phone)
  WHERE phone IS NOT NULL AND phone != '';

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
```

### 2. Disable Email Confirmation

Go to **Supabase Dashboard → Authentication → Email**:
- Set **"Confirm email"** to **OFF** (or toggle "Enable email confirmations" off)

This is required because we use pseudo-emails (`{phone}@joysparktoys.app`) internally for Supabase Auth - these aren't real emails.

### 3. Deploy the Edge Function

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref thagawposznybypvvafz

# Deploy the edge function (--no-verify-jwt allows public access)
supabase functions deploy otp-auth --no-verify-jwt
```

### 4. Set Edge Function Secrets

```bash
# Your 2Factor.in API key (get from https://2factor.in dashboard)
supabase secrets set TWOFACTOR_API_KEY=your_2factor_api_key_here

# A random secret string for password derivation (generate a strong random string)
supabase secrets set OTP_AUTH_SECRET=generate_a_32_char_random_string
```

> **Note:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions — you don't need to set them.

---

## 2Factor.in Setup

1. Sign up at [https://2factor.in](https://2factor.in)
2. Complete business verification / KYC
3. Get your API key from the dashboard
4. Ensure your account has credits for OTP SMS

### API Endpoints Used

| Action | Endpoint |
|--------|----------|
| Send OTP | `GET https://2factor.in/API/V1/{api_key}/SMS/{phone}/AUTOGEN` |
| Verify OTP | `GET https://2factor.in/API/V1/{api_key}/SMS/VERIFY/{session_id}/{otp}` |

---

## Frontend Files Changed

| File | Change |
|------|--------|
| `src/services/otp.service.js` | **NEW** — OTP service (calls Edge Function) |
| `src/context/AuthContext.jsx` | Replaced `login`/`register` with `sendOtp`/`verifyOtp`/`resendOtp` |
| `src/components/auth/AuthModal.jsx` | Rewritten — Phone + OTP + Name flow (removed email/password) |
| `src/components/checkout/AddressForm.jsx` | Phone field is now pre-filled & non-editable when verified |
| `src/pages/Profile.jsx` | Shows verified phone, removed email edit |
| `src/pages/Checkout.jsx` | Uses `user.phone` instead of `user.email` in order address |
| `src/components/layout/Navbar.jsx` | Shows phone instead of email in user dropdown |
| `src/utils/validators.js` | Added `validateOtp`, removed unused password validators |
| `.env` / `.env.example` | Added note about Edge Function secrets |

---

## How It Works (Technical Details)

### Authentication Flow

1. **Phone Input**: User enters 10-digit Indian number (validated: starts with 6-9)
2. **Send OTP**: Frontend → Edge Function → 2Factor.in API → SMS delivered
3. **Verify OTP**: Frontend → Edge Function → 2Factor.in verifies → Success
4. **Create/Find User**:
   - Edge Function checks `profiles` table for existing phone
   - If new: Creates Supabase Auth user with pseudo-email (`{phone}@joysparktoys.app`)
   - If existing: Updates password for consistency
5. **Return Session**: Edge Function signs in and returns `access_token` + `refresh_token`
6. **Frontend Session**: Calls `supabase.auth.setSession()` → Triggers `onAuthStateChange`

### Security

- **2Factor.in API key** is stored server-side (Edge Function secret, not in frontend bundle)
- **Password derivation** uses a server-side secret (`OTP_AUTH_SECRET`) — not exposed to clients
- **OTP is the real authentication factor** — passwords are just a mechanism for Supabase sessions
- **Supabase RLS** continues to work (proper JWT from `auth.uid()`)

### Phone Validation

Indian mobile number rules enforced:
- Exactly **10 digits**
- Must start with **6, 7, 8, or 9**
- Regex: `/^[6-9]\d{9}$/`

### Checkout Behavior

- Verified phone is **always pre-filled** from the authenticated user's profile
- Phone field is **read-only** (shows "Verified" badge)
- Other fields (name, address, city, state, pincode) are editable as usual
- The verified phone is stored with the order for delivery communication

---

## Testing

1. Run the migration SQL in Supabase
2. Deploy the Edge Function
3. Set the secrets
4. Disable email confirmation
5. Open the app → Click Login → Enter phone → Receive OTP → Verify → Done!

### Test Numbers (2Factor.in sandbox)

If using 2Factor.in's test mode, check their dashboard for test phone numbers and OTPs.

---

## Rollback

To revert to email/password auth:
1. Restore `AuthContext.jsx`, `AuthModal.jsx` from git history
2. Re-enable email confirmation in Supabase
3. The `phone_verified` column can remain (backward compatible)
