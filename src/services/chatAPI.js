// src/services/chatAPI.js
import { supabase } from '../lib/supabase';

export const chatAPI = {

  // Obtener mensajes de un viaje
  getMessages: async (tripId) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, content, created_at, sender_id,
        profiles ( name )
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Enviar mensaje
  sendMessage: async ({ tripId, senderId, content }) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({ trip_id: tripId, sender_id: senderId, content: content.trim() })
      .select(`id, content, created_at, sender_id, profiles ( name )`)
      .single();
    if (error) throw error;
    return data;
  },

  // Suscribirse a mensajes nuevos en tiempo real
  subscribeToMessages: (tripId, onNewMessage) => {
    const channel = supabase
      .channel(`chat-${tripId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `trip_id=eq.${tripId}`,
        },
        async (payload) => {
          // Enriquecer con el nombre del sender
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', payload.new.sender_id)
            .single();
          onNewMessage({
            ...payload.new,
            profiles: data,
          });
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
