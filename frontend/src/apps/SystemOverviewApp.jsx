import { useState, useEffect, useRef } from 'react';
import { monitoringAPI, containersAPI, logsAPI } from '../api/client';
import { Box, Cpu, HardDrive, MemoryStick, Activity, Plus, Clock } from 'lucide-react';
import anime from 'animejs';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ icon: Icon, label, value, subtext, color, delay }) {
  const ref = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    if (ref.current) {
      anime({
        targets: ref.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: delay * 100,
        easing: 'easeOutExpo',
      });
    }
  }, [delay]);

  useEffect(() => {
    if (countRef.current && typeof value === 'number') {
      anime({
        targets: countRef.current,
        innerHTML: [0, value],
        round: 1,
        duration: 1200,
        delay: delay * 100 + 300,
        easing: 'easeOutExpo',
      });
    }
  }, [value, delay]);

  return (
    <div ref={ref} className="glass glass-hover p-5 cursor-default" style={{ opacity: 0 }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-bold text-text-primary" ref={countRef}>
        {typeof value === 'number' ? 0 : value}
      </div>
      {subtext && <p className="text-sm text-text-muted mt-1">{subtext}</p>}
    </div>
  );
}

function RecentActivity({ logs }) {
  const actionColors = {
    created: 'var(--color-accent)',
    started: 'var(--color-primary)',
    stopped: 'var(--color-warning)',
    deleted: 'var(--color-danger)',
    reset: 'var(--color-primary-light)',
    terminal_login: 'var(--color-accent-light)',
  };

  return (
    <div className="glass p-5">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Recent Activity
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">No activity yet</p>
        ) : (
          logs.map((log, i) => (
            <div key={log.id} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: actionColors[log.action] || 'var(--color-text-muted)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                  <span className="font-medium capitalize">{log.action.replace('_', ' ')}</span>
                  {log.container_name && (
                    <span className="text-text-secondary"> — {log.container_name}</span>
                  )}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function SystemOverviewApp() {
  const [overview, setOverview] = useState(null);
  const [containers, setContainers] = useState(null);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, containersRes, logsRes] = await Promise.all([
          monitoringAPI.overview(),
          containersAPI.list(),
          logsAPI.list({ limit: 10 }),
        ]);
        setOverview(overviewRes.data);
        setContainers(containersRes.data);
        setLogs(logsRes.data.logs);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Box}
          label="Total Containers"
          value={overview?.total_containers || 0}
          subtext={`${overview?.running_containers || 0} running`}
          color="var(--color-primary)"
          delay={0}
        />
        <StatCard
          icon={Activity}
          label="Running"
          value={overview?.running_containers || 0}
          subtext={`${overview?.stopped_containers || 0} stopped`}
          color="var(--color-accent)"
          delay={1}
        />
        <StatCard
          icon={Cpu}
          label="CPU Allocated"
          value={overview?.total_cpu_allocated || 0}
          subtext="cores total"
          color="var(--color-warning)"
          delay={2}
        />
        <StatCard
          icon={MemoryStick}
          label="RAM Allocated"
          value={overview?.total_ram_allocated_mb || 0}
          subtext="MB total"
          color="#8b5cf6"
          delay={3}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="glass p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/containers')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-default glass-hover text-text-primary"
              style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.1)' }}
            >
              <Plus className="w-4 h-4 text-primary" />
              Create New Container
            </button>
            <button
              onClick={() => navigate('/templates')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-default glass-hover text-text-primary"
              style={{ background: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)' }}
            >
              <HardDrive className="w-4 h-4 text-text-secondary" />
              Manage Templates
            </button>
          </div>

          {/* Container list mini */}
          {containers && containers.containers.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mt-6 mb-3">
                Containers
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {containers.containers.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'var(--color-glass-bg)' }}>
                    <div className={c.status === 'running' ? 'status-running' : 'status-stopped'} />
                    <span className="text-sm text-text-primary flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-text-muted font-mono">{c.distro}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <RecentActivity logs={logs} />
        </div>
      </div>
    </div>
  );
}
