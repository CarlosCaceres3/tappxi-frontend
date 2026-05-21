import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [params] = useSearchParams();
  const defaultRole = params.get('role') || 'PASSENGER';
  const defaultMode = params.get('mode') === 'login' ? 'login' : 'register';

  const [mode, setMode] = useState(defaultMode);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: defaultRole });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/map'); }, [user]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

const handleSubmit = async () => {
  setError('');
  setLoading(true);
  try {
    console.log('Intentando login con:', form.email);
    const result = await login(form.email, form.password);
    console.log('Login result:', result);
    navigate('/map');
  } catch (err) {
    console.log('Login error:', err);
    setError(err.message || 'Error de autenticación');
    setLoading(false);
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
              Tapp<span style={{ color: '#F5C000' }}>xi</span>
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
