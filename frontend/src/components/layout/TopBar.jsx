import { useAuth } from '../../auth/AuthContext';
import { Search, Bell, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 bg-background/70 backdrop-blur-xl border-b border-border transition-all duration-300">
      {/* Title */}
      <h1 className="text-xl font-bold text-text-primary tracking-tight">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search containers..."
            className="pl-10 pr-4 py-2 bg-surface/50 hover:bg-surface border border-border rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm focus:outline-none w-64 transition-default text-text-primary placeholder:text-text-muted shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-text-muted bg-background border border-border rounded">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-text-muted bg-background border border-border rounded">K</kbd>
          </div>
        </div>

        {/* Create Container Quick Action */}
        <button
          onClick={() => navigate('/containers?create=true')}
          className="flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-default shadow-[0_0_15px_rgba(124,58,237,0.2)] border border-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Container</span>
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface transition-default border border-transparent hover:border-border">
          <Bell className="w-5 h-5" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden hover:border-primary/50 transition-default focus:outline-none focus:ring-2 focus:ring-primary/20">
            <User className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>
    </header>
  );
}
