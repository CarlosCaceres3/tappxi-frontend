import { useState, useEffect, useRef } from 'react';
import { driverAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STATUS = {
  AVAILABLE: { label: 'Disponible', color: '#22c55e', bg: 'rgba(34,197,94,.1)', border: 'rgba(34,197,94,.2)' },
  BUSY:      { label: 'Ocupado',    color: '#F5C000', bg: '#1e1e00',             border: '#3a3a00' },
  OFFLINE:   { label: 'Offline',    color: '#555',    bg: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.08)' },
};

const PAYMENTS = [
  { value: 'cash',        label: '💵 Efectivo' },
  { value: 'nequi',       label: '📱 Nequi' },
  { value: 'daviplata',   label: '📲 Daviplata' },
  { value: 'card',        label: '💳 Tarjeta' },
  { value: 'bancolombia', label: '🏦 Bancolombia' },
];

export default function DriverPanel() {
  const { user } = useAuth();
  const [driver, setDriver]               = useState(null);
  const [loading, setLoading]             = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [newType, setNewType]             = useState('cash');
  const [addingPayment, setAddingPayment] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => { loadDriver(); }, [user?.id]);

  // Emitir GPS cuando está AVAILABLE
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (driver?.status === 'AVAILABLE') {
      const broadcast = () => {
        navigator.geolocation?.getCurrentPosition(({ coords }) => {
          driverAPI.updateLocation(driver.id, {
            lat: coords.latitude,
            lng: coords.longitude,
          });
        });
      };
      broadcast(); // inmediato
      intervalRef.current = setInterval(broadcast, 8000); // cada 8 seg
    } else if (driver?.status === 'OFFLINE' && driver?.id) {
      // Eliminar del mapa al ponerse OFFLINE
      driverAPI.removeLocation(driver.id);
    }
    return () => clearInterval(intervalRef.current);
  }, [driver?.status, driver?.id]);

  const loadDriver = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await driverAPI.getMyDriver(user.id);
      setDriver(data);
    } catch { setDriver(null); }
    finally { setLoading(false); }
  };

  const changeStatus = async (s) => {
    if (!driver) return;
    setUpdatingStatus(s);
    try {
      await driverAPI.updateStatus(driver.id, s);
      setDriver((d) => ({ ...d, status: s }));
    } finally { setUpdatingStatus(null); }
  };

  const addPayment = async () => {
    if (!driver) return;
    setAddingPayment(true);
    try {
      await driverAPI.addPaymentMethod(driver.id, newType);
      await loadDriver();
    } finally { setAddingPayment(false); }
  };

  const removePayment = async (id) => {
    await driverAPI.removePaymentMethod(id);
    await loadDriver();
  };

  if (loading) return (
    <div style={{ padding: 32, textAlign: 'center', color: '#555' }}>Cargando panel...</div>
  );

  if (!driver) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🚗</div>
      <p style={{ color: '#888', marginBottom: 16 }}>Aún no tienes perfil de conductor</p>
      <p style={{ color: '#555', fontSize: 13 }}>
        Próximamente: formulario para crear tu perfil de conductor.
      </p>
    </div>
  );

  const s = STATUS[driver.status] || STATUS.OFFLINE;

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Bienvenida */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '0.5px solid #1e1e1e' }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: '#F5C000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 500, color: '#000',
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 16 }}>Hola, {user?.name?.split(' ')[0]}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
            {driver.vehicle_model} · {driver.vehicle_plate}
          </div>
        </div>
      </div>

      {/* Estado */}
      <div style={{ background: '#1A1A1A', border: '0.5px solid #2a2a2a', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Mi estado</span>
          <span style={{
            padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            color: s.color, background: s.bg, border: `0.5px solid ${s.border}`,
          }}>
            ● {s.label}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(STATUS).map(([key, cfg]) => (
            <button key={key} onClick={() => changeStatus(key)}
              disabled={!!updatingStatus || driver.status === key}
              style={{
                flex: 1, padding: '10px 6px',
                border: `0.5px solid ${driver.status === key ? cfg.color : '#2a2a2a'}`,
                borderRadius: 8,
                background: driver.status === key ? cfg.bg : 'transparent',
                color: driver.status === key ? cfg.color : '#555',
                fontSize: 12, fontWeight: 500, cursor: driver.status === key ? 'default' : 'pointer',
                transition: 'all .15s',
                opacity: updatingStatus && updatingStatus !== key ? .5 : 1,
              }}
            >
              {updatingStatus === key ? '...' : cfg.label}
            </button>
          ))}
        </div>

        {driver.status === 'AVAILABLE' && (
          <div style={{ marginTop: 12, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Transmitiendo ubicación en tiempo real
          </div>
        )}
      </div>

      {/* Calificación */}
      <div style={{ background: '#1A1A1A', border: '0.5px solid #2a2a2a', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Mi calificación</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: 48, fontWeight: 500, color: '#F5C000', lineHeight: 1 }}>
            {Number(driver.avg_rating).toFixed(1)}
          </span>
          <div>
            <div style={{ fontSize: 22, letterSpacing: 2 }}>
              <span style={{ color: '#F5C000' }}>{'★'.repeat(Math.round(driver.avg_rating))}</span>
              <span style={{ color: '#333' }}>{'★'.repeat(5 - Math.round(driver.avg_rating))}</span>
            </div>
            <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{driver.total_ratings} calificaciones</div>
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div style={{ background: '#1A1A1A', border: '0.5px solid #2a2a2a', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Métodos de pago</div>

        {(!driver.payment_methods || driver.payment_methods.length === 0) && (
          <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>No has agregado métodos aún</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {driver.payment_methods?.filter(m => m.is_active).map((m) => (
            <div key={m.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', background: '#111', borderRadius: 8,
            }}>
              <span style={{ fontSize: 14 }}>
                {PAYMENTS.find(p => p.value === m.type)?.label || m.type}
              </span>
              <button onClick={() => removePayment(m.id)} style={{
                background: 'none', border: 'none', color: '#444',
                fontSize: 18, cursor: 'pointer', lineHeight: 1,
              }}>×</button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <select value={newType} onChange={e => setNewType(e.target.value)}
            style={{
              flex: 1, background: '#111', border: '0.5px solid #2a2a2a',
              borderRadius: 8, padding: '9px 12px', color: '#F0F0F0',
              fontSize: 13, outline: 'none',
            }}>
            {PAYMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button className="btn btn-primary" onClick={addPayment} disabled={addingPayment}
            style={{ padding: '9px 16px', fontSize: 13 }}>
            {addingPayment ? '...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}
