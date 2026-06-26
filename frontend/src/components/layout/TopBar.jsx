import { useAuth } from '../../auth/AuthContext';
import { Search, Bell, Plus, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const pageTitles = {
  '/':           { title: 'Dashboard',     subtitle: 'Overview of your infrastructure' },
  '/containers': { title: 'Containers',    subtitle: 'Manage your Linux environments' },
  '/templates':  { title: 'Templates',     subtitle: 'Pre-configured environment templates' },
  '/sessions':   { title: 'Sessions',      subtitle: 'Active terminal and SSH sessions' },
  '/logs':       { title: 'Activity Logs', subtitle: 'System and container event history' },
  '/settings':   { title: 'Settings',      subtitle: 'Platform configuration and preferences' },
};

export default function TopBar({ onMobileMenuOpen }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const page = pageTitles[location.pathname] ||
               Object.entries(pageTitles).find(([k]) => k !== '/' && location.pathname.startsWith(k))?.[1] ||
               { title: 'LinuxLab', subtitle: '' };

  return (
    <header className="
      sticky top-0 z-30 h-14 flex-shrink-0
      flex items-center justify-between
      px-4 md:px-6
      bg-background
      border-b border-border
    ">
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-elevated transition-fast flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page heading */}
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-text-primary leading-none truncate">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="text-[11px] text-text-muted mt-0.5 hidden sm:block truncate">
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="input-base pl-8 pr-3 py-1 w-48 text-xs bg-surface"
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-4 bg-border mx-1" />

        {/* Notifications */}
        <button className="relative p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-elevated transition-fast">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
          <span className="hidden md:inline text-xs font-medium text-text-secondary">
            {user?.username || 'admin'}
          </span>
          <div className="w-7 h-7 rounded bg-elevated border border-border flex items-center justify-center cursor-pointer hover:border-primary transition-fast">
            <span className="text-xs font-bold text-text-secondary">
              {(user?.username || 'A')[0].toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
