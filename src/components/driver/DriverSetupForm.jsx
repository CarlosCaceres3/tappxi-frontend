// src/components/driver/DriverSetupForm.jsx
import { useState } from 'react';
import { driverAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STEPS = ['Vehículo', 'Licencia', 'Listo'];

const Input = ({ label, required, error, ...props }) => (
  <div className="input-group">
    <label>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
    <input {...props} />
    {error && <span className="error-msg">{error}</span>}
  </div>
);

export default function DriverSetupForm({ onComplete }) {
  const { user } = useAuth();
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm]     = useState({
    vehicleModel:  '',
    vehiclePlate:  '',
    vehicleColor:  '',
    license:       '',
    photoUrl:      '',
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validateStep0 = () => {
    const e = {};
    if (!form.vehicleModel.trim()) e.vehicleModel = 'Requerido';
    if (!form.vehiclePlate.trim()) e.vehiclePlate = 'Requerido';
    if (!form.vehicleColor.trim()) e.vehicleColor = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.license.trim()) e.license = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    setError('');
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await driverAPI.createProfile({
        userId:       user.id,
        vehicleModel: form.vehicleModel.trim(),
        vehiclePlate: form.vehiclePlate.trim().toUpperCase(),
        vehicleColor: form.vehicleColor.trim(),
        license:      form.license.trim(),
        photoUrl:     form.photoUrl.trim() || null,
      });
      onComplete();
    } catch (err) {
      setError(err.message || 'Error al crear el perfil');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
          Configura tu perfil de conductor
        </h2>
        <p style={{ fontSize: 13, color: '#888' }}>
          Completa tu información para aparecer en el mapa y recibir viajes.
        </p>
      </div>

      {/* Indicador de pasos */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {STEPS.map((label, i) => (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: '100%', height: 3, borderRadius: 2,
              background: i <= step ? '#F5C000' : '#2a2a2a',
              transition: 'background .3s',
            }} />
            <span style={{
              fontSize: 11,
              color: i === step ? '#F5C000' : i < step ? '#888' : '#333',
              transition: 'color .3s',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 0 — Vehículo */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: '#1e1e00', border: '0.5px solid #3a3a00',
            borderRadius: 10, padding: '12px 16px',
            fontSize: 13, color: '#F5C000',
          }}>
            🚗 Ingresa los datos de tu vehículo tal como aparecen en los documentos.
          </div>

          <Input
            label="Marca y modelo"
            required
            placeholder="Ej: Toyota Corolla 2020"
            value={form.vehicleModel}
            onChange={set('vehicleModel')}
            error={errors.vehicleModel}
          />
          <Input
            label="Placa"
            required
            placeholder="Ej: ABC-123"
            value={form.vehiclePlate}
            onChange={set('vehiclePlate')}
            error={errors.vehiclePlate}
            style={{ textTransform: 'uppercase' }}
          />
          <Input
            label="Color"
            required
            placeholder="Ej: Blanco"
            value={form.vehicleColor}
            onChange={set('vehicleColor')}
            error={errors.vehicleColor}
          />
          <Input
            label="URL de tu foto (opcional)"
            placeholder="https://... (foto de perfil)"
            value={form.photoUrl}
            onChange={set('photoUrl')}
          />
        </div>
      )}

      {/* Step 1 — Licencia */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: '#1e1e00', border: '0.5px solid #3a3a00',
            borderRadius: 10, padding: '12px 16px',
            fontSize: 13, color: '#F5C000',
          }}>
            📋 Ingresa tu número de licencia de conducción.
          </div>

          <Input
            label="Número de licencia"
            required
            placeholder="Ej: 80123456"
            value={form.license}
            onChange={set('license')}
            error={errors.license}
          />

          {/* Resumen del vehículo */}
          <div style={{
            background: '#111', border: '0.5px solid #2a2a2a',
            borderRadius: 10, padding: 16,
          }}>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Resumen del vehículo
            </div>
            {[
              ['Modelo', form.vehicleModel],
              ['Placa', form.vehiclePlate.toUpperCase()],
              ['Color', form.vehicleColor],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, marginBottom: 6,
              }}>
                <span style={{ color: '#888' }}>{k}</span>
                <span style={{ color: '#F0F0F0', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Confirmación */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🚕</div>
          <h3 style={{ fontSize: 18, fontWeight: 500 }}>¡Todo listo!</h3>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>
            Tu perfil de conductor está completo. Actívate como <span style={{ color: '#F5C000' }}>Disponible</span> para aparecer en el mapa y empezar a recibir viajes.
          </p>

          <div style={{ background: '#111', border: '0.5px solid #2a2a2a', borderRadius: 10, padding: 16, textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Tu perfil
            </div>
            {[
              ['Modelo', form.vehicleModel],
              ['Placa', form.vehiclePlate.toUpperCase()],
              ['Color', form.vehicleColor],
              ['Licencia', form.license],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, marginBottom: 6,
              }}>
                <span style={{ color: '#888' }}>{k}</span>
                <span style={{ color: '#F0F0F0', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 16, padding: '10px 14px',
          background: 'rgba(239,68,68,.08)',
          border: '0.5px solid rgba(239,68,68,.25)',
          borderRadius: 8, fontSize: 13, color: '#f87171',
        }}>
          {error}
        </div>
      )}

      {/* Botones de navegación */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        {step > 0 && step < 2 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="btn btn-ghost"
            style={{ flex: 1 }}
            disabled={loading}
          >
            Atrás
          </button>
        )}

        {step < 2 && (
          <button
            onClick={handleNext}
            className="btn btn-primary"
            style={{ flex: 2, padding: '13px' }}
            disabled={loading}
          >
            Continuar
          </button>
        )}

        {step === 2 && (
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{ flex: 1, padding: '13px', fontSize: 15 }}
            disabled={loading}
          >
            {loading ? 'Creando perfil...' : 'Crear mi perfil'}
          </button>
        )}
      </div>
    </div>
  );
}
