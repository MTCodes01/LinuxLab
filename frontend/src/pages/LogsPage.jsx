import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { logsAPI } from '../api/client';
import { formatDistanceToNow, format } from 'date-fns';
import { FileText, Search, Download, Clock, Info } from 'lucide-react';

const actionBadgeStyles = {
  created: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  started: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  stopped: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  deleted: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  reset: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  terminal_login: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ssh_login: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const actionLabels = {
  created: 'Created',
  started: 'Started',
  stopped: 'Stopped',
  deleted: 'Deleted',
  reset: 'Reset',
  terminal_login: 'Console Login',
  ssh_login: 'SSH Login',
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const limit = 15; // clean pagination limit

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

  useEffect(() => {
    fetchLogs();
  }, [filter, page]);

  // Auto-refresh logs
  useEffect(() => {
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [filter, page]);

  const actions = Object.keys(actionLabels);
  const totalPages = Math.ceil(total / limit);

  // Client-side search filtering
  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    const name = (log.container_name || '').toLowerCase();
    const details = (log.details || '').toLowerCase();
    const action = (actionLabels[log.action] || log.action || '').toLowerCase();
    return name.includes(term) || details.includes(term) || action.includes(term);
  });

  return (
    <DashboardLayout title="Activity Logs">
      
      {/* Search & Event Filters Row */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search event logs by container name or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full transition-default text-text-primary"
          />
        </div>

        {/* Action Badge Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface border border-border rounded-lg w-fit">
          <button
            onClick={() => { setFilter(null); setPage(0); }}
            className={`px-3 py-1 rounded text-xs font-semibold transition-default cursor-pointer ${
              !filter 
                ? 'bg-card text-text-primary border border-border shadow-sm' 
                : 'text-text-secondary hover:text-text-primary hover:bg-card/50 border border-transparent'
            }`}
          >
            All Logs ({total})
          </button>
          {actions.map((act) => (
            <button
              key={act}
              onClick={() => { setFilter(act); setPage(0); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-default cursor-pointer ${
                filter === act 
                  ? 'bg-card text-text-primary border border-border shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-card/50 border border-transparent'
              }`}
            >
              {actionLabels[act]}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table Container */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-surface/30 border-b border-border text-text-muted">
                <th className="py-3 px-5 font-semibold">Event Type</th>
                <th className="py-3 px-5 font-semibold">Container</th>
                <th className="py-3 px-5 font-semibold">Details</th>
                <th className="py-3 px-5 font-semibold">Time Elapsed</th>
                <th className="py-3 px-5 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-6 h-6 mb-2 text-text-muted opacity-30" />
                      <p>No activity logs match the criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badgeStyle = actionBadgeStyles[log.action] || 'bg-zinc-800 text-text-muted border-zinc-700/50';
                  const label = actionLabels[log.action] || log.action;
                  
                  return (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-surface/20 transition-default">
                      {/* Badge */}
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-semibold tracking-wide uppercase ${badgeStyle}`}>
                          {label}
                        </span>
                      </td>

                      {/* Container */}
                      <td className="py-3 px-5 font-semibold text-text-primary font-tech">
                        {log.container_name || '—'}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-5 text-text-secondary max-w-sm truncate">
                        {log.details || 'System operation executed.'}
                      </td>

                      {/* Time Relative */}
                      <td className="py-3 px-5 text-text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-text-muted/60" />
                          <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                        </div>
                      </td>

                      {/* Time Absolute */}
                      <td className="py-3 px-5 text-text-muted text-right font-tech">
                        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface/10">
            <span className="text-[11px] text-text-muted">
              Page <span className="font-semibold text-text-secondary">{page + 1}</span> of <span className="font-semibold text-text-secondary">{totalPages}</span>
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 bg-surface hover:bg-card border border-border text-text-secondary hover:text-text-primary rounded-lg text-[11px] font-medium transition-default disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 bg-surface hover:bg-card border border-border text-text-secondary hover:text-text-primary rounded-lg text-[11px] font-medium transition-default disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
