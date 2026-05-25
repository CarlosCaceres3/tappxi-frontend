// src/components/history/DriverStats.jsx
import { useDriverHistory } from '../../hooks/useHistory';

const formatDate = (ts) => new Date(ts).toLocaleDateString('es-CO', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});

export default function DriverStats() {
  const { trips, driver, loading, stats } = useDriverHistory();

  if (loading) return (
    <div style={{ padding: 32, textAlign: 'center', color: '#555' }}>Cargando estadísticas...</div>
  );

  if (!driver) return (
    <div style={{ padding: 32, textAlign: 'center', color: '#555' }}>
      <p>Completa tu perfil de conductor para ver estadísticas</p>
    </div>
  );

  const { total, avgRating, weekData, maxCount, ratingDist, maxRating } = stats;

  return (
    <div style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>

      {/* Stats principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { val: total, lbl: 'Viajes totales' },
          { val: avgRating, lbl: 'Calificación' },
          { val: driver?.total_ratings || 0, lbl: 'Reseñas' },
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

      {/* Viajes por día */}
      <div style={{
        background: '#1A1A1A', border: '0.5px solid #2a2a2a',
        borderRadius: 14, padding: 18, marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
          Viajes últimos 7 días
        </div>
        {weekData.map(({ label, count }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#888', width: 28, textAlign: 'right', flexShrink: 0 }}>
              {label}
            </span>
            <div style={{
              flex: 1, background: '#111', borderRadius: 999, height: 8, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: count > 0 ? '#F5C000' : 'transparent',
                borderRadius: 999,
                width: `${(count / maxCount) * 100}%`,
                transition: 'width .4s',
              }} />
            </div>
            <span style={{ fontSize: 12, color: count > 0 ? '#F0F0F0' : '#555', width: 16, flexShrink: 0 }}>
              {count}
            </span>
          </div>
        ))}
        {weekData.every(d => d.count === 0) && (
          <p style={{ fontSize: 13, color: '#555', textAlign: 'center', padding: '8px 0' }}>
            Sin viajes esta semana
          </p>
        )}
      </div>

      {/* Distribución de calificaciones */}
      <div style={{
        background: '#1A1A1A', border: '0.5px solid #2a2a2a',
        borderRadius: 14, padding: 18, marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
          Distribución de calificaciones
        </div>
        {ratingDist.map(({ star, count }) => (
          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#F5C000', width: 24, textAlign: 'right', flexShrink: 0 }}>
              {star}★
            </span>
            <div style={{ flex: 1, background: '#111', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: count > 0 ? '#F5C000' : 'transparent',
                borderRadius: 999,
                width: `${(count / maxRating) * 100}%`,
                transition: 'width .4s',
              }} />
            </div>
            <span style={{ fontSize: 12, color: count > 0 ? '#F0F0F0' : '#555', width: 16, flexShrink: 0 }}>
              {count}
            </span>
          </div>
        ))}
        {ratingDist.every(r => r.count === 0) && (
          <p style={{ fontSize: 13, color: '#555', textAlign: 'center', padding: '8px 0' }}>
            Aún no tienes calificaciones
          </p>
        )}
      </div>

      {/* Últimos viajes */}
      {trips.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
            Últimos viajes
          </div>
          {trips.slice(0, 5).map(trip => (
            <div key={trip.id} style={{
              background: '#1A1A1A', border: '0.5px solid #2a2a2a',
              borderRadius: 12, padding: 14, marginBottom: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {trip.profiles?.name || 'Pasajero'}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {formatDate(trip.created_at)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {trip.ratings?.[0] ? (
                  <span style={{ fontSize: 13, color: '#F5C000' }}>
                    {'★'.repeat(trip.ratings[0].score)}
                    <span style={{ color: '#2a2a2a' }}>{'★'.repeat(5 - trip.ratings[0].score)}</span>
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: '#555' }}>Sin calificar</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
