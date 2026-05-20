import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) { setProfile(null); return; }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !data) {
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    // Listener de cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login({ email, password });
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authAPI.register(formData);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authAPI.logout();
    setUser(null);
    setProfile(null);
  }, []);

  const currentUser = user && profile
    ? {
        id:    user.id,
        email: user.email,
        name:  profile.name,
        phone: profile.phone,
        role:  profile.role,
      }
    : null;

  const isDriver    = profile?.role === 'DRIVER';
  const isPassenger = profile?.role === 'PASSENGER';

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      loading,
      login,
      register,
      logout,
      isDriver,
      isPassenger,
      reloadProfile: () => loadProfile(user),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};