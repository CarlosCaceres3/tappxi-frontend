import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [params] = useSearchParams();
  const defaultRole = params.get('role') || 'PASSENGER';
  const defaultMode = params.get('mode') === 'login' ? 'login' : 'register';

  const [mode, setMode]       = useState(defaultMode);
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '', role: defaultRole });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login, register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/map'); }, [user]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Completa los campos obligatorios'); return; }
    if (mode === 'register' && !form.name) { setError('El nombre es obligatorio'); return; }
    if (mode === 'register' && form.password.length < 8) { setError('Mínimo 8 caracteres'); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          name:     form.name,
          email:    form.email,
          password: form.password,
          phone:    form.phone,
          role:     form.role,
        });
      }
      navigate('/map');
    } catch (err) {
      setError(err.message || 'Error de autenticación');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      // Pasamos el rol seleccionado para que se guarde al volver de Google
      await loginWithGoogle(form.role);
      // No navigamos aquí — Google redirige de vuelta automáticamente
    } catch (err) {
      setError(err.message || 'Error al conectar con Google');
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div style={{
      minHeight: '100vh', background: '#111',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, background: '#F5C000',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4v4a2 2 0 0 1-2 2h-1"/>
                <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
            <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: -.5 }}>
              Cabp<span style={{ color: '#F5C000' }}>xi</span>
            </span>
          </Link>
          <p style={{ fontSize: 14, color: '#666' }}>
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#1A1A1A', border: '0.5px solid #2a2a2a',
          borderRadius: 16, padding: 28,
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: '#111', borderRadius: 10,
            padding: 4, marginBottom: 24, gap: 4,
          }}>
            {[['login', 'Ingresar'], ['register', 'Crear cuenta']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                  fontSize: 13, fontWeight: 500,
                  background: mode === m ? '#F5C000' : 'transparent',
                  color: mode === m ? '#000' : '#666',
                  transition: 'all .2s', cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Role selector (solo en registro) */}
            {mode === 'register' && (
              <div>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Quiero registrarme como</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['PASSENGER', '👤 Pasajero'], ['DRIVER', '🚗 Conductor']].map(([val, label]) => (
                    <button key={val} onClick={() => setForm(f => ({ ...f, role: val }))}
                      style={{
                        flex: 1, padding: '10px', border: `0.5px solid ${form.role === val ? '#F5C000' : '#2a2a2a'}`,
                        borderRadius: 8, background: form.role === val ? '#1e1e00' : 'transparent',
                        color: form.role === val ? '#F5C000' : '#666',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="input-group">
                <label>Nombre completo *</label>
                <input type="text" placeholder="Tu nombre" value={form.name} onChange={set('name')} onKeyDown={handleKey} />
              </div>
            )}

            <div className="input-group">
              <label>Correo electrónico *</label>
              <input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')} onKeyDown={handleKey} />
            </div>

            <div className="input-group">
              <label>Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                  value={form.password} onChange={set('password')} onKeyDown={handleKey}
                  style={{ width: '100%' }}
                />
                <button onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#555', fontSize: 13, padding: 4,
                  }}
                >
                  {showPass ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="input-group">
                <label>Teléfono <span style={{ color: '#555' }}>(opcional)</span></label>
                <input type="tel" placeholder="300 000 0000" value={form.phone} onChange={set('phone')} onKeyDown={handleKey} />
              </div>
            )}

            {error && (
              <div style={{
                padding: '10px 14px', background: 'rgba(239,68,68,.08)',
                border: '0.5px solid rgba(239,68,68,.25)',
                borderRadius: 8, fontSize: 13, color: '#f87171',
              }}>
                {error}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>

            {/* Separador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
              <span style={{ color: '#444', fontSize: 12 }}>o continúa con</span>
              <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
            </div>

            {/* Botón Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: '#fff', color: '#111',
                border: '1px solid #e0e0e0', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              {/* SVG oficial de Google */}
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.6 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l6-6C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/>
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3 0 5.7 1.1 7.8 2.9l6-6C34.5 6.5 29.5 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
                <path fill="#FBBC05" d="M24 44c5.5 0 10.5-1.8 14.3-5l-6.6-5.4C29.7 35.4 27 36 24 36c-5.6 0-10.1-3.3-11.7-8.1l-7 5.4C8.9 40.1 15.9 44 24 44z"/>
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.3-4.3 5.6l6.6 5.4C42 36.2 44.5 30.5 44.5 24c0-1.3-.1-2.7-.2-4z"/>
              </svg>
              Continuar con Google
            </button>

          </div>
        </div>

        {/* Switch link */}
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#555' }}>
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#F5C000', fontSize: 13, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Regístrate gratis' : 'Ingresa aquí'}
          </button>
        </p>
      </div>
    </div>
  );
}
