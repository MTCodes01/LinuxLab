import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ContainerCard from '../components/containers/ContainerCard';
import CreateContainerModal from '../components/containers/CreateContainerModal';
import { containersAPI } from '../api/client';
import { Plus, Search, Filter, Box } from 'lucide-react';

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

  const filtered = containers
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
                 c.username.toLowerCase().includes(search.toLowerCase()) ||
                 c.distro.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Containers">
      {/* Header with stats and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-1.5 p-1.5 bg-surface/50 backdrop-blur-md border border-border rounded-xl">
          {['all', 'running', 'stopped'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-default ${
                filter === f
                  ? 'bg-card shadow-sm text-text-primary border border-border/50'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface/50 border border-transparent'
              }`}
            >
              {f === 'all' ? `All (${stats.total})` :
               f === 'running' ? `Running (${stats.running})` :
               `Stopped (${stats.stopped})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Filter containers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface/50 hover:bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 w-full sm:w-64 transition-default text-text-primary shadow-sm"
            />
          </div>

          {/* Create button */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-default shadow-[0_0_15px_rgba(124,58,237,0.2)] border border-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Container</span>
          </button>
        </div>
      </div>

      {/* Container grid */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(124,58,237,0.3)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 animate-fade-in border border-dashed border-border rounded-2xl bg-surface/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/20" />
          <div className="w-16 h-16 rounded-2xl bg-surface/50 border border-border mx-auto mb-6 flex items-center justify-center text-text-muted shadow-sm relative z-10">
            {containers.length === 0 ? <Box className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
          </div>
          <p className="text-text-primary font-medium text-lg mb-2 relative z-10">
            {containers.length === 0 ? 'No containers yet' : 'No matching containers'}
          </p>
          <p className="text-text-secondary text-sm mb-8 relative z-10">
            {containers.length === 0 ? 'Create your first Linux environment to get started.' : 'Try adjusting your search filters.'}
          </p>
          {containers.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-default shadow-[0_0_20px_rgba(124,58,237,0.25)] border border-primary/20 relative z-10"
            >
              <Plus className="w-4 h-4" />
              Create Container
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
