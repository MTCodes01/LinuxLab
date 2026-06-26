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
      className={`fixed left-0 top-0 h-screen bg-surface-900/90 backdrop-blur-md z-40 flex flex-col transition-all duration-300 border-r-2 border-primary ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b-2 border-primary">
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
              className={`flex items-center gap-3 px-3 py-2.5 font-mono text-sm uppercase tracking-wider font-bold transition-all group ${
                isActive
                  ? 'text-primary bg-primary/10 border-l-4 border-primary'
                  : 'text-text-secondary hover:text-primary hover:bg-surface-800 border-l-4 border-transparent'
              }`}
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
      <div className="p-3 border-t-2 border-primary space-y-1">
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
