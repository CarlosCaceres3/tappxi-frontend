// src/components/trip/TripRequest.jsx
import { useState } from 'react';

const STATUS_INFO = {
  PENDING:     { label: 'Esperando al conductor...',  color: '#F5C000', icon: '⏳' },
  ACCEPTED:    { label: '¡Conductor en camino!',       color: '#22c55e', icon: '🚕' },
  REJECTED:    { label: 'El conductor no está disponible', color: '#ef4444', icon: '❌' },
  IN_PROGRESS: { label: 'Viaje en curso',              color: '#3b82f6', icon: '🛣️' },
  COMPLETED:   { label: '¡Viaje completado!',          color: '#22c55e', icon: '✅' },
};

// Botón para solicitar — aparece en el TaxiInfoPanel
export const RequestTripButton = ({ taxi, position, onRequest, disabled }) => {
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      await onRequest({
        driverId:      taxi.id,
        originLat:     position?.lat,
        originLng:     position?.lng,
        originAddress: 'Mi ubicación actual',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRequest}
      disabled={loading || disabled}
      style={{
        width: '100%', padding: '13px',
        background: disabled ? '#1e1e1e' : '#F5C000',
        border: `0.5px solid ${disabled ? '#2a2a2a' : '#F5C000'}`,
        borderRadius: 10, fontWeight: 600, fontSize: 15,
        color: disabled ? '#555' : '#000',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .15s',
      }}
    >
      {loading ? 'Solicitando...' : disabled ? 'Ya tienes un viaje activo' : '🚕 Solicitar este taxi'}
    </button>
  );
};

// Panel flotante que muestra el estado del viaje activo
export const ActiveTripPanel = ({ trip, onCancel }) => {
  if (!trip) return null;

  const info = STATUS_INFO[trip.status] || STATUS_INFO.PENDING;
  const driver = trip.drivers;
  const canCancel = trip.status === 'PENDING';

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      width: 'min(400px, calc(100vw - 48px))',
      background: '#1A1A1A', border: `0.5px solid ${info.color}40`,
      borderRadius: 16, padding: 20,
      boxShadow: `0 8px 32px rgba(0,0,0,.6), 0 0 0 1px ${info.color}20`,
      zIndex: 800,
    }}>
      {/* Estado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 24 }}>{info.icon}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: info.color }}>
            {info.label}
          </div>
          {trip.status === 'PENDING' && (
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
              El conductor tiene 60 segundos para responder
            </div>
          )}
        </div>
      </div>

      {/* Info del conductor (si aceptó) */}
      {driver && (trip.status === 'ACCEPTED' || trip.status === 'IN_PROGRESS') && (
        <div style={{
          background: '#111', borderRadius: 10, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#F5C000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 500, color: '#000', flexShrink: 0,
          }}>
            {driver.profiles?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{driver.profiles?.name}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
              {driver.vehicle_model} · <span style={{ color: '#F5C000' }}>{driver.vehicle_plate}</span>
            </div>
            {driver.profiles?.phone && (
              <a href={`tel:${driver.profiles.phone}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginTop: 6, fontSize: 12, color: '#F5C000',
              }}>
                📞 {driver.profiles.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Progreso del viaje */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        {['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map((s, i, arr) => {
          const active = s === trip.status;
          const done   = arr.indexOf(trip.status) > i;
          return (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', height: 3, borderRadius: 2,
                background: done || active ? '#F5C000' : '#2a2a2a',
                transition: 'background .3s',
              }} />
              <span style={{
                fontSize: 10, color: active ? '#F5C000' : done ? '#888' : '#333',
                transition: 'color .3s',
              }}>
                {['Solicitado', 'Aceptado', 'En curso', 'Listo'][i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Acción */}
      {canCancel && (
        <button onClick={onCancel} style={{
          width: '100%', padding: '10px', background: 'transparent',
          border: '0.5px solid #333', borderRadius: 8,
          color: '#888', fontSize: 13, cursor: 'pointer',
        }}>
          Cancelar solicitud
        </button>
      )}

      {trip.status === 'COMPLETED' && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#22c55e' }}>
          ¡Gracias por usar Tappxi! Recuerda calificar al conductor.
        </div>
      )}

      {trip.status === 'REJECTED' && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
          Intenta con otro conductor cercano.
        </div>
      )}
    </div>
  );
};
