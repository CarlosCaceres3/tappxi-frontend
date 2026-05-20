import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/ui/Navbar';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import MapPage from './pages/MapPage';
import DriverPage from './pages/DriverPage';
import './styles/global.css';

const PrivateRoute = ({ children, driverOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
      Cargando...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (driverOnly && user.role !== 'DRIVER') return <Navigate to="/map" replace />;
  return children;
};

const Layout = () => {
  const { user } = useAuth();
  const hideNavPaths = ['/', '/login', '/register'];
  const isPublic = hideNavPaths.includes(window.location.pathname);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/map" element={<PrivateRoute><MapPage /></PrivateRoute>} />
        <Route path="/driver" element={<PrivateRoute driverOnly><DriverPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
