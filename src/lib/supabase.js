import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:    true,   // guarda sesión en localStorage
    autoRefreshToken:  true,   // renueva el JWT automáticamente
    detectSessionInUrl: true,  // necesario para OAuth (Google, etc.)
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});
