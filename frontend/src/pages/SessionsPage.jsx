import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { sessionsAPI } from '../api/client';
import { formatDistanceToNow, format } from 'date-fns';
import { Users, Monitor, Wifi, Clock, Terminal, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchSessions = () => {
    sessionsAPI.list({ limit: 100, active_only: activeOnly })
      .then(({ data }) => {
        setSessions(data.sessions || []);
        setTotal(data.total || 0);
        setActive(data.active || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, [activeOnly]);

  const filteredSessions = sessions.filter(s => {
    const term = search.toLowerCase();
    const username = (s.username || 'admin').toLowerCase();
    const container = `container #${s.container_id}`.toLowerCase();
    const ip = (s.ip_address || '').toLowerCase();
    return username.includes(term) || container.includes(term) || ip.includes(term);
  });

  return (
    <DashboardLayout title="Sessions">
      
      {/* Action Header / Filter Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        
        {/* Toggle and Counts */}
        <div className="flex items-center gap-3">
          <div className="bg-card border border-border px-3.5 py-1.5 rounded-lg flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-text-secondary">
              Total: <span className="font-semibold text-text-primary font-tech">{total}</span>
            </span>
          </div>
          <div className="bg-card border border-border px-3.5 py-1.5 rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-secondary">
              Active: <span className="font-semibold text-text-primary font-tech">{active}</span>
            </span>
          </div>

          <button
            onClick={() => setActiveOnly(!activeOnly)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-default cursor-pointer ${
              activeOnly 
                ? 'bg-primary/10 text-primary border-primary/20 shadow-sm' 
                : 'bg-card text-text-secondary border-border hover:text-text-primary hover:border-border-hover'
            }`}
          >
            {activeOnly ? 'Showing Active' : 'Show All'}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full transition-default text-text-primary"
          />
        </div>
      </div>

      {/* Sessions Table Container */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-surface/30 border-b border-border text-text-muted">
                <th className="py-3 px-5 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold">User</th>
                <th className="py-3 px-5 font-semibold">Container ID</th>
                <th className="py-3 px-5 font-semibold">IP Address</th>
                <th className="py-3 px-5 font-semibold">Session Type</th>
                <th className="py-3 px-5 font-semibold">Duration / Started</th>
                <th className="py-3 px-5 font-semibold text-right">Connect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted">
                    No active sessions found
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = !session.ended_at;
                  return (
                    <tr key={session.id} className="border-b border-border/50 hover:bg-surface/20 transition-default group">
                      {/* Status indicator */}
                      <td className="py-3.5 px-5">
                        <span className={`status-badge ${isActive ? 'status-running' : 'status-stopped'}`}>
                          <span className="w-1 h-1 rounded-full bg-current" />
                          <span className="text-[10px] font-semibold">{isActive ? 'Active' : 'Ended'}</span>
                        </span>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-5 font-medium text-text-primary">
                        {session.username || 'admin'}
                      </td>

                      {/* Container */}
                      <td className="py-3.5 px-5 text-text-secondary font-mono">
                        #{session.container_id}
                      </td>

                      {/* IP */}
                      <td className="py-3.5 px-5 text-text-muted font-tech">
                        {session.ip_address || '—'}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          {session.session_type === 'terminal' ? (
                            <Monitor className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Wifi className="w-3.5 h-3.5 text-accent" />
                          )}
                          <span className="capitalize">{session.session_type}</span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-5 text-text-muted">
                        <div>
                          {isActive ? (
                            <span className="text-accent font-medium">Active</span>
                          ) : (
                            <span>Ended</span>
                          )}
                          <span className="text-text-muted/60 mx-1.5">•</span>
                          <span>{format(new Date(session.started_at), 'MMM d, HH:mm')}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => navigate(`/terminal/${session.container_id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface hover:bg-card border border-border hover:border-primary/50 text-text-secondary hover:text-text-primary rounded text-[10px] font-medium transition-default cursor-pointer"
                          title="Open Console"
                        >
                          <Terminal className="w-3 h-3 text-primary" />
                          <span>Console</span>
                          <ChevronRight className="w-3 h-3 text-text-muted" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </DashboardLayout>
  );
}
