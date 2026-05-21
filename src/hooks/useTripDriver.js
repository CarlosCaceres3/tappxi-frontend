// src/hooks/useTripDriver.js
import { useState, useEffect, useCallback } from 'react';
import { tripAPI } from '../services/tripAPI';
import { driverAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useTripDriver = () => {
  const { user } = useAuth();
  const [driver, setDriver]     = useState(null);
  const [trips, setTrips]       = useState([]);
  const [loading, setLoading]   = useState(true);

  // Cargar el driver del usuario autenticado
  useEffect(() => {
    if (!user?.id) return;
    driverAPI.getMyDriver(user.id).then(setDriver).catch(() => setDriver(null));
  }, [user?.id]);

  // Cargar viajes pendientes / activos
  const reload = useCallback(async () => {
    if (!driver?.id) return;
    setLoading(true);
    try {
      const data = await tripAPI.getPendingDriverTrips(driver.id);
      setTrips(data);
    } catch { setTrips([]); }
    finally { setLoading(false); }
  }, [driver?.id]);

  useEffect(() => { reload(); }, [reload]);

  // Escuchar nuevas solicitudes en tiempo real
  useEffect(() => {
    if (!driver?.id) return;
    const unsub = tripAPI.subscribeDriver(driver.id, (updated) => {
      setTrips((prev) => {
        const idx = prev.findIndex((t) => t.id === updated.id);
        if (idx === -1) return [updated, ...prev];
        const next = [...prev];
        next[idx] = { ...next[idx], ...updated };
        // Limpiar viajes completados o rechazados después de 3 seg
        if (updated.status === 'COMPLETED' || updated.status === 'REJECTED') {
          setTimeout(() => setTrips((p) => p.filter((t) => t.id !== updated.id)), 3000);
        }
        return next;
      });
    });
    return unsub;
  }, [driver?.id]);

  const acceptTrip = useCallback(async (tripId) => {
    await tripAPI.updateStatus(tripId, 'ACCEPTED');
    await reload();
  }, [reload]);

  const rejectTrip = useCallback(async (tripId) => {
    await tripAPI.updateStatus(tripId, 'REJECTED');
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  }, []);

  const startTrip = useCallback(async (tripId) => {
    await tripAPI.updateStatus(tripId, 'IN_PROGRESS');
    await reload();
  }, [reload]);

  const completeTrip = useCallback(async (tripId) => {
    await tripAPI.updateStatus(tripId, 'COMPLETED');
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  }, []);

  return {
    driver, trips, loading,
    acceptTrip, rejectTrip, startTrip, completeTrip,
    pendingTrips:    trips.filter((t) => t.status === 'PENDING'),
    activeTrip:      trips.find((t) => ['ACCEPTED', 'IN_PROGRESS'].includes(t.status)) || null,
  };
};
