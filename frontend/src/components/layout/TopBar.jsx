import { useAuth } from '../../auth/AuthContext';
import { Search, Bell, User } from 'lucide-react';

export default function TopBar({ title }) {
  const { user } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 glass"
            style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
      {/* Title */}
      <h1 className="text-xl font-semibold text-text-primary">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search containers..."
            className="pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-default"
            style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-glass-border)', color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl glass-hover transition-default"
                style={{ background: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)' }}>
          <Bell className="w-5 h-5 text-text-secondary" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3 pl-4 border-l" style={{ borderColor: 'var(--color-glass-border)' }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary">{user?.username || 'Admin'}</p>
            <p className="text-xs text-text-muted">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
