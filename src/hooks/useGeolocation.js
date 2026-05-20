// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

// Bogotá como fallback
const DEFAULT_POSITION = { lat: 4.711, lng: -74.0721 };

export const useGeolocation = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPosition(DEFAULT_POSITION);
      setError('Geolocalización no disponible');
      setLoading(false);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setPosition(DEFAULT_POSITION);
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { position, error, loading };
};
