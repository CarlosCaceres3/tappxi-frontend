// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/ui/Navbar';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import MapPage from './pages/MapPage';
import DriverPage from './pages/DriverPage';
import HistoryPage from './pages/HistoryPage';
import './styles/global.css';

const PrivateRoute = ({ children, driverOnly = false }) => {
  const { user, loading } = useAuth();
  const location = window.location.pathname;
  const publicPaths = ['/', '/login', '/register'];
  const isPublic = publicPaths.includes(location);

  if (loading && !isPublic) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#555' }}>
      Cargando...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (driverOnly && user.role !== 'DRIVER') return <Navigate to="/map" replace />;
  return children;
};

const Layout = () => {
  const { user, loading } = useAuth();
  const location = window.location.pathname;
  const publicPaths = ['/', '/login', '/register'];
  const isPublic = publicPaths.includes(location);
  const hideNav = ['/login', '/register'].includes(location);

  if (loading && !isPublic) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#555' }}>
      Cargando...
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/map"      element={<PrivateRoute><MapPage /></PrivateRoute>} />
        <Route path="/driver"   element={<PrivateRoute driverOnly><DriverPage /></PrivateRoute>} />
        <Route path="/history"  element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
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
