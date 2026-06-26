import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { sessionsAPI } from '../api/client';
import { formatDistanceToNow, format } from 'date-fns';
import { Users, Monitor, Wifi, Clock, Terminal, Search } from 'lucide-react';
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

  useEffect(() => { fetchSessions(); }, [activeOnly]);

  const filteredSessions = sessions.filter(s => {
    const term = search.toLowerCase();
    return (
      (s.username || 'admin').toLowerCase().includes(term) ||
      `container #${s.container_id}`.toLowerCase().includes(term) ||
      (s.ip_address || '').toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">

        {/* Stats + toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Total */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3.5 py-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-secondary">
              Total: <span className="font-bold text-text-primary font-mono">{total}</span>
            </span>
          </div>
          {/* Active */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3.5 py-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-sm text-text-secondary">
              Active: <span className="font-bold text-text-primary font-mono">{active}</span>
            </span>
          </div>
          {/* Active-only toggle */}
          <button
            onClick={() => setActiveOnly(!activeOnly)}
            className={`btn text-sm ${activeOnly ? 'btn-primary' : 'btn-secondary'}`}
          >
            {activeOnly ? 'Active Only' : 'Show All'}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-9 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>User</th>
                <th className="hidden sm:table-cell">Container</th>
                <th className="hidden md:table-cell">IP</th>
                <th>Type</th>
                <th className="hidden lg:table-cell">Started</th>
                <th className="text-right">Connect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-8 h-8 text-text-muted opacity-30" />
                      <p className="text-sm text-text-muted">No sessions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSessions.map(session => {
                  const isActive = !session.ended_at;
                  return (
                    <tr key={session.id} className="group">
                      {/* Status */}
                      <td>
                        <span className={`status-badge ${isActive ? 'status-running' : 'status-stopped'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {isActive ? 'Active' : 'Ended'}
                        </span>
                      </td>

                      {/* User */}
                      <td>
                        <span className="font-semibold text-text-primary text-sm">
                          {session.username || 'admin'}
                        </span>
                      </td>

                      {/* Container */}
                      <td className="hidden sm:table-cell">
                        <span className="font-mono text-sm text-text-secondary">
                          #{session.container_id}
                        </span>
                      </td>

                      {/* IP */}
                      <td className="hidden md:table-cell">
                        <span className="font-mono text-sm text-text-muted">
                          {session.ip_address || '—'}
                        </span>
                      </td>

                      {/* Type */}
                      <td>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          {session.session_type === 'terminal' ? (
                            <Monitor className="w-4 h-4 text-primary" />
                          ) : (
                            <Wifi className="w-4 h-4 text-accent" />
                          )}
                          <span className="capitalize hidden sm:inline">{session.session_type}</span>
                        </div>
                      </td>

                      {/* Started */}
                      <td className="hidden lg:table-cell">
                        <span className="text-sm text-text-muted">
                          {format(new Date(session.started_at), 'MMM d, HH:mm')}
                        </span>
                      </td>

                      {/* Connect */}
                      <td className="text-right">
                        <button
                          onClick={() => navigate(`/terminal/${session.container_id}`)}
                          className="btn btn-secondary text-xs gap-1.5"
                        >
                          <Terminal className="w-3.5 h-3.5 text-primary" />
                          Console
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
