import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { sessionsAPI } from '../api/client';
import { formatDistanceToNow, format } from 'date-fns';
import { Users, Monitor, Wifi, Clock } from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    sessionsAPI.list({ limit: 100, active_only: activeOnly })
      .then(({ data }) => {
        setSessions(data.sessions);
        setTotal(data.total);
        setActive(data.active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeOnly]);

  return (
    <DashboardLayout title="Sessions">
      {/* Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="glass px-4 py-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm text-text-secondary">Total: <span className="font-semibold text-text-primary">{total}</span></span>
        </div>
        <div className="glass px-4 py-2 flex items-center gap-2">
          <div className="status-running" />
          <span className="text-sm text-text-secondary">Active: <span className="font-semibold text-accent">{active}</span></span>
        </div>
        <button
          onClick={() => setActiveOnly(!activeOnly)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-default ${
            activeOnly ? 'text-primary' : 'text-text-secondary'
          }`}
          style={activeOnly ? {
            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)'
          } : {
            background: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)'
          }}
        >
          {activeOnly ? 'Showing Active Only' : 'Show All'}
        </button>
      </div>

      {/* Sessions table */}
      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-surface-700)' }}>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Container</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">IP Address</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Started</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Duration</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-text-muted">Loading...</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-text-muted">No sessions found</td></tr>
            ) : sessions.map((session) => (
              <tr key={session.id} className="border-t transition-default hover:bg-surface-700/30" style={{ borderColor: 'var(--color-glass-border)' }}>
                <td className="px-4 py-3">
                  <div className={session.ended_at ? 'status-stopped' : 'status-running'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {session.session_type === 'terminal' ? <Monitor className="w-3.5 h-3.5 text-primary" /> : <Wifi className="w-3.5 h-3.5 text-accent" />}
                    <span className="capitalize text-text-primary">{session.session_type}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-primary font-mono text-xs">#{session.container_id}</td>
                <td className="px-4 py-3 text-text-muted font-mono text-xs">{session.ip_address || '—'}</td>
                <td className="px-4 py-3 text-text-muted text-xs">{format(new Date(session.started_at), 'MMM d, HH:mm')}</td>
                <td className="px-4 py-3 text-text-muted text-xs">
                  {session.ended_at
                    ? formatDistanceToNow(new Date(session.started_at))
                    : <span className="text-accent">Active</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
