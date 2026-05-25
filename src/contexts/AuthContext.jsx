import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(undefined); // undefined = todavía cargando
  const [loading, setLoading] = useState(true);

  const buildUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Setear inmediatamente con datos del token JWT
    const tokenUser = {
      id:    authUser.id,
      email: authUser.email,
      name:  authUser.user_metadata?.name        ?? authUser.user_metadata?.full_name ?? 'Usuario',
      phone: authUser.user_metadata?.phone       ?? null,
      role:  authUser.user_metadata?.role        ?? 'PASSENGER',
      avatar: authUser.user_metadata?.avatar_url ?? null, // viene de Google
    };
    setUser(tokenUser);
    setLoading(false);

    // Enriquecer con tabla profiles en segundo plano
    supabase
      .from('profiles')
      .select('name, phone, role')
      .eq('id', authUser.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUser(prev => ({
            ...prev,
            name:  data.name  ?? tokenUser.name,
            phone: data.phone ?? tokenUser.phone,
            role:  data.role  ?? tokenUser.role,
          }));
        }
      });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      buildUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          buildUser(session?.user ?? null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [buildUser]);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const register = useCallback(async ({ name, email, password, phone, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone: phone || null, role: role || 'PASSENGER' }
      },
    });
    if (error) throw error;
    return data;
  }, []);

  // Login con Google — redirige a Google y vuelve automáticamente
  // El rol se pasa como parámetro para guardarlo cuando Supabase retorne
  const loginWithGoogle = useCallback(async (role = 'PASSENGER') => {
    // Guardamos el rol elegido en sessionStorage para usarlo al volver
    sessionStorage.setItem('pendingRole', role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  }, []);

  const isDriver    = user?.role === 'DRIVER';
  const isPassenger = user?.role === 'PASSENGER';

  return (
    <AuthContext.Provider value={{
      user:     user ?? null,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      isDriver,
      isPassenger,
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
