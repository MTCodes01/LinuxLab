import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  LayoutDashboard, Box, BookTemplate, Users, FileText, LogOut, Terminal, Settings
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/containers', icon: Box, label: 'Containers' },
  { to: '/templates', icon: BookTemplate, label: 'Templates' },
  { to: '/sessions', icon: Users, label: 'Sessions' },
  { to: '/logs', icon: FileText, label: 'Activity Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-[260px] h-screen sticky top-0 bg-surface/90 backdrop-blur-xl border-r border-border flex flex-col z-40 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-glow">
          <Terminal className="w-4 h-4 text-primary" />
        </div>
        <span className="text-base font-semibold text-text-primary tracking-tight font-tech">
          LinuxLab
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-default group relative ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-card border border-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-glow" />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 transition-default ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-border space-y-1">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-default w-full group cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-text-muted group-hover:text-danger transition-default" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
