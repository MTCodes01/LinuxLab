import { useAuth } from '../../auth/AuthContext';
import { Search, Bell, Plus, Menu, ChevronRight } from 'lucide-react';
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
      sticky top-0 z-30 h-16 flex-shrink-0
      flex items-center justify-between
      px-5 md:px-7
      bg-background/80 backdrop-blur-md
      border-b border-border
    ">
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-default flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page heading */}
        <div className="min-w-0">
          <h1 className="text-base font-bold text-text-primary leading-none truncate">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="text-xs text-text-muted mt-0.5 hidden sm:block truncate">
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search — hidden on small screens */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="input-base pl-9 pr-3 py-1.5 w-48 lg:w-60 text-sm"
            style={{ fontSize: '0.8125rem' }}
          />
        </div>

        {/* New Container */}
        <button
          onClick={() => navigate('/containers?create=true')}
          className="btn btn-primary text-sm px-3 py-2 hidden sm:inline-flex"
        >
          <Plus className="w-4 h-4" />
          <span>New Container</span>
        </button>

        {/* Mobile new container (icon only) */}
        <button
          onClick={() => navigate('/containers?create=true')}
          className="sm:hidden p-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-default"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-border mx-1" />

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-default">
          <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center cursor-pointer hover:opacity-90 transition-default shadow-glow">
            <span className="text-xs font-bold text-white">
              {(user?.username || 'A')[0].toUpperCase()}
            </span>
          </div>
          <span className="hidden md:inline text-sm font-medium text-text-secondary">
            {user?.username || 'admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
