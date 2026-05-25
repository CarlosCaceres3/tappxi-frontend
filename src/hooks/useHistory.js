// src/hooks/useHistory.js
import { useState, useEffect, useCallback } from 'react';
import { historyAPI } from '../services/api';
import { driverAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const usePassengerHistory = () => {
  const { user } = useAuth();
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await historyAPI.getPassengerHistory(user.id);
      setTrips(data);
    } catch { setTrips([]); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const unrated   = trips.filter(t => !t.ratings || t.ratings.length === 0);
  const rated     = trips.filter(t => t.ratings && t.ratings.length > 0);
  const avgGiven  = rated.length > 0
    ? (rated.reduce((s, t) => s + t.ratings[0].score, 0) / rated.length).toFixed(1)
    : '—';

  return { trips, loading, unrated: unrated.length, avgGiven, total: trips.length, reload: load };
};

export const useDriverHistory = () => {
  const { user } = useAuth();
  const [trips, setTrips]     = useState([]);
  const [driver, setDriver]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    driverAPI.getMyDriver(user.id).then(setDriver).catch(() => {});
  }, [user?.id]);

  const load = useCallback(async () => {
    if (!driver?.id) return;
    setLoading(true);
    try {
      const data = await historyAPI.getDriverHistory(driver.id);
      setTrips(data);
    } catch { setTrips([]); }
    finally { setLoading(false); }
  }, [driver?.id]);

  useEffect(() => { load(); }, [load]);

  // Estadísticas calculadas en cliente
  const total = trips.length;
  const ratedTrips = trips.filter(t => t.ratings?.length > 0);
  const avgRating = ratedTrips.length > 0
    ? (ratedTrips.reduce((s, t) => s + t.ratings[0].score, 0) / ratedTrips.length).toFixed(1)
    : (driver?.avg_rating || 0).toFixed(1);

  // Viajes por día (últimos 7 días)
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const now = new Date();
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const count = trips.filter(t => t.created_at?.startsWith(dayStr)).length;
    return { label: days[d.getDay()], count };
  });
  const maxCount = Math.max(...weekData.map(d => d.count), 1);

  // Distribución de calificaciones
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratedTrips.filter(t => t.ratings[0].score === star).length,
  }));
  const maxRating = Math.max(...ratingDist.map(r => r.count), 1);

  return {
    trips, driver, loading,
    stats: { total, avgRating, weekData, maxCount, ratingDist, maxRating },
    reload: load,
  };
};
