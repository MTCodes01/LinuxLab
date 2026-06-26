import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { monitoringAPI, containersAPI } from '../api/client';
import { Box, Play, Square, Terminal, Trash2, Cpu, HardDrive, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Helpers ─── */
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

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [containers, setContainers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, containersRes] = await Promise.all([
          monitoringAPI.overview(),
          containersAPI.list(),
        ]);
        setOverview(overviewRes.data);
        setContainers(containersRes.data?.containers || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalCores = 64;
  const totalRamGB = 256;
  
  const cpuAllocated  = overview?.total_cpu_allocated || 0;
  const ramAllocatedGB = Math.round((overview?.total_ram_allocated_mb || 0) / 1024);

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete' && !confirm('Delete this container?')) return;
      if (action === 'delete')  await containersAPI.delete(id);
      if (action === 'start')   await containersAPI.start(id);
      if (action === 'stop')    await containersAPI.stop(id);
      const { data } = await containersAPI.list();
      setContainers(data.containers || []);
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    }
  };

  return (
    <DashboardLayout>
      {/* ── System Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <Server className="w-8 h-8 text-primary" />
          <div>
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Containers</p>
            <p className="text-xl font-bold text-text-primary">
              {overview?.running_containers || 0} <span className="text-sm font-normal text-text-muted">running</span>
              {' / '}
              {overview?.total_containers || 0} <span className="text-sm font-normal text-text-muted">total</span>
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <Cpu className="w-8 h-8 text-accent" />
          <div>
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">CPU Allocated</p>
            <p className="text-xl font-bold text-text-primary">
              {cpuAllocated} <span className="text-sm font-normal text-text-muted">/ {totalCores} Cores</span>
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <HardDrive className="w-8 h-8 text-success" />
          <div>
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">RAM Allocated</p>
            <p className="text-xl font-bold text-text-primary">
              {ramAllocatedGB} <span className="text-sm font-normal text-text-muted">/ {totalRamGB} GB</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Containers Overview ── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-elevated border-b border-border">
          <h2 className="text-sm font-bold text-text-primary">Container List</h2>
          <button
            onClick={() => navigate('/containers?create=true')}
            className="btn btn-primary text-xs py-1 px-2"
          >
            Add Container
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>State</th>
                <th>Image</th>
                <th>IP Address</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {containers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-text-muted">
                    No containers found.
                  </td>
                </tr>
              ) : (
                containers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-text-muted" />
                        <span className="font-semibold text-text-primary text-sm">{c.name}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <span className="font-mono text-xs">{c.distro}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs">{c.ip_address || '-'}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {c.status === 'running' ? (
                          <button
                            onClick={() => handleAction(c.id, 'stop')}
                            className="btn btn-secondary text-xs px-2 py-1"
                            title="Stop"
                          >
                            <Square className="w-3.5 h-3.5" /> Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(c.id, 'start')}
                            className="btn btn-secondary text-xs px-2 py-1 text-success"
                            title="Start"
                          >
                            <Play className="w-3.5 h-3.5" /> Start
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/terminal/${c.id}`)}
                          className="btn btn-secondary text-xs px-2 py-1"
                          title="Console"
                        >
                          <Terminal className="w-3.5 h-3.5" /> Console
                        </button>
                        <button
                          onClick={() => handleAction(c.id, 'delete')}
                          className="btn btn-danger text-xs px-2 py-1"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
