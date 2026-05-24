// src/services/api.js
import { supabase } from '../lib/supabase';

// ─── AUTH ──────────────────────────────────────────────────────────
export const authAPI = {
  register: async ({ name, email, password, phone, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, phone: phone || null, role: role || 'PASSENGER' } },
    });
    if (error) throw error;
    return data;
  },
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

// ─── PERFIL ────────────────────────────────────────────────────────
export const profileAPI = {
  getMe: async (userId) => {
    const { data, error } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },
};

// ─── CONDUCTOR ────────────────────────────────────────────────────
export const driverAPI = {
  getProfile: async (driverId) => {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        profiles ( name, phone ),
        payment_methods ( id, type, is_active ),
        ratings ( score, comment, created_at, trip_id, profiles ( name ) )
      `)
      .eq('id', driverId)
      .single();
    if (error) throw error;
    return data;
  },

  getMyDriver: async (userId) => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*, payment_methods(*)')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  createProfile: async ({ userId, license, vehicleModel, vehiclePlate, vehicleColor, photoUrl }) => {
    const { data, error } = await supabase
      .from('drivers')
      .insert({
        user_id: userId, license,
        vehicle_model: vehicleModel, vehicle_plate: vehiclePlate,
        vehicle_color: vehicleColor, photo_url: photoUrl || null,
      })
      .select().single();
    if (error) throw error;
    return data;
  },

  updateStatus: async (driverId, status) => {
    const { error } = await supabase.from('drivers').update({ status }).eq('id', driverId);
    if (error) throw error;
  },

  updateLocation: async (driverId, { lat, lng }) => {
    const { error } = await supabase
      .from('driver_locations')
      .upsert({ driver_id: driverId, lat, lng, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  removeLocation: async (driverId) => {
    const { error } = await supabase.from('driver_locations').delete().eq('driver_id', driverId);
    if (error) throw error;
  },

  addPaymentMethod: async (driverId, type) => {
    const { data, error } = await supabase
      .from('payment_methods').insert({ driver_id: driverId, type }).select().single();
    if (error) throw error;
    return data;
  },

  removePaymentMethod: async (methodId) => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', methodId);
    if (error) throw error;
  },
};

// ─── TAXIS CERCANOS ───────────────────────────────────────────────
export const taxiAPI = {
  getNearby: async ({ lat, lng, radiusKm = 2 }) => {
    const { data, error } = await supabase
      .from('driver_locations')
      .select(`
        driver_id, lat, lng,
        drivers!inner (
          id, vehicle_model, vehicle_color, vehicle_plate,
          photo_url, avg_rating, status,
          profiles ( name ),
          payment_methods ( type )
        )
      `)
      .eq('drivers.status', 'AVAILABLE');

    if (error) throw error;

    const toRad = (d) => (d * Math.PI) / 180;
    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    return (data || [])
      .map((loc) => {
        const dist = haversine(lat, lng, Number(loc.lat), Number(loc.lng));
        const driver = loc.drivers;
        return {
          id: driver.id,
          name: driver.profiles?.name || 'Conductor',
          vehicleModel: driver.vehicle_model,
          vehicleColor: driver.vehicle_color,
          vehiclePlate: driver.vehicle_plate,
          photoUrl: driver.photo_url,
          averageRating: Number(driver.avg_rating) || 0,
          paymentMethods: (driver.payment_methods || []).map(p => p.type),
          location: { lat: Number(loc.lat), lng: Number(loc.lng) },
          distanceKm: dist.toFixed(2),
          distanceRaw: dist,
        };
      })
      .filter(t => t.distanceRaw <= radiusKm)
      .sort((a, b) => a.distanceRaw - b.distanceRaw);
  },

  // Calificación POR VIAJE — una por viaje, no por cuenta
  rateDriver: async ({ raterId, driverId, tripId, score, comment }) => {
    const { error } = await supabase
      .from('ratings')
      .insert({ rater_id: raterId, driver_id: driverId, trip_id: tripId, score, comment });
    if (error) throw error;

    // Recalcular promedio
    const { data: stats } = await supabase
      .from('ratings').select('score').eq('driver_id', driverId);
    const avg = stats.reduce((sum, r) => sum + r.score, 0) / stats.length;
    await supabase.from('drivers').update({
      avg_rating: Math.round(avg * 10) / 10,
      total_ratings: stats.length,
    }).eq('id', driverId);
  },
};

// ─── HISTORIAL ────────────────────────────────────────────────────
export const historyAPI = {
  // Todos los viajes completados del pasajero (con o sin calificación)
  getPassengerHistory: async (passengerId) => {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id, status, created_at, updated_at, origin_address,
        drivers (
          id, vehicle_model, vehicle_plate, vehicle_color,
          profiles ( name )
        ),
        ratings ( id, score, comment )
      `)
      .eq('passenger_id', passengerId)
      .eq('status', 'COMPLETED')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Todos los viajes completados del conductor
  getDriverHistory: async (driverId) => {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id, status, created_at, updated_at, origin_address,
        profiles!trips_passenger_id_fkey ( name, phone ),
        ratings ( id, score, comment )
      `)
      .eq('driver_id', driverId)
      .eq('status', 'COMPLETED')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};

// ─── REALTIME ─────────────────────────────────────────────────────
export const realtimeAPI = {
  subscribeToLocations: (onUpdate, onDelete) => {
    const channel = supabase
      .channel('driver-locations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'driver_locations' }, p => onUpdate(p.new))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'driver_locations' }, p => onUpdate(p.new))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'driver_locations' }, p => onDelete(p.old.driver_id))
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
