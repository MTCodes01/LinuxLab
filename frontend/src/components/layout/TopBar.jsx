import { useAuth } from '../../auth/AuthContext';
import { Search, Bell, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 md:px-8 bg-background/80 backdrop-blur-md border-b border-border transition-default">
      {/* Title / Section Name */}
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h1>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search containers, logs..."
            className="pl-9 pr-12 py-1.5 bg-surface border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary text-xs focus:outline-none w-56 lg:w-64 transition-default text-text-primary placeholder:text-text-muted"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5">
            <kbd className="px-1.5 py-0.5 text-[9px] font-medium text-text-muted bg-card border border-border rounded">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[9px] font-medium text-text-muted bg-card border border-border rounded">K</kbd>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => navigate('/containers?create=true')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-medium transition-default shadow-sm border border-primary/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Container</span>
        </button>

        <div className="w-px h-5 bg-border" />

        {/* Notification Bell */}
        <button className="relative p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card border border-transparent hover:border-border transition-default cursor-pointer">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* Profile Menu */}
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden hover:border-primary transition-default focus:outline-none cursor-pointer">
            <User className="w-3.5 h-3.5 text-text-secondary" />
          </button>
          <span className="hidden sm:inline text-xs font-medium text-text-secondary">
            {user?.username || 'admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
