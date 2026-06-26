import { useAuth } from '../../auth/AuthContext';
import { Search, Bell, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Title */}
      <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search containers..."
            className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary text-sm focus:outline-none w-64 transition-default text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Create Container Quick Action */}
        <button
          onClick={() => navigate('/containers?create=true')}
          className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-default shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Container</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-default">
          <Bell className="w-5 h-5" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-border ml-2">
          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
            <User className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary">{user?.username || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
