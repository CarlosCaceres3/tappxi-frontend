import { supabase } from '../lib/supabase';

// ─── AUTH ──────────────────────────────────────────────────────────
export const authAPI = {

register: async ({ name, email, password, phone, role }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone: phone || null, role: role || 'PASSENGER' }
    }
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

  getSession: () => supabase.auth.getSession(),

  onAuthChange: (callback) => supabase.auth.onAuthStateChange(callback),
};

// ─── PERFIL ────────────────────────────────────────────────────────
export const profileAPI = {

  getMe: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── CONDUCTOR ────────────────────────────────────────────────────
export const driverAPI = {

  // Obtener perfil público completo del conductor
  getProfile: async (driverId) => {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        profiles ( name, phone ),
        payment_methods ( id, type, is_active ),
        ratings (
          score, comment, created_at,
          profiles ( name )
        )
      `)
      .eq('id', driverId)
      .single();
    if (error) throw error;
    return data;
  },

  // Obtener el driver del usuario autenticado
  getMyDriver: async (userId) => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*, payment_methods(*)')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data || null;
  },

  // Crear perfil de conductor
  createProfile: async ({ userId, license, vehicleModel, vehiclePlate, vehicleColor, photoUrl }) => {
    const { data, error } = await supabase
      .from('drivers')
      .insert({
        user_id:       userId,
        license,
        vehicle_model: vehicleModel,
        vehicle_plate: vehiclePlate,
        vehicle_color: vehicleColor,
        photo_url:     photoUrl || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Actualizar estado del taxi
  updateStatus: async (driverId, status) => {
    const { error } = await supabase
      .from('drivers')
      .update({ status })
      .eq('id', driverId);
    if (error) throw error;
  },

  // Actualizar ubicación GPS en tiempo real
  updateLocation: async (driverId, { lat, lng }) => {
    const { error } = await supabase
      .from('driver_locations')
      .upsert({ driver_id: driverId, lat, lng, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  // Eliminar ubicación (cuando se pone OFFLINE)
  removeLocation: async (driverId) => {
    const { error } = await supabase
      .from('driver_locations')
      .delete()
      .eq('driver_id', driverId);
    if (error) throw error;
  },

  // Métodos de pago
  addPaymentMethod: async (driverId, type) => {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({ driver_id: driverId, type })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  removePaymentMethod: async (methodId) => {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', methodId);
    if (error) throw error;
  },
};

// ─── TAXIS CERCANOS ───────────────────────────────────────────────
export const taxiAPI = {

  // Obtener conductores AVAILABLE con su última ubicación conocida
  // Filtramos por distancia en el cliente (para el plan gratuito de Supabase)
  getNearby: async ({ lat, lng, radiusKm = 2 }) => {
    const { data, error } = await supabase
      .from('driver_locations')
      .select(`
        driver_id, lat, lng, updated_at,
        drivers!inner (
          id, vehicle_model, vehicle_color, vehicle_plate,
          photo_url, avg_rating, status,
          profiles ( name ),
          payment_methods ( type )
        )
      `)
      .eq('drivers.status', 'AVAILABLE');

    if (error) throw error;

    // Calcular distancia en cliente con fórmula de Haversine
    const toRad = (d) => (d * Math.PI) / 180;
    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    return (data || [])
      .map((loc) => {
        const dist = haversine(lat, lng, Number(loc.lat), Number(loc.lng));
        const driver = loc.drivers;
        return {
          id:            driver.id,
          name:          driver.profiles?.name || 'Conductor',
          vehicleModel:  driver.vehicle_model,
          vehicleColor:  driver.vehicle_color,
          vehiclePlate:  driver.vehicle_plate,
          photoUrl:      driver.photo_url,
          averageRating: Number(driver.avg_rating) || 0,
          paymentMethods: (driver.payment_methods || []).map((p) => p.type),
          location:      { lat: Number(loc.lat), lng: Number(loc.lng) },
          distanceKm:    dist.toFixed(2),
          distanceRaw:   dist,
        };
      })
      .filter((t) => t.distanceRaw <= radiusKm)
      .sort((a, b) => a.distanceRaw - b.distanceRaw);
  },

  // Calificar conductor
  rateDriver: async ({ raterId, driverId, score, comment }) => {
    // Upsert la calificación (actualiza si ya calificó antes)
    const { error } = await supabase
      .from('ratings')
      .upsert({ rater_id: raterId, driver_id: driverId, score, comment });
    if (error) throw error;

    // Recalcular promedio
    const { data: stats, error: statsError } = await supabase
      .from('ratings')
      .select('score')
      .eq('driver_id', driverId);
    if (statsError) throw statsError;

    const avg = stats.reduce((sum, r) => sum + r.score, 0) / stats.length;

    await supabase
      .from('drivers')
      .update({
        avg_rating:    Math.round(avg * 10) / 10,
        total_ratings: stats.length,
      })
      .eq('id', driverId);
  },
};

// ─── REALTIME: suscribirse a ubicaciones ─────────────────────────
export const realtimeAPI = {

  // Pasajero: escuchar cambios en driver_locations
  subscribeToLocations: (onUpdate, onDelete) => {
    const channel = supabase
      .channel('driver-locations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'driver_locations' },
        (payload) => onUpdate(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'driver_locations' },
        (payload) => onUpdate(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'driver_locations' },
        (payload) => onDelete(payload.old.driver_id)
      )
      .subscribe();

    // Devuelve función para cancelar la suscripción
    return () => supabase.removeChannel(channel);
  },
};
