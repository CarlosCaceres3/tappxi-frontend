// src/components/map/TaxiInfoPanel.jsx
import { useState, useEffect } from 'react';
import { driverAPI, taxiAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import RatingForm from '../driver/RatingForm';
import { RequestTripButton } from '../trip/TripRequest';

const Stars = ({ value, size = 16 }) => (
  <span style={{ fontSize: size, letterSpacing: 1 }}>
    <span style={{ color: '#F5C000' }}>{'★'.repeat(Math.round(value))}</span>
    <span style={{ color: '#333' }}>{'★'.repeat(5 - Math.round(value))}</span>
  </span>
);

const PayBadge = ({ type }) => {
  const labels = { cash: 'Efectivo', nequi: 'Nequi', daviplata: 'Daviplata', card: 'Tarjeta', bancolombia: 'Bancolombia' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      background: '#1e1e00', border: '0.5px solid #3a3a00',
      borderRadius: 999, fontSize: 12, color: '#F5C000', margin: '2px 4px 2px 0',
    }}>
      {labels[type] || type}
    </span>
  );
};

export default function TaxiInfoPanel({ taxi, position, activeTrip, onRequestTrip, onClose }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    setLoading(true); setShowRating(false); setRated(false);
    driverAPI.getProfile(taxi.id)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [taxi.id]);

  const handleRate = async ({ score, comment }) => {
    await taxiAPI.rateDriver({ raterId: user.id, driverId: taxi.id, score, comment });
    setShowRating(false);
    setRated(true);
  };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 320,
      background: '#1A1A1A', borderLeft: '0.5px solid #2a2a2a',
      zIndex: 600, display: 'flex', flexDirection: 'column',
      boxShadow: '-8px 0 32px rgba(0,0,0,.6)', overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '0.5px solid #242424' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 11, color: '#F5C000', letterSpacing: 1.5, fontWeight: 500, textTransform: 'uppercase' }}>
            Conductor
          </span>
          <button onClick={onClose} style={{
            background: '#242424', border: '0.5px solid #333', borderRadius: 6,
            color: '#888', fontSize: 18, width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: loading ? '#242424' : '#F5C000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 500, color: '#000', flexShrink: 0, overflow: 'hidden',
          }}>
            {loading ? '…'
              : profile?.photo_url
                ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : profile?.profiles?.name?.[0]?.toUpperCase()
            }
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 500 }}>
              {loading ? '—' : profile?.profiles?.name}
            </div>
            {!loading && profile && (
              <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stars value={profile.avg_rating} size={14} />
                <span style={{ fontSize: 12, color: '#888' }}>
                  {Number(profile.avg_rating).toFixed(1)} · {profile.total_ratings} viajes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 13 }}>
          Cargando perfil...
        </div>
      )}

      {!loading && profile && (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Vehículo */}
          <div style={{ background: '#111', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Vehículo</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{profile.vehicle_model}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 3 }}>
              {profile.vehicle_color} · <span style={{ color: '#F5C000' }}>{profile.vehicle_plate}</span>
            </div>
          </div>

          {/* Distancia */}
          <div style={{ background: '#111', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 26 }}>📍</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#F5C000' }}>{taxi.distanceKm} km</div>
              <div style={{ fontSize: 12, color: '#888' }}>de tu ubicación</div>
            </div>
          </div>

          {/* BOTÓN SOLICITAR VIAJE */}
          <RequestTripButton
            taxi={taxi}
            position={position}
            onRequest={onRequestTrip}
            disabled={!!activeTrip}
          />

          {/* Pagos */}
          <div>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Acepta</div>
            {profile.payment_methods?.filter(m => m.is_active).length > 0
              ? profile.payment_methods.filter(m => m.is_active).map((m, i) => <PayBadge key={i} type={m.type} />)
              : <span style={{ fontSize: 13, color: '#555' }}>No especificado</span>}
          </div>

          {/* Contacto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.profiles?.phone && (
              <a href={`tel:${profile.profiles.phone}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: 12, background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 10,
                color: '#888', fontSize: 14,
              }}>
                📞 Llamar al conductor
              </a>
            )}
            {profile.profiles?.phone && (
              <a href={`https://wa.me/57${profile.profiles.phone.replace(/\D/g,'')}`}
                target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: 12, background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 10,
                color: '#888', fontSize: 14,
              }}>
                💬 WhatsApp
              </a>
            )}
          </div>

          {/* Reseñas */}
          {profile.ratings?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Últimas reseñas
              </div>
              {profile.ratings.slice(0, 3).map((r, i) => (
                <div key={i} style={{ background: '#111', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{r.profiles?.name}</span>
                    <Stars value={r.score} size={13} />
                  </div>
                  {r.comment && <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Calificar */}
          {!rated && !showRating && (
            <button className="btn btn-ghost" onClick={() => setShowRating(true)} style={{ width: '100%' }}>
              ⭐ Calificar conductor
            </button>
          )}
          {showRating && (
            <RatingForm onSubmit={handleRate} onCancel={() => setShowRating(false)} />
          )}
          {rated && (
            <div style={{
              padding: 14, background: 'rgba(34,197,94,.08)',
              border: '0.5px solid rgba(34,197,94,.2)',
              borderRadius: 10, textAlign: 'center', color: '#22c55e', fontSize: 14,
            }}>
              ✅ Calificación enviada
            </div>
          )}
        </div>
      )}
    </div>
  );
}
