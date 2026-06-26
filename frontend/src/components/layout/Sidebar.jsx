import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  LayoutDashboard, Box, BookTemplate, Activity,
  Users, FileText, LogOut, Terminal, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/containers', icon: Box, label: 'Containers' },
  { to: '/templates', icon: BookTemplate, label: 'Templates' },
  { to: '/sessions', icon: Users, label: 'Sessions' },
  { to: '/logs', icon: FileText, label: 'Activity Logs' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen glass z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
      style={{ borderRadius: 0, borderLeft: 'none', borderTop: 'none', borderBottom: 'none' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: 'var(--color-glass-border)' }}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent-light bg-clip-text text-transparent animate-fade-in">
            LinuxLab
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-default group ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              style={isActive ? {
                background: 'rgba(6, 182, 212, 0.1)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.05)',
              } : {}}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-text-primary'}`} />
              {!collapsed && <span>{label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle + logout */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--color-glass-border)' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-default w-full"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-danger transition-default w-full"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
