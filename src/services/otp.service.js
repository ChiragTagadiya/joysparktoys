import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase.config';

const OTP_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/otp-auth`;

/**
 * Call the otp-auth Edge Function
 */
async function callOtpFunction(payload) {
  const res = await fetch(OTP_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const OtpService = {
  /**
   * Send OTP to an Indian mobile number
   * @param {string} phone - 10-digit Indian mobile number (without +91)
   * @returns {Promise<{ success: boolean, sessionId: string }>}
   */
  sendOtp: async (phone) => {
    return callOtpFunction({ action: 'send', phone });
  },

  /**
   * Verify OTP and authenticate user
   * @param {string} phone - 10-digit Indian mobile number
   * @param {string} sessionId - Session ID from sendOtp response
   * @param {string} otp - OTP entered by user
   * @param {string} [name] - Optional name for new users
   * @returns {Promise<{ success: boolean, session: { access_token, refresh_token }, isNew: boolean }>}
   */
  verifyOtp: async (phone, sessionId, otp, name = '') => {
    return callOtpFunction({ action: 'verify', phone, sessionId, otp, name });
  },

  /**
   * Resend OTP to the same phone number
   * @param {string} phone - 10-digit Indian mobile number
   * @returns {Promise<{ success: boolean, sessionId: string }>}
   */
  resendOtp: async (phone) => {
    return callOtpFunction({ action: 'resend', phone });
  },
};
