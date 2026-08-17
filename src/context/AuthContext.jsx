import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { OtpService } from '../services/otp.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /** Send OTP to phone number */
  const sendOtp = useCallback(async (phone) => {
    setAuthError(null);
    try {
      const result = await OtpService.sendOtp(phone);
      return { ok: true, sessionId: result.sessionId };
    } catch (err) {
      setAuthError(err.message);
      return { ok: false };
    }
  }, []);

  /** Verify OTP and sign in */
  const verifyOtp = useCallback(async (phone, sessionId, otp, name = '') => {
    setAuthError(null);
    try {
      const result = await OtpService.verifyOtp(phone, sessionId, otp, name);

      // Set the Supabase session from Edge Function response
      const { data, error } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (error) {
        setAuthError('Failed to establish session');
        return { ok: false };
      }

      // If new user and name provided, update profile
      if (result.isNew && name) {
        await supabase.from('profiles').update({ name }).eq('id', data.user.id);
      }

      return { ok: true, isNew: result.isNew };
    } catch (err) {
      setAuthError(err.message);
      return { ok: false };
    }
  }, []);

  /** Resend OTP */
  const resendOtp = useCallback(async (phone) => {
    setAuthError(null);
    try {
      const result = await OtpService.resendOtp(phone);
      return { ok: true, sessionId: result.sessionId };
    } catch (err) {
      setAuthError(err.message);
      return { ok: false };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
    setAuthError(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!authUser) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', authUser.id);
    if (!error) setProfile((prev) => ({ ...prev, ...updates }));
    return !error;
  }, [authUser]);

  const clearError = useCallback(() => setAuthError(null), []);

  const user = authUser ? {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || authUser.user_metadata?.name || '',
    phone: profile?.phone || authUser.user_metadata?.phone || '',
    role: profile?.role || 'customer',
    phoneVerified: profile?.phone_verified || false,
    createdAt: authUser.created_at,
  } : null;

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, profile, loading, authError,
      sendOtp, verifyOtp, resendOtp, logout, updateProfile, clearError,
      isAuthenticated: !!authUser,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
