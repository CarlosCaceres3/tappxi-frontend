// src/components/history/PassengerHistory.jsx
import { useState } from 'react';
import { usePassengerHistory } from '../../hooks/useHistory';
import { taxiAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import RatingForm from '../driver/RatingForm';

const Stars = ({ value }) => (
  <span style={{ fontSize: 13, letterSpacing: 1 }}>
    {'★'.repeat(value).split('').map((s, i) => (
      <span key={i} style={{ color: '#F5C000' }}>★</span>
    ))}
    {'★'.repeat(5 - value).split('').map((s, i) => (
      <span key={i} style={{ color: '#2a2a2a' }}>★</span>
    ))}
  </span>
);

const formatDate = (ts) => new Date(ts).toLocaleDateString('es-CO', {
  day: 'numeric', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

const TripCard = ({ trip, onRated }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [rated, setRated]       = useState(false);

  const driver  = trip.drivers;
  const rating  = trip.ratings?.[0];
  const hasRating = !!rating || rated;

  const handleRate = async ({ score, comment }) => {
    await taxiAPI.rateDriver({
      raterId:  user.id,
      driverId: driver.id,
      tripId:   trip.id,
      score,
      comment,
    });
    setShowForm(false);
    setRated(true);
    onRated?.();
  };

  return (
    <div style={{
      background: '#1A1A1A', border: '0.5px solid #2a2a2a',
      borderRadius: 14, padding: 16, marginBottom: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', background: '#F5C000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 600, color: '#000', flexShrink: 0,
          }}>
            {driver?.profiles?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{driver?.profiles?.name}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              {driver?.vehicle_model} · <span style={{ color: '#F5C000' }}>{driver?.vehicle_plate}</span>
            </div>
          </div>
        </div>
        <span style={{
          padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500,
          background: 'rgba(34,197,94,.1)', color: '#22c55e',
        }}>
          Completado
        </span>
      </div>

      {/* Origen */}
      {trip.origin_address && (
        <div style={{
          fontSize: 12, color: '#888', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          📍 {trip.origin_address}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 10, borderTop: '0.5px solid #242424',
      }}>
        <span style={{ fontSize: 12, color: '#555' }}>{formatDate(trip.created_at)}</span>

        {hasRating ? (
          <Stars value={rating?.score || 5} />
        ) : (
          <button onClick={() => setShowForm(s => !s)} style={{
            padding: '5px 12px', background: '#1e1e00',
            border: '0.5px solid #3a3a00', borderRadius: 6,
            color: '#F5C000', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>
            ⭐ Calificar viaje
          </button>
        )}
      </div>

      {/* Formulario inline */}
      {showForm && (
        <div style={{ marginTop: 12 }}>
          <RatingForm onSubmit={handleRate} onCancel={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
};

export default function PassengerHistory() {
  const { trips, loading, unrated, avgGiven, total, reload } = usePassengerHistory();

  if (loading) return (
    <div style={{ padding: 32, textAlign: 'center', color: '#555' }}>Cargando historial...</div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { val: total, lbl: 'Viajes totales' },
          { val: avgGiven, lbl: 'Promedio dado' },
          { val: unrated, lbl: 'Sin calificar' },
        ].map(s => (
          <div key={s.lbl} style={{
            background: '#1A1A1A', border: '0.5px solid #2a2a2a',
            borderRadius: 12, padding: 14, textAlign: 'center',
          }}>
            <div style={{ fontSize: 26, fontWeight: 500, color: '#F5C000' }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Lista */}
      {trips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚕</div>
          <p style={{ fontSize: 14 }}>Aún no tienes viajes completados</p>
          <p style={{ fontSize: 13, color: '#444', marginTop: 6 }}>
            Solicita tu primer taxi desde el mapa
          </p>
        </div>
      ) : (
        trips.map(trip => (
          <TripCard key={trip.id} trip={trip} onRated={reload} />
        ))
      )}
    </div>
  );
}
