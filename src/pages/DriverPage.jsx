import DriverPanel from '../components/driver/DriverPanel';
import Navbar from '../components/ui/Navbar';

export default function DriverPage() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#111' }}>
      <Navbar />
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div style={{ padding: '28px 24px 8px', maxWidth: 520, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Panel del conductor</h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            Gestiona tu estado, calificación y métodos de pago
          </p>
        </div>
        <DriverPanel />
      </div>
    </div>
  );
}
