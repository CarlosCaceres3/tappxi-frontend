// src/services/tripAPI.js
import { supabase } from '../lib/supabase';

export const tripAPI = {

  // Pasajero solicita un viaje a un conductor específico
  requestTrip: async ({ passengerId, driverId, originLat, originLng, originAddress }) => {
    const { data, error } = await supabase
      .from('trips')
      .insert({
        passenger_id:    passengerId,
        driver_id:       driverId,
        status:          'PENDING',
        origin_lat:      originLat,
        origin_lng:      originLng,
        origin_address:  originAddress || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Conductor acepta o rechaza
  updateStatus: async (tripId, status) => {
    const { data, error } = await supabase
      .from('trips')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', tripId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Obtener viaje activo del pasajero (PENDING, ACCEPTED o IN_PROGRESS)
  getActivePassengerTrip: async (passengerId) => {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        drivers (
          id, vehicle_model, vehicle_color, vehicle_plate, avg_rating,
          profiles ( name, phone )
        )
      `)
      .eq('passenger_id', passengerId)
      .in('status', ['PENDING', 'ACCEPTED', 'IN_PROGRESS'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  // Obtener viaje pendiente para el conductor
  getPendingDriverTrips: async (driverId) => {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        profiles!trips_passenger_id_fkey ( name, phone )
      `)
      .eq('driver_id', driverId)
      .in('status', ['PENDING', 'ACCEPTED', 'IN_PROGRESS'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Escuchar cambios en tiempo real del viaje activo del pasajero
  subscribePassenger: (passengerId, onChange) => {
    const channel = supabase
      .channel(`trips-passenger-${passengerId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'trips',
          filter: `passenger_id=eq.${passengerId}`,
        },
        (payload) => onChange(payload.new || payload.old)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  // Escuchar solicitudes entrantes para el conductor
  subscribeDriver: (driverId, onChange) => {
    const channel = supabase
      .channel(`trips-driver-${driverId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'trips',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => onChange(payload.new || payload.old)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
