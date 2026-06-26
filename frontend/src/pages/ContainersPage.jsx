import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import CreateContainerModal from '../components/containers/CreateContainerModal';
import { containersAPI } from '../api/client';
import { 
  Plus, Search, Filter, Box, Play, Square, Terminal, Trash2, 
  RotateCcw, Globe, Copy, Check, ShieldAlert
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function StatusBadge({ status }) {
  const styles = {
    running: 'status-running',
    stopped: 'status-stopped',
    starting: 'status-starting',
    error: 'status-error'
  };
  
  return (
    <span className={`status-badge ${styles[status] || 'status-stopped'}`}>
      <span className="w-1 h-1 rounded-full bg-current" />
      <span className="capitalize text-[10px] font-semibold">{status}</span>
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
      setStats({ 
        total: data.total || 0, 
        running: data.running || 0, 
        stopped: data.stopped || 0 
      });
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
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this container? This cannot be undone.')) return;
        await containersAPI.delete(id);
      } else if (action === 'start') {
        await containersAPI.start(id);
      } else if (action === 'stop') {
        await containersAPI.stop(id);
      } else if (action === 'restart') {
        await containersAPI.restart(id);
      } else if (action === 'reset') {
        if (!confirm('Reset will destroy and recreate this container. Continue?')) return;
        await containersAPI.reset(id);
      }
      fetchContainers();
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    }
  };

  const handleCopySSH = (container) => {
    const username = container.username || 'root';
    const ip = container.ip_address || '127.0.0.1';
    // Port mappings can be configured, default is 22 or a custom mapped SSH port. Let's assume port 22 or mock custom
    const sshCmd = `ssh ${username}@${ip}`;
    navigator.clipboard.writeText(sshCmd);
    setCopyingId(container.id);
    setTimeout(() => setCopyingId(null), 1500);
  };

  const filtered = containers
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
                 c.username.toLowerCase().includes(search.toLowerCase()) ||
                 c.distro.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Containers">
      
      {/* Filters and Actions header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Status filters */}
        <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-lg">
          {['all', 'running', 'stopped'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-default cursor-pointer ${
                filter === f
                  ? 'bg-card text-text-primary border border-border shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-card/50 border border-transparent'
              }`}
            >
              {f === 'all' ? `All (${stats.total})` :
               f === 'running' ? `Running (${stats.running})` :
               `Stopped (${stats.stopped})`}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, distro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full sm:w-60 transition-default text-text-primary"
            />
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover border border-primary/20 transition-default shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy</span>
          </button>
        </div>
      </div>

      {/* Main Containers Table */}
      {loading ? (
        <div className="bg-card border border-border rounded-xl p-16 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted mb-4">
            <Box className="w-5 h-5 opacity-40" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {containers.length === 0 ? 'No environments deployed' : 'No matching containers'}
          </h3>
          <p className="text-xs text-text-muted max-w-xs mb-6">
            {containers.length === 0 
              ? 'Provision your first isolated Linux container in seconds.' 
              : 'Try clearing your filters or adjusting your search term.'}
          </p>
          {containers.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-default shadow-sm border border-primary/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Sandbox Container
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface/30 border-b border-border text-text-muted">
                  <th className="py-3 px-5 font-semibold">Name & Distro</th>
                  <th className="py-3 px-5 font-semibold">Status</th>
                  <th className="py-3 px-5 font-semibold">CPU Allocation</th>
                  <th className="py-3 px-5 font-semibold">RAM Allocation</th>
                  <th className="py-3 px-5 font-semibold">Uptime</th>
                  <th className="py-3 px-5 font-semibold">SSH Connection</th>
                  <th className="py-3 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const isRunning = c.status === 'running';
                  const uptimeStr = isRunning && c.created_at
                    ? `Up ${formatDistanceToNow(new Date(c.created_at), { addSuffix: false })}`
                    : 'Stopped';
                  
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-surface/20 transition-default group">
                      {/* Name and OS */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 transition-colors">
                            <Box className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary flex items-center gap-1.5">
                              {c.name}
                              <span className="text-[10px] font-medium text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border">
                                {c.username}
                              </span>
                            </div>
                            <div className="text-[10px] text-text-muted mt-0.5 font-mono">{c.distro}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-5">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* CPU cores */}
                      <td className="py-3.5 px-5 text-text-secondary font-tech">
                        {c.cpu_cores} Cores
                      </td>

                      {/* RAM MB */}
                      <td className="py-3.5 px-5 text-text-secondary font-tech">
                        {c.ram_mb} MB
                      </td>

                      {/* Uptime */}
                      <td className="py-3.5 px-5 text-text-muted">
                        {uptimeStr}
                      </td>

                      {/* SSH Address Connection */}
                      <td className="py-3.5 px-5">
                        {c.ssh_enabled ? (
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-0.5 bg-surface border border-border rounded text-[10px] text-text-secondary font-tech">
                              {c.ip_address || '—'}
                            </code>
                            <button
                              onClick={() => handleCopySSH(c)}
                              className="p-1 rounded hover:bg-surface text-text-muted hover:text-text-primary border border-transparent hover:border-border transition-default cursor-pointer"
                              title="Copy SSH command"
                            >
                              {copyingId === c.id ? (
                                <Check className="w-3 h-3 text-success" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-muted italic">Disabled</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isRunning ? (
                            <>
                              <button
                                onClick={() => handleAction(c.id, 'stop')}
                                className="p-1.5 text-text-secondary hover:text-warning hover:bg-surface rounded border border-transparent hover:border-border transition-default cursor-pointer"
                                title="Stop container"
                              >
                                <Square className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleAction(c.id, 'restart')}
                                className="p-1.5 text-text-secondary hover:text-primary hover:bg-surface rounded border border-transparent hover:border-border transition-default cursor-pointer"
                                title="Restart container"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => navigate(`/terminal/${c.id}`)}
                                className="p-1.5 text-primary hover:text-primary-hover hover:bg-surface rounded border border-transparent hover:border-border transition-default cursor-pointer"
                                title="Launch console terminal"
                              >
                                <Terminal className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAction(c.id, 'start')}
                              className="p-1.5 text-text-secondary hover:text-success hover:bg-surface rounded border border-transparent hover:border-border transition-default cursor-pointer"
                              title="Start container"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="w-px h-3.5 bg-border mx-1" />
                          <button
                            onClick={() => handleAction(c.id, 'delete')}
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-surface rounded border border-transparent hover:border-border transition-default cursor-pointer"
                            title="Delete container"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Deploy Container Modal wrapper */}
      {showCreate && (
        <CreateContainerModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchContainers();
          }}
        />
      )}
    </DashboardLayout>
  );
}
