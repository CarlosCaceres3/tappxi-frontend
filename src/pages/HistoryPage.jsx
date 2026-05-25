// src/pages/HistoryPage.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PassengerHistory from '../components/history/PassengerHistory';
import DriverStats from '../components/history/DriverStats';

export default function HistoryPage() {
  const { user, isDriver } = useAuth();
  const [tab, setTab] = useState(isDriver ? 'stats' : 'history');

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#111' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 24px 8px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
          {isDriver ? 'Mis estadísticas' : 'Mis viajes'}
        </h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
          {isDriver
            ? 'Rendimiento y actividad de tus viajes'
            : 'Historial completo de tus viajes en CabpXi'}
        </p>

        {/* Tabs — solo para conductores que quieran ver historial también */}
        {isDriver && (
          <div style={{
            display: 'flex', background: '#1a1a1a', borderRadius: 10,
            padding: 4, marginBottom: 4, gap: 4,
          }}>
            {[['stats', 'Estadísticas'], ['history', 'Historial']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: tab === key ? '#F5C000' : 'transparent',
                  color: tab === key ? '#000' : '#666',
                  transition: 'all .2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isDriver && tab === 'stats'   && <DriverStats />}
      {isDriver && tab === 'history' && <PassengerHistory />}
      {!isDriver && <PassengerHistory />}
    </div>
  );
}
