import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { logsAPI } from '../api/client';
import { formatDistanceToNow, format } from 'date-fns';
import { FileText, Filter, Download } from 'lucide-react';

const actionColors = {
  created: 'var(--color-accent)',
  started: 'var(--color-primary)',
  stopped: 'var(--color-warning)',
  deleted: 'var(--color-danger)',
  reset: 'var(--color-primary-light)',
  terminal_login: 'var(--color-accent-light)',
  ssh_login: '#8b5cf6',
};

const actionLabels = {
  created: 'Created',
  started: 'Started',
  stopped: 'Stopped',
  deleted: 'Deleted',
  reset: 'Reset',
  terminal_login: 'Terminal Login',
  ssh_login: 'SSH Login',
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [page, setPage] = useState(0);
  const limit = 25;

  const fetchLogs = () => {
    setLoading(true);
    logsAPI.list({ limit, offset: page * limit, action: filter })
      .then(({ data }) => {
        setLogs(data.logs);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [filter, page]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [filter, page]);

  const actions = Object.keys(actionLabels);
  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout title="Activity Logs">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => { setFilter(null); setPage(0); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-default ${!filter ? 'text-primary' : 'text-text-secondary'}`}
          style={!filter ? { background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' } : { background: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)' }}
        >
          All ({total})
        </button>
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => { setFilter(action); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-default ${filter === action ? 'text-primary' : 'text-text-secondary'}`}
            style={filter === action ? { background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' } : { background: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)' }}
          >
            {actionLabels[action]}
          </button>
        ))}
      </div>

      {/* Logs timeline */}
      <div className="glass p-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No activity logs found</p>
          </div>
        ) : (
          <div className="space-y-0">
            {logs.map((log, i) => (
              <div
                key={log.id}
                className="flex items-start gap-4 py-3 animate-slide-up"
                style={{
                  animationDelay: `${i * 30}ms`,
                  borderBottom: i < logs.length - 1 ? '1px solid var(--color-glass-border)' : 'none',
                }}
              >
                {/* Timeline dot */}
                <div className="mt-1.5 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full" style={{ background: actionColors[log.action] || 'var(--color-text-muted)', boxShadow: `0 0 8px ${actionColors[log.action] || 'transparent'}40` }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: `${actionColors[log.action]}15`, color: actionColors[log.action] }}
                    >
                      {actionLabels[log.action] || log.action}
                    </span>
                    {log.container_name && (
                      <span className="text-sm text-text-primary font-medium">{log.container_name}</span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-xs text-text-muted mt-1">{log.details}</p>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-text-muted">{format(new Date(log.timestamp), 'HH:mm:ss')}</p>
                  <p className="text-xs text-text-muted">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t" style={{ borderColor: 'var(--color-glass-border)' }}>
            <span className="text-xs text-text-muted">Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary transition-default disabled:opacity-50"
                style={{ background: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)' }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary transition-default disabled:opacity-50"
                style={{ background: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
