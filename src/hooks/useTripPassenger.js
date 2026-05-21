// src/hooks/useTripPassenger.js
import { useState, useEffect, useCallback } from 'react';
import { tripAPI } from '../services/tripAPI';
import { useAuth } from '../contexts/AuthContext';

export const useTripPassenger = () => {
  const { user } = useAuth();
  const [trip, setTrip]       = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await tripAPI.getActivePassengerTrip(user.id);
      setTrip(data);
    } catch { setTrip(null); }
    finally { setLoading(false); }
  }, [user?.id]);

  // Carga inicial
  useEffect(() => { reload(); }, [reload]);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (!user?.id) return;
    const unsub = tripAPI.subscribePassenger(user.id, (updated) => {
      setTrip((prev) => {
        // Si el viaje fue REJECTED o COMPLETED, limpiar después de 3 seg
        if (updated.status === 'REJECTED' || updated.status === 'COMPLETED') {
          setTimeout(() => setTrip(null), 3000);
        }
        return { ...prev, ...updated };
      });
    });
    return unsub;
  }, [user?.id]);

  const requestTrip = useCallback(async ({ driverId, originLat, originLng, originAddress }) => {
    if (!user?.id) return;
    const newTrip = await tripAPI.requestTrip({
      passengerId: user.id,
      driverId,
      originLat,
      originLng,
      originAddress,
    });
    setTrip(newTrip);
    return newTrip;
  }, [user?.id]);

  const cancelTrip = useCallback(async () => {
    if (!trip?.id) return;
    await tripAPI.updateStatus(trip.id, 'REJECTED');
    setTrip(null);
  }, [trip?.id]);

  return { trip, loading, requestTrip, cancelTrip, reload };
};
