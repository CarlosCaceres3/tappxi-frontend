// src/components/driver/TripRequests.jsx
import { useTripDriver } from '../../hooks/useTripDriver';

const TripCard = ({ trip, onAccept, onReject, onStart, onComplete }) => {
  const passenger = trip.profiles;
  const isPending    = trip.status === 'PENDING';
  const isAccepted   = trip.status === 'ACCEPTED';
  const isInProgress = trip.status === 'IN_PROGRESS';

  return (
    <div style={{
      background: '#111', border: `0.5px solid ${isPending ? '#F5C000' : '#2a2a2a'}`,
      borderRadius: 12, padding: 16, marginBottom: 12,
      boxShadow: isPending ? '0 0 0 1px #F5C00020' : 'none',
      transition: 'border-color .2s',
    }}>
      {/* Badge de estado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500,
          background: isPending ? '#1e1e00' : isAccepted ? 'rgba(34,197,94,.1)' : 'rgba(59,130,246,.1)',
          color: isPending ? '#F5C000' : isAccepted ? '#22c55e' : '#3b82f6',
          border: `0.5px solid ${isPending ? '#3a3a00' : isAccepted ? 'rgba(34,197,94,.2)' : 'rgba(59,130,246,.2)'}`,
        }}>
          {isPending ? '⏳ Nueva solicitud' : isAccepted ? '✅ Aceptado' : '🛣️ En curso'}
        </span>
        <span style={{ fontSize: 11, color: '#555' }}>
          {new Date(trip.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Info del pasajero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: '#1e1e1e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 500, color: '#F5C000', flexShrink: 0,
          border: '0.5px solid #2a2a2a',
        }}>
          {passenger?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{passenger?.name || 'Pasajero'}</div>
          {passenger?.phone && (
            <a href={`tel:${passenger.phone}`} style={{ fontSize: 12, color: '#F5C000', marginTop: 2, display: 'block' }}>
              📞 {passenger.phone}
            </a>
          )}
        </div>
      </div>

      {/* Origen */}
      {trip.origin_address && (
        <div style={{
          background: '#1a1a1a', borderRadius: 8, padding: '8px 12px',
          fontSize: 13, color: '#888', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          📍 {trip.origin_address}
        </div>
      )}

      {/* Acciones */}
      {isPending && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onReject(trip.id)} style={{
            flex: 1, padding: '10px', background: 'transparent',
            border: '0.5px solid #333', borderRadius: 8,
            color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            Rechazar
          </button>
          <button onClick={() => onAccept(trip.id)} style={{
            flex: 2, padding: '10px', background: '#F5C000',
            border: 'none', borderRadius: 8,
            color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Aceptar viaje
          </button>
        </div>
      )}

      {isAccepted && (
        <button onClick={() => onStart(trip.id)} style={{
          width: '100%', padding: '11px', background: '#3b82f6',
          border: 'none', borderRadius: 8,
          color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          🛣️ Iniciar viaje
        </button>
      )}

      {isInProgress && (
        <button onClick={() => onComplete(trip.id)} style={{
          width: '100%', padding: '11px', background: '#22c55e',
          border: 'none', borderRadius: 8,
          color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          ✅ Finalizar viaje
        </button>
      )}
    </div>
  );
};

export default function TripRequests() {
  const { trips, loading, pendingTrips, activeTrip, acceptTrip, rejectTrip, startTrip, completeTrip } = useTripDriver();

  if (loading) return (
    <div style={{ padding: 20, textAlign: 'center', color: '#555', fontSize: 13 }}>
      Cargando solicitudes...
    </div>
  );

  const allTrips = [...(activeTrip ? [activeTrip] : []), ...pendingTrips];

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 14, paddingBottom: 12, borderBottom: '0.5px solid #1e1e1e',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Solicitudes de viaje</span>
        {pendingTrips.length > 0 && (
          <span style={{
            width: 20, height: 20, borderRadius: '50%', background: '#F5C000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#000',
          }}>
            {pendingTrips.length}
          </span>
        )}
      </div>

      {allTrips.length === 0 ? (
        <div style={{
          padding: '24px 0', textAlign: 'center',
          color: '#555', fontSize: 13, lineHeight: 1.6,
        }}>
          Sin solicitudes por ahora.<br />
          Actívate como <span style={{ color: '#F5C000' }}>Disponible</span> para recibir viajes.
        </div>
      ) : (
        allTrips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onAccept={acceptTrip}
            onReject={rejectTrip}
            onStart={startTrip}
            onComplete={completeTrip}
          />
        ))
      )}
    </div>
  );
}
