import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './auth/LoginPage';
import Desktop from './components/os/Desktop';
import { WindowManagerProvider, useWindowManager } from './components/os/WindowManagerContext';
import TerminalPage from './pages/TerminalPage';

import SystemOverviewApp from './apps/SystemOverviewApp';
import ContainersApp from './apps/ContainersApp';
import TemplatesApp from './apps/TemplatesApp';
import LogsApp from './apps/LogsApp';
import SessionsApp from './apps/SessionsApp';

// We map app IDs to components here
const APP_REGISTRY = {
  'dashboard': { title: 'System Overview', component: SystemOverviewApp, width: 900, height: 600 },
  'containers': { title: 'Containers', component: ContainersApp, width: 1000, height: 700 },
  'templates': { title: 'Templates', component: TemplatesApp, width: 800, height: 600 },
  'logs': { title: 'Activity Logs', component: LogsApp, width: 800, height: 600 },
  'sessions': { title: 'Sessions', component: SessionsApp, width: 800, height: 600 },
};

function DesktopController() {
  const { openWindow } = useWindowManager();
  const location = useLocation();

  // Listen for 'launch-app' events (e.g. from Dock or Desktop Icons)
  useEffect(() => {
    const handleLaunchApp = (e) => {
      const appId = e.detail;
      const config = APP_REGISTRY[appId];
      if (config) {
        openWindow(appId, config);
      }
    };
    window.addEventListener('launch-app', handleLaunchApp);
    return () => window.removeEventListener('launch-app', handleLaunchApp);
  }, [openWindow]);

  // Deep linking: map standard URLs to opening windows on the desktop
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      openWindow('dashboard', APP_REGISTRY['dashboard']);
    } else if (path === '/containers') {
      openWindow('containers', APP_REGISTRY['containers']);
    } else if (path === '/templates') {
      openWindow('templates', APP_REGISTRY['templates']);
    } else if (path === '/logs') {
      openWindow('logs', APP_REGISTRY['logs']);
    } else if (path === '/sessions') {
      openWindow('sessions', APP_REGISTRY['sessions']);
    }
  }, [location.pathname, openWindow]);

  return <Desktop />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Terminal — full screen, still protected */}
      <Route path="/terminal/:containerId" element={<ProtectedRoute><TerminalPage /></ProtectedRoute>} />

      {/* Protected routes (OS Metaphor) */}
      <Route path="*" element={
        <ProtectedRoute>
          <WindowManagerProvider>
            <DesktopController />
          </WindowManagerProvider>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
