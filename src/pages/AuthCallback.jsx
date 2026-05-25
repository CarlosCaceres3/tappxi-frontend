import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Supabase redirige aquí después de que el usuario autoriza con Google.
 * Esta página:
 *  1. Lee la sesión que Supabase inyecta en la URL (hash o code)
 *  2. Asigna el rol guardado en sessionStorage al perfil (si es usuario nuevo)
 *  3. Redirige al mapa
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      // Supabase procesa automáticamente el token de la URL
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate('/login');
        return;
      }

      const user = session.user;

      // Verificar si el perfil ya existe
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Usuario nuevo desde Google — crear perfil con el rol elegido
        const pendingRole = sessionStorage.getItem('pendingRole') || 'PASSENGER';
        sessionStorage.removeItem('pendingRole');

        await supabase.from('profiles').insert({
          id:    user.id,
          name:  user.user_metadata?.full_name ?? user.user_metadata?.name ?? 'Usuario',
          phone: null,
          role:  pendingRole,
        });
      }

      navigate('/map');
    };

    handle();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh', background: '#111',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      {/* Spinner simple */}
      <div style={{
        width: 40, height: 40,
        border: '3px solid #2a2a2a',
        borderTop: '3px solid #F5C000',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#555', fontSize: 14 }}>Completando inicio de sesión...</p>
    </div>
  );
}
