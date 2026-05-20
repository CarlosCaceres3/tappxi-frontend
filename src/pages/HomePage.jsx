import { Link } from 'react-router-dom';

const TaxiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4v4a2 2 0 0 1-2 2h-1"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
);

const features = [
  { icon: '🗺️', title: 'Mapa en vivo', desc: 'Ve exactamente dónde están los taxis disponibles cerca de ti en tiempo real.' },
  { icon: '✅', title: 'Conductores verificados', desc: 'Cada conductor pasa por verificación de licencia y datos del vehículo.' },
  { icon: '💳', title: 'Pagos flexibles', desc: 'Efectivo, Nequi, Daviplata, tarjeta. El conductor define lo que acepta.' },
  { icon: '⭐', title: 'Sistema de calificaciones', desc: 'Califica tu experiencia y elige conductores con mejor reputación.' },
  { icon: '📞', title: 'Contacto directo', desc: 'Llama o escribe por WhatsApp al conductor directamente desde la app.' },
  { icon: '🕐', title: 'Disponible 24/7', desc: 'Taxis disponibles a cualquier hora del día, todos los días del año.' },
];

const stats = [
  { value: '+1.200', label: 'Conductores activos' },
  { value: '4.8 ★', label: 'Calificación promedio' },
  { value: '24/7', label: 'Disponibilidad' },
  { value: '<3 min', label: 'Tiempo de llegada' },
];

const S = {
  page: { background: '#111', color: '#F0F0F0', minHeight: '100vh' },
  section: { padding: '72px 32px', borderBottom: '0.5px solid #1e1e1e', maxWidth: 1100, margin: '0 auto' },
  sectionFull: { padding: '72px 32px', borderBottom: '0.5px solid #1e1e1e' },
};

export default function HomePage() {
  return (
    <div style={S.page}>

      {/* ── HERO ────────────────────────────────────── */}
      <section style={{ ...S.sectionFull, textAlign: 'center', padding: '90px 32px 72px', borderBottom: '0.5px solid #1e1e1e' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', background: '#1e1e00',
            border: '0.5px solid #3a3a00', borderRadius: 999,
            fontSize: 12, color: '#F5C000', marginBottom: 28,
          }}>
            📍 Taxis verificados en tiempo real
          </span>

          <h1 style={{ fontSize: 56, fontWeight: 500, lineHeight: 1.08, letterSpacing: -2, marginBottom: 20 }}>
            Tu taxi,{' '}
            <span style={{ color: '#F5C000' }}>cuando lo necesitas</span>
          </h1>

          <p style={{ fontSize: 18, color: '#888', maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Encuentra conductores verificados cerca de ti, ve su ubicación en vivo y paga como prefieras.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Buscar taxi ahora
            </Link>
            <Link to="/register?role=DRIVER" className="btn btn-ghost btn-lg">
              Soy conductor
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 48,
            marginTop: 64, paddingTop: 40,
            borderTop: '0.5px solid #1e1e1e', flexWrap: 'wrap',
          }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 28, fontWeight: 500, color: '#F5C000' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section style={S.sectionFull}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="section-label">Por qué Tappxi</p>
          <p className="section-title">Todo lo que necesitas, en una app</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1px',
            background: '#1e1e1e',
            border: '0.5px solid #1e1e1e',
            borderRadius: 14, overflow: 'hidden',
          }}>
            {features.map((f) => (
              <div key={f.title} style={{
                padding: '28px 24px', background: '#1A1A1A',
                transition: 'background .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#1e1e1e'}
                onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}
              >
                <div style={{
                  width: 40, height: 40, background: '#1e1e00',
                  border: '0.5px solid #3a3a00', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, fontSize: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ───────────────────────────────────── */}
      <section style={S.sectionFull}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="section-label">Dos perfiles</p>
          <p className="section-title">Elige cómo usar Tappxi</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Pasajero */}
            <div style={{
              background: '#1A1A1A', border: '0.5px solid #2a2a2a',
              borderRadius: 14, padding: 32,
              transition: 'border-color .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3a3a00'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
            >
              <span className="badge badge-yellow" style={{ marginBottom: 16 }}>👤 Pasajero</span>
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Encuentra tu taxi</h3>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 20 }}>
                Ve los taxis disponibles en el mapa, revisa el perfil del conductor y contáctalo en segundos.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Mapa interactivo con taxis cercanos', 'Perfil completo del conductor', 'Contacto por llamada o WhatsApp', 'Califica tu experiencia'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#aaa' }}>
                    <span style={{ color: '#F5C000', flexShrink: 0 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 24, fontSize: 13, fontWeight: 500, color: '#F5C000',
              }}>
                Empezar como pasajero →
              </Link>
            </div>

            {/* Conductor */}
            <div style={{
              background: '#1A1A1A',
              border: '0.5px solid #2a2a2a',
              borderLeft: '3px solid #F5C000',
              borderRadius: '0 14px 14px 0',
              padding: 32,
              transition: 'border-right-color .2s, border-top-color .2s, border-bottom-color .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderRightColor = '#3a3a00'; e.currentTarget.style.borderTopColor = '#3a3a00'; e.currentTarget.style.borderBottomColor = '#3a3a00'; }}
              onMouseLeave={e => { e.currentTarget.style.borderRightColor = '#2a2a2a'; e.currentTarget.style.borderTopColor = '#2a2a2a'; e.currentTarget.style.borderBottomColor = '#2a2a2a'; }}
            >
              <span className="badge badge-yellow" style={{ marginBottom: 16 }}>🚗 Conductor</span>
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Gestiona tu servicio</h3>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 20 }}>
                Activa tu disponibilidad, define tus métodos de pago y construye tu reputación con cada viaje.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Panel de estado en tiempo real', 'Gestiona tus métodos de pago', 'Ve tus calificaciones y reseñas', 'Visibilidad en el mapa cuando estás activo'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#aaa' }}>
                    <span style={{ color: '#F5C000', flexShrink: 0 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register?role=DRIVER" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 24, fontSize: 13, fontWeight: 500, color: '#F5C000',
              }}>
                Registrarme como conductor →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────── */}
      <section style={{ padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: -.5, marginBottom: 14 }}>
            Listo para moverte con <span style={{ color: '#F5C000' }}>Tappxi</span>?
          </h2>
          <p style={{ color: '#888', fontSize: 15, marginBottom: 32 }}>
            Crea tu cuenta gratis en menos de un minuto.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{
        borderTop: '0.5px solid #1e1e1e',
        padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: '#F5C000', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#000', fontSize: 12 }}><TaxiIcon /></div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Tapp<span style={{ color: '#F5C000' }}>xi</span></span>
          <span style={{ fontSize: 12, color: '#555', marginLeft: 8 }}>© 2025</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Términos', 'Privacidad', 'Contacto'].map(l => (
            <span key={l} style={{ fontSize: 12, color: '#555', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
