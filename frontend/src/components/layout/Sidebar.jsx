import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  LayoutDashboard, Box, BookTemplate, Activity,
  Users, FileText, LogOut, Terminal, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/containers', icon: Box, label: 'Containers' },
  { to: '/templates', icon: BookTemplate, label: 'Templates' },
  { to: '/sessions', icon: Users, label: 'Sessions' },
  { to: '/logs', icon: FileText, label: 'Activity Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`fixed left-4 top-4 bottom-4 glass flex flex-col z-40 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border mx-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.15)]">
          <Terminal className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <span className="text-base font-semibold text-text-primary tracking-tight animate-fade-in whitespace-nowrap">
            LinuxLab
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-default group relative overflow-hidden ${
                isActive
                  ? 'bg-primary/10 text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 transition-default ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-border mx-2 space-y-1 mb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-default w-full group border border-transparent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4 group-hover:text-text-primary" /> : <ChevronLeft className="w-4 h-4 group-hover:text-text-primary" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-default w-full group border border-transparent hover:border-danger/20"
        >
          <LogOut className="w-4 h-4 group-hover:text-danger" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
