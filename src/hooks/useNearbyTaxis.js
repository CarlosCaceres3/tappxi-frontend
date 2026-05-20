import { useState, useEffect, useCallback, useRef } from 'react';
import { taxiAPI, realtimeAPI } from '../services/api';

export const useNearbyTaxis = (position, radiusKm = 2) => {
  const [taxis, setTaxis]     = useState({});   // map: driverId → taxiData
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const posRef = useRef(position);
  posRef.current = position;

  // Carga inicial desde Supabase
  const fetchNearby = useCallback(async () => {
    if (!posRef.current) return;
    setLoading(true);
    try {
      const list = await taxiAPI.getNearby({
        lat: posRef.current.lat,
        lng: posRef.current.lng,
        radiusKm,
      });
      const map = {};
      list.forEach((t) => { map[t.id] = t; });
      setTaxis(map);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los taxis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [radiusKm]);

  // Cargar cuando llega la posición
  useEffect(() => {
    if (position) fetchNearby();
  }, [position?.lat, position?.lng, fetchNearby]);

  // Escuchar cambios en tiempo real con Supabase Realtime
  useEffect(() => {
    const unsub = realtimeAPI.subscribeToLocations(
      // Taxi actualizó ubicación
      async (newLoc) => {
        const driverId = newLoc.driver_id;
        setTaxis((prev) => {
          // Si ya lo teníamos en el mapa, solo actualizamos coordenadas
          if (prev[driverId]) {
            return {
              ...prev,
              [driverId]: {
                ...prev[driverId],
                location: {
                  lat: Number(newLoc.lat),
                  lng: Number(newLoc.lng),
                },
              },
            };
          }
          // Si es nuevo, refrescar toda la lista para obtener su perfil
          fetchNearby();
          return prev;
        });
      },
      // Taxi se fue OFFLINE (eliminó su fila de driver_locations)
      (driverId) => {
        setTaxis((prev) => {
          const next = { ...prev };
          delete next[driverId];
          return next;
        });
      }
    );

    return unsub;
  }, [fetchNearby]);

  return {
    taxis:   Object.values(taxis),
    loading,
    error,
    refetch: fetchNearby,
  };
};
