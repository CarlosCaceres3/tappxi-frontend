// src/hooks/useChat.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../services/chatAPI';
import { useAuth } from '../contexts/AuthContext';

export const useChat = (tripId) => {
  const { user } = useAuth();
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [input, setInput]         = useState('');
  const bottomRef = useRef(null);

  // Cargar mensajes iniciales
  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    chatAPI.getMessages(tripId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [tripId]);

  // Suscribirse a mensajes nuevos
  useEffect(() => {
    if (!tripId) return;
    const unsub = chatAPI.subscribeToMessages(tripId, (newMsg) => {
      setMessages((prev) => {
        // Evitar duplicados
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
    return unsub;
  }, [tripId]);

  // Scroll automático al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !user?.id || !tripId) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    try {
      await chatAPI.sendMessage({
        tripId,
        senderId: user.id,
        content:  text,
      });
    } catch {
      setInput(text); // restaurar si falla
    } finally {
      setSending(false);
    }
  }, [input, user?.id, tripId]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    messages,
    loading,
    sending,
    input,
    setInput,
    sendMessage,
    handleKey,
    bottomRef,
    myId: user?.id,
  };
};
