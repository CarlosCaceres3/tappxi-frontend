// src/components/ui/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const Navbar = () => {
  const { user, logout, isDriver } = useAuth();
  const { connected } = useSocket() || {};
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLink = (to, label) => (
    <Link to={to} style={{
      padding: '7px 14px', borderRadius: 8, fontSize: 13, color: '#888',
      background: location.pathname === to ? '#1a1a1a' : 'transparent',
      textDecoration: 'none', transition: 'background .15s',
    }}>
      {label}
    </Link>
  );

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 60,
      background: '#111', borderBottom: '0.5px solid #1e1e1e',
      flexShrink: 0, zIndex: 200,
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, background: '#F5C000',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4v4a2 2 0 0 1-2 2h-1"/>
            <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#F0F0F0', letterSpacing: '-.3px' }}>
          Cabp<span style={{ color: '#F5C000' }}>Xi</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {!user ? (
          <>
            <Link to="/login" style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13,
              color: '#F0F0F0', border: '0.5px solid #2a2a2a', background: 'transparent', textDecoration: 'none',
            }}>Ingresar</Link>
            <Link to="/register" style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13,
              fontWeight: 500, background: '#F5C000', color: '#000',
              marginLeft: 4, textDecoration: 'none',
            }}>Registrarse</Link>
          </>
        ) : (
          <>
            {connected !== undefined && (
              <span style={{
                fontSize: 11, padding: '3px 9px', borderRadius: 999, marginRight: 6,
                color: connected ? '#22c55e' : '#888',
                background: connected ? 'rgba(34,197,94,.1)' : 'rgba(255,255,255,.05)',
              }}>
                ● {connected ? 'En vivo' : 'Reconectando'}
              </span>
            )}

            {navLink('/map', 'Mapa')}
            {navLink('/history', isDriver ? 'Estadísticas' : 'Mis viajes')}
            {isDriver && navLink('/driver', 'Mi panel')}

            {/* Avatar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', background: '#1a1a1a',
              border: '0.5px solid #2a2a2a', borderRadius: 8, marginLeft: 6, fontSize: 13,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#F5C000', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#000',
              }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ color: '#aaa', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
            </div>

            <button onClick={handleLogout} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 13,
              background: 'transparent', border: '0.5px solid #2a2a2a',
              color: '#888', marginLeft: 4, cursor: 'pointer',
            }}>
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
