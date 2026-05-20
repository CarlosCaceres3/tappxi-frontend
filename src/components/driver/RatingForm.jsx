import { useState } from 'react';

const StarButton = ({ filled, hovered, onClick, onMouseEnter, onMouseLeave }) => (
  <button onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
    style={{
      background: 'none', border: 'none', cursor: 'pointer',
      fontSize: 32, color: filled || hovered ? '#F5C000' : '#333',
      transition: 'color .1s, transform .1s',
      transform: hovered ? 'scale(1.2)' : 'scale(1)',
      padding: '0 4px',
    }}>
    ★
  </button>
);

const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

export default function RatingForm({ onSubmit, onCancel }) {
  const [score, setScore]     = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (score === 0) { setError('Selecciona una calificación'); return; }
    setLoading(true); setError('');
    try {
      await onSubmit({ score, comment: comment.trim() || undefined });
    } catch {
      setError('Error al enviar calificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#111', borderRadius: 10, padding: 18, border: '0.5px solid #2a2a2a' }}>
      <div style={{ fontWeight: 500, marginBottom: 14, fontSize: 15 }}>Calificar conductor</div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        {[1,2,3,4,5].map(star => (
          <StarButton key={star}
            filled={star <= score} hovered={star <= hovered}
            onClick={() => setScore(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: '#F5C000', height: 20, marginBottom: 14 }}>
        {LABELS[hovered || score]}
      </div>

      <div className="input-group" style={{ marginBottom: 14 }}>
        <label>Comentario (opcional)</label>
        <textarea rows={3} placeholder="¿Cómo fue tu experiencia?"
          value={comment} onChange={e => setComment(e.target.value)}
          maxLength={500} style={{ resize: 'vertical' }} />
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 10 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }} disabled={loading}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}
          style={{ flex: 1 }} disabled={loading || score === 0}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
