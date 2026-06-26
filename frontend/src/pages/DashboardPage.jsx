import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { monitoringAPI, containersAPI, logsAPI } from '../api/client';
import { Box, Cpu, HardDrive, Activity, Play, Square, RotateCcw, Trash2, MoreVertical, Terminal, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ title, value, subtitle, progress, icon: Icon, colorClass }) {
  return (
    <div className="stat-card p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div>
        {progress !== undefined ? (
          <div className="w-full bg-surface rounded-full h-1.5 mt-2 overflow-hidden">
            <div className={`h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}`} style={{ width: `${progress}%` }} />
          </div>
        ) : null}
        {subtitle && (
          <p className="text-sm text-text-muted mt-2 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    running: 'status-running',
    stopped: 'status-stopped',
    starting: 'status-starting',
    error: 'status-error'
  };
  
  return (
    <span className={`status-badge ${styles[status] || 'status-stopped'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="capitalize">{status}</span>
    </span>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [containers, setContainers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, containersRes, logsRes] = await Promise.all([
          monitoringAPI.overview(),
          containersAPI.list(),
          logsAPI.list({ limit: 10 }),
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

  const totalCores = 64; // mock total
  const totalRam = 256 * 1024; // 256GB mock total

  const cpuProgress = overview?.total_cpu_allocated ? Math.round((overview.total_cpu_allocated / totalCores) * 100) : 0;
  const ramProgress = overview?.total_ram_allocated_mb ? Math.round((overview.total_ram_allocated_mb / totalRam) * 100) : 0;
  const runningPercent = overview?.total_containers ? Math.round((overview.running_containers / overview.total_containers) * 100) : 0;

  return (
    <DashboardLayout title="Dashboard">
      
      {/* 4 Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Containers"
          value={overview?.total_containers || 0}
          subtitle="+3 this week"
          icon={Box}
          colorClass="text-primary"
        />
        <StatCard
          title="Running"
          value={overview?.running_containers || 0}
          subtitle={`${runningPercent}% active`}
          progress={runningPercent}
          icon={Activity}
          colorClass="text-success"
        />
        <StatCard
          title="CPU Allocated"
          value={`${overview?.total_cpu_allocated || 0} Cores`}
          subtitle={`${cpuProgress}% of ${totalCores} cores`}
          progress={cpuProgress}
          icon={Cpu}
          colorClass="text-warning"
        />
        <StatCard
          title="RAM Allocated"
          value={`${Math.round((overview?.total_ram_allocated_mb || 0) / 1024)} GB`}
          subtitle={`${ramProgress}% of 256 GB`}
          progress={ramProgress}
          icon={HardDrive}
          colorClass="text-accent"
        />
      </div>

      {/* 70/30 Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left 70%: Container Overview Table */}
        <div className="lg:col-span-8 glass p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Container Overview</h3>
            <button className="text-sm font-medium text-primary hover:text-primary-hover transition-default">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-text-muted border-b border-border">
                  <th className="pb-3 font-medium px-4">Name</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4 hidden sm:table-cell">CPU</th>
                  <th className="pb-3 font-medium px-4 hidden sm:table-cell">RAM</th>
                  <th className="pb-3 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.slice(0, 6).map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-surface/30 transition-default">
                    <td className="py-4 px-4">
                      <div className="font-medium text-text-primary">{c.name}</div>
                      <div className="text-xs text-text-muted mt-1 font-tech">{c.distro}</div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell text-text-secondary">{c.cpu_cores} Cores</td>
                    <td className="py-4 px-4 hidden sm:table-cell text-text-secondary">{c.ram_mb} MB</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === 'running' ? (
                          <button className="p-1.5 text-text-muted hover:text-warning hover:bg-surface rounded-lg transition-default" title="Stop">
                            <Square className="w-4 h-4" />
                          </button>
                        ) : (
                          <button className="p-1.5 text-text-muted hover:text-success hover:bg-surface rounded-lg transition-default" title="Start">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-text-muted hover:text-primary hover:bg-surface rounded-lg transition-default" title="Console">
                          <Terminal className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-text-muted hover:text-danger hover:bg-surface rounded-lg transition-default" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {containers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted">No containers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 30%: Recent Activity */}
        <div className="lg:col-span-4 glass p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Recent Activity</h3>
          
          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {logs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No activity yet</p>
            ) : (
              logs.slice(0, 8).map((log, i) => (
                <div key={log.id} className="flex gap-4 relative">
                  {/* Vertical Line Connector */}
                  {i !== Math.min(logs.length, 8) - 1 && (
                    <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-border" />
                  )}
                  
                  {/* Icon */}
                  <div className="relative z-10 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
                    {log.action.includes('created') ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> :
                     log.action.includes('started') ? <Play className="w-3.5 h-3.5 text-primary" /> :
                     log.action.includes('stopped') ? <Square className="w-3.5 h-3.5 text-warning" /> :
                     log.action.includes('deleted') ? <Trash2 className="w-3.5 h-3.5 text-danger" /> :
                     <Clock className="w-3.5 h-3.5 text-text-muted" />}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <p className="text-sm font-medium text-text-primary leading-none capitalize">
                      {log.action.replace('_', ' ')}
                    </p>
                    {log.container_name && (
                      <p className="text-xs text-text-secondary mt-1">{log.container_name}</p>
                    )}
                    <p className="text-xs text-text-muted mt-2">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Third Section: Resource Usage Charts (Placeholders) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">CPU Usage</h3>
          <div className="h-64 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-border/50 flex flex-col justify-end p-4 relative overflow-hidden">
            {/* Mock chart bars */}
            <div className="flex items-end justify-between h-32 gap-2 opacity-60">
              {[40, 25, 60, 30, 80, 45, 70, 50, 90, 65, 85, 40].map((h, i) => (
                <div key={i} className="w-full bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50" />
            <p className="text-center text-text-muted text-sm mt-4 relative z-10">Historical CPU Usage (Mock)</p>
          </div>
        </div>
        
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">RAM Usage</h3>
          <div className="h-64 rounded-xl bg-gradient-to-b from-accent/10 to-transparent border border-border/50 flex flex-col justify-end p-4 relative overflow-hidden">
            {/* Mock chart line */}
            <div className="absolute inset-x-0 bottom-12 h-32 opacity-60">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-accent fill-accent/20">
                <path d="M0,100 L0,60 Q20,30 40,70 T80,40 T100,50 L100,100 Z" vectorEffect="non-scaling-stroke" strokeWidth="2" />
              </svg>
            </div>
            <p className="text-center text-text-muted text-sm mt-auto relative z-10">Historical RAM Usage (Mock)</p>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
