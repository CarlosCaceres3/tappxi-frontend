import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbyTaxis } from '../hooks/useNearbyTaxis';
import TaxiInfoPanel from '../components/map/TaxiInfoPanel';

const TAXI_ICON = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;background:#F5C000;border-radius:50%;border:2.5px solid #111;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.5)">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4v4a2 2 0 0 1-2 2h-1"/>
      <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
    </svg>
  </div>`,
  iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -24],
});

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#3b82f6;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 0 5px rgba(59,130,246,.25)"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.panTo(center, { animate: true, duration: 1 }); }, [center?.lat, center?.lng]);
  return null;
};

const TaxiMarker = ({ taxi, onSelect }) => {
  const markerRef = useRef(null);
  useEffect(() => {
    markerRef.current?.setLatLng([taxi.location.lat, taxi.location.lng]);
  }, [taxi.location]);

  return (
    <Marker ref={markerRef} position={[taxi.location.lat, taxi.location.lng]} icon={TAXI_ICON}
      eventHandlers={{ click: () => onSelect(taxi) }}>
      <Popup>
        <div style={{ minWidth: 170, fontFamily: 'system-ui' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{taxi.name}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{taxi.vehicleModel} · {taxi.vehicleColor}</div>
          <div style={{ fontSize: 13, color: '#F5C000', marginBottom: 8 }}>
            {'★'.repeat(Math.round(taxi.averageRating))}{'☆'.repeat(5 - Math.round(taxi.averageRating))}
            <span style={{ color: '#888', marginLeft: 4 }}>{taxi.averageRating?.toFixed(1)}</span>
          </div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>A {taxi.distanceKm} km de ti</div>
          <button onClick={() => onSelect(taxi)} style={{
            width: '100%', padding: '8px', background: '#F5C000', border: 'none',
            borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#000',
          }}>Ver perfil</button>
        </div>
      </Popup>
    </Marker>
  );
};

export default function MapPage() {
  const { position, loading: geoLoading } = useGeolocation();
  const { taxis, loading, error, refetch } = useNearbyTaxis(position);
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Barra superior flotante */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 500, display: 'flex', alignItems: 'center', gap: 10,
        background: '#1A1A1A', border: '0.5px solid #2a2a2a',
        borderRadius: 999, padding: '9px 20px',
        boxShadow: '0 4px 24px rgba(0,0,0,.5)',
      }}>
        {geoLoading || loading ? (
          <span style={{ fontSize: 13, color: '#888' }}>Localizando taxis...</span>
        ) : error ? (
          <span style={{ fontSize: 13, color: '#ef4444' }}>{error}</span>
        ) : (
          <>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: taxis.length > 0 ? '#22c55e' : '#888', flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: '#F0F0F0' }}>
              {taxis.length} taxi{taxis.length !== 1 ? 's' : ''} cercano{taxis.length !== 1 ? 's' : ''}
            </span>
            <span style={{ color: '#333', fontSize: 13 }}>·</span>
            <span style={{ fontSize: 13, color: '#666' }}>Radio 2 km</span>
            <button onClick={refetch} style={{
              background: 'none', border: 'none', color: '#F5C000',
              fontSize: 16, cursor: 'pointer', padding: '0 2px', lineHeight: 1,
            }} title="Actualizar">↻</button>
          </>
        )}
      </div>

      {/* Mapa */}
      {position ? (
        <MapContainer center={[position.lat, position.lng]} zoom={15}
          style={{ flex: 1, height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <MapController center={position} />
          <Marker position={[position.lat, position.lng]} icon={USER_ICON}>
            <Popup><span style={{ fontFamily: 'system-ui', fontSize: 13 }}>Tu ubicación</span></Popup>
          </Marker>
          <Circle center={[position.lat, position.lng]} radius={2000}
            pathOptions={{ color: '#F5C000', fillColor: '#F5C000', fillOpacity: .04, weight: 1 }} />
          {taxis.map(taxi => (
            <TaxiMarker key={taxi.id} taxi={taxi} onSelect={setSelected} />
          ))}
        </MapContainer>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a2535', color: '#888' }}>
          Obteniendo tu ubicación...
        </div>
      )}

      {/* Panel lateral */}
      {selected && (
        <TaxiInfoPanel taxi={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
