import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  LayoutDashboard, Box, BookTemplate, Users, FileText, LogOut,
  Terminal, Settings, ChevronRight, X, Menu
} from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',     group: 'main' },
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-default relative group outline-none
        ${isActive
          ? 'bg-primary/10 text-primary'
          : 'text-text-muted hover:text-text-primary hover:bg-white/5'
        }`}
    >
      {isActive && (
        <span className="absolute inset-y-0 left-0 w-0.5 rounded-r-full bg-primary" />
      )}
      <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-default
        ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'}`}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 text-primary/60 ml-auto" />
      )}
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
          w-64 flex flex-col
          bg-surface border-r border-border
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-text-primary tracking-tight font-mono">
                LinuxLab
              </span>
            </div>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-default"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {Object.entries(groups).map(([key, group]) => (
            <div key={key}>
              <p className="text-[11px] font-semibold text-text-dim uppercase tracking-widest px-3 mb-2">
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
        <div className="px-3 pb-4 border-t border-border pt-3 space-y-1 flex-shrink-0">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border mb-2">
            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {(user?.username || 'A')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {user?.username || 'admin'}
              </p>
              <p className="text-xs text-text-muted">Administrator</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
              text-text-muted hover:text-danger hover:bg-danger/10 transition-default group cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px] transition-default group-hover:text-danger" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
