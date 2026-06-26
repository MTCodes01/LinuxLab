import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import CreateContainerModal from '../components/containers/CreateContainerModal';
import { containersAPI } from '../api/client';
import {
  Plus, Search, Box, Play, Square, Terminal, Trash2,
  RotateCcw, Copy, Check, ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function StatusBadge({ status }) {
  const map = {
    running:  'status-running',
    stopped:  'status-stopped',
    starting: 'status-starting',
    error:    'status-error',
  };
  return (
    <span className={`status-badge ${map[status] || 'status-stopped'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="capitalize">{status}</span>
    </span>
  );
}

export default function ContainersPage() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, running: 0, stopped: 0 });
  const [copyingId, setCopyingId] = useState(null);
  const navigate = useNavigate();

  const fetchContainers = async () => {
    try {
      const { data } = await containersAPI.list();
      setContainers(data.containers || []);
      setStats({ total: data.total || 0, running: data.running || 0, stopped: data.stopped || 0 });
    } catch (err) {
      console.error('Failed to fetch containers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    if (window.location.search.includes('create=true')) {
      setShowCreate(true);
      window.history.replaceState({}, '', '/containers');
    }
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete' && !confirm('Delete this container? This cannot be undone.')) return;
      if (action === 'delete')  await containersAPI.delete(id);
      else if (action === 'start')   await containersAPI.start(id);
      else if (action === 'stop')    await containersAPI.stop(id);
      else if (action === 'restart') await containersAPI.restart(id);
      else if (action === 'reset') {
        if (!confirm('Reset will destroy and recreate this container. Continue?')) return;
        await containersAPI.reset(id);
      }
      fetchContainers();
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    }
  };

  const handleCopySSH = (container) => {
    const sshCmd = `ssh ${container.username || 'root'}@${container.ip_address || '127.0.0.1'}`;
    navigator.clipboard.writeText(sshCmd);
    setCopyingId(container.id);
    setTimeout(() => setCopyingId(null), 1500);
  };

  const filtered = containers
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.distro.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <DashboardLayout>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="pill-tabs">
          {[
            { key: 'all',     label: `All (${stats.total})` },
            { key: 'running', label: `Running (${stats.running})` },
            { key: 'stopped', label: `Stopped (${stats.stopped})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`pill-tab ${filter === key ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search + Deploy */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search containers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-9 w-full"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Deploy
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card flex items-center justify-center h-64">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Box className="w-7 h-7 text-text-muted opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-1">
            {containers.length === 0 ? 'No containers deployed' : 'No matching containers'}
          </h3>
          <p className="text-sm text-text-muted max-w-sm mb-6">
            {containers.length === 0
              ? 'Provision your first isolated Linux environment in seconds.'
              : 'Try adjusting your search or filter.'}
          </p>
          {containers.length === 0 && (
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Deploy Container
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Container</th>
                  <th>Status</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th className="hidden md:table-cell">Uptime</th>
                  <th className="hidden lg:table-cell">SSH</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const isRunning = c.status === 'running';
                  const uptime = isRunning && c.created_at
                    ? formatDistanceToNow(new Date(c.created_at), { addSuffix: false })
                    : '—';

                  return (
                    <tr key={c.id} className="group">
                      {/* Name */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-default">
                            <Box className="w-4 h-4 text-text-muted group-hover:text-primary transition-default" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary text-sm">{c.name}</p>
                            <p className="text-xs text-text-muted font-mono">{c.distro} · {c.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td><StatusBadge status={c.status} /></td>

                      {/* CPU */}
                      <td>
                        <span className="font-mono text-sm text-text-secondary">{c.cpu_cores} Cores</span>
                      </td>

                      {/* RAM */}
                      <td>
                        <span className="font-mono text-sm text-text-secondary">{c.ram_mb} MB</span>
                      </td>

                      {/* Uptime */}
                      <td className="hidden md:table-cell">
                        <span className="text-sm text-text-muted">{uptime}</span>
                      </td>

                      {/* SSH */}
                      <td className="hidden lg:table-cell">
                        {c.ssh_enabled && c.ip_address ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs">{c.ip_address}</code>
                            <button
                              onClick={() => handleCopySSH(c)}
                              className="p-1 rounded text-text-muted hover:text-text-primary transition-default cursor-pointer"
                              title="Copy SSH command"
                            >
                              {copyingId === c.id
                                ? <Check className="w-3.5 h-3.5 text-success" />
                                : <Copy className="w-3.5 h-3.5" />
                              }
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted italic">Disabled</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-default">
                          {isRunning ? (
                            <>
                              <button
                                onClick={() => handleAction(c.id, 'stop')}
                                className="btn btn-ghost p-1.5 hover:text-warning"
                                title="Stop"
                              >
                                <Square className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(c.id, 'restart')}
                                className="btn btn-ghost p-1.5 hover:text-primary"
                                title="Restart"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/terminal/${c.id}`)}
                                className="btn btn-ghost p-1.5 hover:text-primary"
                                title="Open Terminal"
                              >
                                <Terminal className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAction(c.id, 'start')}
                              className="btn btn-ghost p-1.5 hover:text-success"
                              title="Start"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <div className="w-px h-4 bg-border mx-0.5" />
                          <button
                            onClick={() => handleAction(c.id, 'delete')}
                            className="btn btn-ghost p-1.5 btn-danger"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateContainerModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchContainers(); }}
        />
      )}
    </DashboardLayout>
  );
}
