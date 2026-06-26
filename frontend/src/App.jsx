import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContainersPage from './pages/ContainersPage';
import TerminalPage from './pages/TerminalPage';
import TemplatesPage from './pages/TemplatesPage';
import SessionsPage from './pages/SessionsPage';
import LogsPage from './pages/LogsPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/containers" element={<ProtectedRoute><ContainersPage /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />

      {/* Terminal — full screen, still protected */}
      <Route path="/terminal/:containerId" element={<ProtectedRoute><TerminalPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
