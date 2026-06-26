import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ContainerCard from '../components/containers/ContainerCard';
import CreateContainerModal from '../components/containers/CreateContainerModal';
import { containersAPI } from '../api/client';
import { Plus, Search, Filter } from 'lucide-react';

export default function ContainersPage() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, running: 0, stopped: 0 });

  const fetchContainers = async () => {
    try {
      const { data } = await containersAPI.list();
      setContainers(data.containers);
      setStats({ total: data.total, running: data.running, stopped: data.stopped });
    } catch (err) {
      console.error('Failed to fetch containers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
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

  const filtered = containers
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
                 c.username.toLowerCase().includes(search.toLowerCase()) ||
                 c.distro.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Containers">
      {/* Header with stats and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Filter pills */}
          {['all', 'running', 'stopped'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-default ${
                filter === f
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              style={filter === f ? {
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
              } : {
                background: 'var(--color-glass-bg)',
                border: '1px solid var(--color-glass-border)',
              }}
            >
              {f === 'all' ? `All (${stats.total})` :
               f === 'running' ? `Running (${stats.running})` :
               `Stopped (${stats.stopped})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48 transition-default"
              style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-glass-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Create button */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:brightness-110 transition-default"
          >
            <Plus className="w-4 h-4" />
            New Container
          </button>
        </div>
      </div>

      {/* Container grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center opacity-50">
            <Filter className="w-8 h-8 text-white" />
          </div>
          <p className="text-text-secondary text-lg mb-2">
            {containers.length === 0 ? 'No containers yet' : 'No matching containers'}
          </p>
          <p className="text-text-muted text-sm mb-6">
            {containers.length === 0 ? 'Create your first Linux environment' : 'Try adjusting your filters'}
          </p>
          {containers.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:brightness-110 transition-default"
            >
              <Plus className="w-4 h-4" />
              Create Container
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((container, i) => (
            <ContainerCard
              key={container.id}
              container={container}
              onAction={handleAction}
              delay={i}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
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
