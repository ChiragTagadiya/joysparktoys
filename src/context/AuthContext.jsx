import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SITE_URL } from '../config/supabase.config';

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

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); return false; }
    return true;
  }, []);

  const register = useCallback(async (name, email, password) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${SITE_URL}/login`,
      },
    });
    if (error) { setAuthError(error.message); return false; }
    if (data.user && !data.session) {
      setAuthError('Check your email to confirm your account, then log in.');
      return false;
    }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name, role: 'customer' });
    }
    return true;
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
    phone: profile?.phone || '',
    role: profile?.role || 'customer',
    createdAt: authUser.created_at,
  } : null;

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, profile, loading, authError,
      login, register, logout, updateProfile, clearError,
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
