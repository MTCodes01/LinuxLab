import { useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  LayoutDashboard, Box, BookTemplate, Users, FileText, LogOut,
  Terminal, Settings, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',     group: 'main' },
  { to: '/containers', icon: Box,             label: 'Containers',    group: 'main' },
  { to: '/templates',  icon: BookTemplate,    label: 'Templates',     group: 'main' },
  { to: '/sessions',   icon: Users,           label: 'Sessions',      group: 'monitor' },
  { to: '/logs',       icon: FileText,        label: 'Activity Logs', group: 'monitor' },
  { to: '/settings',   icon: Settings,        label: 'Settings',      group: 'system' },
];

const groups = {
  main:    { label: 'Workspace', items: navItems.filter(n => n.group === 'main') },
  monitor: { label: 'Monitoring', items: navItems.filter(n => n.group === 'monitor') },
  system:  { label: 'System', items: navItems.filter(n => n.group === 'system') },
};

function NavItem({ item, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === item.to ||
    (item.to !== '/' && location.pathname.startsWith(item.to));
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium
        transition-fast outline-none
        ${isActive
          ? 'bg-primary/20 text-text-primary border-l-2 border-primary'
          : 'text-text-secondary hover:bg-elevated hover:text-text-primary border-l-2 border-transparent'
        }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
      <span className="flex-1 truncate">{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-40
          w-56 flex flex-col
          bg-surface border-r border-border
          transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border flex-shrink-0 bg-background">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-text-primary tracking-tight font-mono">
              LinuxLab
            </span>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded text-text-muted hover:text-text-primary hover:bg-elevated transition-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {Object.entries(groups).map(([key, group]) => (
            <div key={key}>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.to} item={item} onClick={onMobileClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User / Footer */}
        <div className="p-3 border-t border-border bg-background flex-shrink-0">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-elevated border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-text-secondary">
                  {(user?.username || 'A')[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {user?.username || 'admin'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded text-text-muted hover:text-danger hover:bg-elevated transition-fast cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
