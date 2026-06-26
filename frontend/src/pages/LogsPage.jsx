import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { logsAPI } from '../api/client';
import { formatDistanceToNow, format } from 'date-fns';
import { FileText, Search, Clock } from 'lucide-react';

const actionConfig = {
  created:       { label: 'Created',       color: '#10B981' },
  started:       { label: 'Started',       color: '#8B5CF6' },
  stopped:       { label: 'Stopped',       color: '#F59E0B' },
  deleted:       { label: 'Deleted',       color: '#EF4444' },
  reset:         { label: 'Reset',         color: '#3B82F6' },
  terminal_login:{ label: 'Console Login', color: '#06B6D4' },
  ssh_login:     { label: 'SSH Login',     color: '#C084FC' },
};

function ActionBadge({ action }) {
  const cfg = actionConfig[action] || { label: action, color: '#6B7280' };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border"
      style={{
        color: cfg.color,
        background: `${cfg.color}12`,
        borderColor: `${cfg.color}25`,
      }}
    >
      {cfg.label}
    </span>
  );
}

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const limit = 15;

  const fetchLogs = () => {
    setLoading(true);
    logsAPI.list({ limit, offset: page * limit, action: filter })
      .then(({ data }) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [filter, page]);
  useEffect(() => {
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [filter, page]);

  const totalPages = Math.ceil(total / limit);
  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return (
      (log.container_name || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term) ||
      ((actionConfig[log.action]?.label || log.action || '').toLowerCase()).includes(term)
    );
  });

  return (
    <DashboardLayout>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-9 w-full"
          />
        </div>

        {/* Action filter pills */}
        <div className="pill-tabs flex-wrap">
          <button
            onClick={() => { setFilter(null); setPage(0); }}
            className={`pill-tab ${!filter ? 'active' : ''}`}
          >
            All ({total})
          </button>
          {Object.entries(actionConfig).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(0); }}
              className={`pill-tab ${filter === key ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Container</th>
                <th className="hidden md:table-cell">Details</th>
                <th>Time</th>
                <th className="hidden lg:table-cell text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-14">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-8 h-8 text-text-muted opacity-30" />
                      <p className="text-sm text-text-muted">No logs match the criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td><ActionBadge action={log.action} /></td>
                    <td>
                      <span className="font-mono font-semibold text-text-primary text-sm">
                        {log.container_name || '—'}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-sm text-text-secondary max-w-xs truncate block">
                        {log.details || 'System operation.'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Clock className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell text-right">
                      <span className="font-mono text-xs text-text-muted">
                        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface/30">
            <span className="text-sm text-text-muted">
              Page <span className="font-semibold text-text-secondary">{page + 1}</span> of{' '}
              <span className="font-semibold text-text-secondary">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="btn btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
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
