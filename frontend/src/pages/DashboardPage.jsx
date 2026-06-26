import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { monitoringAPI, containersAPI, logsAPI } from '../api/client';
import {
  Box, Cpu, HardDrive, Activity, Play, Square, Terminal, Trash2,
  Clock, Plus, Shield, Settings, FileText, TrendingUp, ArrowUpRight,
  Zap, Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="capitalize">{status}</span>
    </span>
  );
}

/* ─── Stat Card ─── */
function StatCard({ title, value, subtitle, icon: Icon, iconColor, accentColor, trend, index }) {
  return (
    <div
      className="stat-card animate-slide-up group cursor-default"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-default"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-text-primary font-mono tracking-tight leading-none mb-1">
        {value}
      </p>
      <p className="text-sm font-semibold text-text-secondary">{title}</p>
      {subtitle && (
        <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

/* ─── Mini sparkline ─── */
function Sparkline({ d, color }) {
  return (
    <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L120,40 L0,40 Z`}
        fill={`url(#sg-${color.replace('#','')})`}
      />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Resource Gauge ─── */
function ResourceBar({ label, value, max, unit, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>
          {value} {unit} <span className="text-text-muted font-normal">/ {max} {unit}</span>
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-xs text-text-muted mt-1">{pct}% utilized</p>
    </div>
  );
}

/* ─── Page ─── */
export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [containers, setContainers] = useState([]);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, containersRes, logsRes] = await Promise.all([
          monitoringAPI.overview(),
          containersAPI.list(),
          logsAPI.list({ limit: 8 }),
        ]);
        setOverview(overviewRes.data);
        setContainers(containersRes.data?.containers || []);
        setLogs(logsRes.data?.logs || []);
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
  const totalDisk  = 500;

  const cpuAllocated  = overview?.total_cpu_allocated || 0;
  const ramAllocatedGB = Math.round((overview?.total_ram_allocated_mb || 0) / 1024);
  const diskAllocated = containers.reduce((a, c) => a + (c.storage_limit || 10), 0);
  const runningCount  = overview?.running_containers || 0;
  const totalCount    = overview?.total_containers || 0;
  const stoppedCount  = totalCount - runningCount;

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

  const logActionColor = {
    created:       '#10B981',
    started:       '#8B5CF6',
    stopped:       '#F59E0B',
    deleted:       '#EF4444',
    reset:         '#3B82F6',
    terminal_login:'#06B6D4',
    ssh_login:     '#C084FC',
  };

  return (
    <DashboardLayout>
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          index={0}
          title="Running"
          value={runningCount}
          subtitle="Active containers"
          icon={Activity}
          accentColor="#10B981"
          trend="+2 today"
        />
        <StatCard
          index={1}
          title="Stopped"
          value={stoppedCount}
          subtitle="Idle containers"
          icon={Square}
          accentColor="#6B7280"
        />
        <StatCard
          index={2}
          title="CPU Allocated"
          value={`${cpuAllocated}`}
          subtitle={`of ${totalCores} cores`}
          icon={Cpu}
          accentColor="#8B5CF6"
        />
        <StatCard
          index={3}
          title="RAM Committed"
          value={`${ramAllocatedGB} GB`}
          subtitle={`of ${totalRamGB} GB`}
          icon={HardDrive}
          accentColor="#C084FC"
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left: Charts + Table (2/3) */}
        <div className="xl:col-span-2 space-y-5">

          {/* Resource utilization */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-text-primary">Resource Utilization</h2>
                <p className="text-xs text-text-muted mt-0.5">Allocated vs total system capacity</p>
              </div>
              <span className="text-xs text-text-muted bg-surface border border-border px-2.5 py-1 rounded-full font-mono">
                Live
              </span>
            </div>

            <div className="space-y-5">
              <ResourceBar label="CPU Cores" value={cpuAllocated} max={totalCores} unit="cores" color="#8B5CF6" />
              <ResourceBar label="Memory" value={ramAllocatedGB} max={totalRamGB} unit="GB" color="#C084FC" />
              <ResourceBar label="Disk Storage" value={diskAllocated} max={totalDisk} unit="GB" color="#10B981" />
            </div>
          </div>

          {/* Containers table */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-text-primary">Recent Containers</h2>
                <p className="text-xs text-text-muted mt-0.5">Latest deployed environments</p>
              </div>
              <button
                onClick={() => navigate('/containers')}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-default"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Container</th>
                    <th>Status</th>
                    <th className="hidden sm:table-cell">Resources</th>
                    <th className="hidden md:table-cell">IP</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.slice(0, 6).map((c) => (
                    <tr key={c.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-default">
                            <Box className="w-4 h-4 text-text-muted group-hover:text-primary transition-default" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary text-sm">{c.name}</p>
                            <p className="text-xs text-text-muted font-mono">{c.distro}</p>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                      <td className="hidden sm:table-cell">
                        <span className="font-mono text-xs">{c.cpu_cores}c / {c.ram_mb}MB</span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="font-mono text-xs">{c.ip_address || '—'}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-default">
                          {c.status === 'running' ? (
                            <button
                              onClick={() => handleAction(c.id, 'stop')}
                              className="btn btn-ghost p-1.5 hover:text-warning"
                              title="Stop"
                            >
                              <Square className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(c.id, 'start')}
                              className="btn btn-ghost p-1.5 hover:text-success"
                              title="Start"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/terminal/${c.id}`)}
                            className="btn btn-ghost p-1.5 hover:text-primary"
                            title="Terminal"
                          >
                            <Terminal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {containers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center">
                            <Box className="w-6 h-6 text-text-muted opacity-40" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-secondary">No containers yet</p>
                            <p className="text-xs text-text-muted mt-0.5">Deploy your first environment</p>
                          </div>
                          <button
                            onClick={() => navigate('/containers?create=true')}
                            className="btn btn-primary text-sm mt-1"
                          >
                            <Plus className="w-4 h-4" /> Deploy Container
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Quick actions + Activity (1/3) */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <div className="card p-5">
            <h2 className="text-base font-bold text-text-primary mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'New Container',   icon: Plus,     path: '/containers?create=true', color: '#8B5CF6' },
                { label: 'Browse Templates', icon: Zap,      path: '/templates',              color: '#C084FC' },
                { label: 'SSH Keys',        icon: Shield,   path: '/settings?tab=ssh',       color: '#10B981' },
                { label: 'View Logs',       icon: FileText, path: '/logs',                   color: '#F59E0B' },
                { label: 'Settings',        icon: Settings, path: '/settings',               color: '#6B7280' },
              ].map(({ label, icon: Icon, path, color }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg
                    bg-surface border border-border
                    hover:border-primary/30 hover:bg-primary/5
                    text-text-secondary hover:text-text-primary
                    text-sm font-medium transition-default group text-left cursor-pointer"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-default"
                    style={{ background: `${color}15` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  {label}
                  <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-default" />
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-text-primary">Recent Activity</h2>
            </div>

            <div className="p-4 space-y-1 flex-1 overflow-y-auto max-h-80">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                  <Activity className="w-6 h-6 mb-2 opacity-30" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                logs.slice(0, 8).map((log, i) => {
                  const dotColor = logActionColor[log.action] || '#6B7280';
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-default"
                    >
                      {/* Timeline dot */}
                      <div className="relative flex-shrink-0 mt-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}80` }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary capitalize leading-tight">
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        {log.container_name && (
                          <p className="text-xs text-text-secondary mt-0.5 font-mono truncate">
                            {log.container_name}
                          </p>
                        )}
                        <p className="text-xs text-text-muted mt-0.5">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {logs.length > 0 && (
              <div className="px-5 py-3 border-t border-border">
                <button
                  onClick={() => navigate('/logs')}
                  className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1.5 transition-default"
                >
                  View all activity <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
