import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import CreateContainerModal from '../components/containers/CreateContainerModal';
import { containersAPI } from '../api/client';
import {
  Plus, Search, Box, Play, Square, Terminal, Trash2,
  RotateCcw, Copy, Check
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border border-border bg-surface p-1 rounded">
          {[
            { key: 'all',     label: `All (${stats.total})` },
            { key: 'running', label: `Running (${stats.running})` },
            { key: 'stopped', label: `Stopped (${stats.stopped})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-fast
                ${filter === key ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary hover:bg-elevated'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search + Deploy */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search containers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-8 w-full text-xs"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary text-xs py-1.5 px-3 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Deploy Container
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Container</th>
                <th>Status</th>
                <th>Resources</th>
                <th className="hidden md:table-cell">Uptime</th>
                <th className="hidden lg:table-cell">SSH</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-text-muted">Loading containers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-text-muted">
                    No containers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isRunning = c.status === 'running';
                  const uptime = isRunning && c.created_at
                    ? formatDistanceToNow(new Date(c.created_at), { addSuffix: false })
                    : '—';

                  return (
                    <tr key={c.id}>
                      {/* Name */}
                      <td>
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-text-muted" />
                          <div>
                            <p className="font-semibold text-text-primary text-sm leading-tight">{c.name}</p>
                            <p className="text-[11px] text-text-muted font-mono leading-tight mt-0.5">{c.distro} · {c.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td><StatusBadge status={c.status} /></td>

                      {/* Resources */}
                      <td>
                        <span className="font-mono text-xs text-text-secondary">{c.cpu_cores}C / {c.ram_mb}M</span>
                      </td>

                      {/* Uptime */}
                      <td className="hidden md:table-cell">
                        <span className="text-xs text-text-muted">{uptime}</span>
                      </td>

                      {/* SSH */}
                      <td className="hidden lg:table-cell">
                        {c.ssh_enabled && c.ip_address ? (
                          <div className="flex items-center gap-1.5">
                            <code className="text-xs">{c.ip_address}</code>
                            <button
                              onClick={() => handleCopySSH(c)}
                              className="p-1 rounded text-text-muted hover:text-text-primary bg-elevated hover:bg-border transition-fast cursor-pointer border border-border"
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
                      <td>
                        <div className="flex items-center gap-1">
                          {isRunning ? (
                            <>
                              <button
                                onClick={() => handleAction(c.id, 'stop')}
                                className="btn btn-secondary text-[11px] px-2 py-1"
                                title="Stop"
                              >
                                <Square className="w-3 h-3" /> Stop
                              </button>
                              <button
                                onClick={() => handleAction(c.id, 'restart')}
                                className="btn btn-secondary text-[11px] px-2 py-1"
                                title="Restart"
                              >
                                <RotateCcw className="w-3 h-3" /> Restart
                              </button>
                              <button
                                onClick={() => navigate(`/terminal/${c.id}`)}
                                className="btn btn-secondary text-[11px] px-2 py-1"
                                title="Open Terminal"
                              >
                                <Terminal className="w-3 h-3" /> Console
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAction(c.id, 'start')}
                              className="btn btn-secondary text-[11px] px-2 py-1 text-success"
                              title="Start"
                            >
                              <Play className="w-3 h-3" /> Start
                            </button>
                          )}
                          <div className="w-px h-4 bg-border mx-1" />
                          <button
                            onClick={() => handleAction(c.id, 'delete')}
                            className="btn btn-danger text-[11px] px-2 py-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CreateContainerModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchContainers(); }}
        />
      )}
    </DashboardLayout>
  );
}
