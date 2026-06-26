import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { monitoringAPI, containersAPI, logsAPI } from '../api/client';
import { Box, Cpu, HardDrive, Activity, Play, Square, RotateCcw, Trash2, MoreVertical, Terminal, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ title, value, subtitle, progress, icon: Icon, colorClass, delay }) {
  return (
    <div 
      className="stat-card p-6 flex flex-col justify-between group relative overflow-hidden animate-slide-up"
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-20 ${colorClass.replace('text-', 'bg-')}`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1.5">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${colorClass.replace('text-', 'bg-')}/10 border border-${colorClass.replace('text-', 'border-')}/10 flex items-center justify-center shadow-sm`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>
      
      <div className="relative z-10">
        {progress !== undefined ? (
          <div className="w-full bg-surface rounded-full h-1.5 mt-3 overflow-hidden border border-border/50">
            <div className={`h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} style={{ width: `${progress}%` }} />
          </div>
        ) : null}
        {subtitle && (
          <p className="text-sm text-text-muted mt-3 font-medium flex items-center gap-1.5">
            {subtitle}
          </p>
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
      <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
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
          subtitle={<><span className="text-success text-xs bg-success/10 px-1.5 py-0.5 rounded">+3</span> this week</>}
          icon={Box}
          colorClass="text-primary"
          delay={1}
        />
        <StatCard
          title="Running"
          value={overview?.running_containers || 0}
          subtitle={`${runningPercent}% utilization`}
          progress={runningPercent}
          icon={Activity}
          colorClass="text-success"
          delay={2}
        />
        <StatCard
          title="CPU Allocated"
          value={`${overview?.total_cpu_allocated || 0} Cores`}
          subtitle={`${cpuProgress}% of ${totalCores} cores`}
          progress={cpuProgress}
          icon={Cpu}
          colorClass="text-warning"
          delay={3}
        />
        <StatCard
          title="RAM Allocated"
          value={`${Math.round((overview?.total_ram_allocated_mb || 0) / 1024)} GB`}
          subtitle={`${ramProgress}% of 256 GB`}
          progress={ramProgress}
          icon={HardDrive}
          colorClass="text-accent"
          delay={4}
        />
      </div>

      {/* 70/30 Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        
        {/* Left 70%: Container Overview Table */}
        <div className="xl:col-span-8 glass flex flex-col overflow-hidden animate-slide-up" style={{ animationDelay: '250ms' }}>
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-surface/20">
            <h3 className="text-lg font-semibold text-text-primary">Container Overview</h3>
            <button className="text-sm font-medium text-primary hover:text-primary-hover transition-default px-3 py-1.5 rounded-lg hover:bg-primary/10">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-text-muted bg-surface/30 border-b border-border">
                  <th className="py-4 font-medium px-6">Name & Owner</th>
                  <th className="py-4 font-medium px-6">Status</th>
                  <th className="py-4 font-medium px-6 hidden sm:table-cell">CPU</th>
                  <th className="py-4 font-medium px-6 hidden sm:table-cell">RAM</th>
                  <th className="py-4 font-medium px-6 hidden md:table-cell">Created</th>
                  <th className="py-4 font-medium px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.slice(0, 5).map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-surface/30 transition-default group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors">
                          <Box className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">{c.name}</div>
                          <div className="text-xs text-text-muted mt-0.5">{c.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-4 px-6 hidden sm:table-cell text-text-secondary">{c.cpu_cores} Cores</td>
                    <td className="py-4 px-6 hidden sm:table-cell text-text-secondary">{c.ram_mb} MB</td>
                    <td className="py-4 px-6 hidden md:table-cell text-text-muted text-xs">
                      {formatDistanceToNow(new Date(c.created_at || Date.now()), { addSuffix: true })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.status === 'running' ? (
                          <button className="p-2 text-text-secondary hover:text-warning hover:bg-surface rounded-lg transition-default" title="Stop">
                            <Square className="w-4 h-4" />
                          </button>
                        ) : (
                          <button className="p-2 text-text-secondary hover:text-success hover:bg-surface rounded-lg transition-default" title="Start">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-text-secondary hover:text-primary hover:bg-surface rounded-lg transition-default" title="Console">
                          <Terminal className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-text-secondary hover:text-danger hover:bg-surface rounded-lg transition-default" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {containers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      <div className="flex flex-col items-center justify-center">
                        <Box className="w-8 h-8 mb-3 opacity-20" />
                        <p>No containers found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 30%: Recent Activity */}
        <div className="xl:col-span-4 glass flex flex-col overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="p-6 border-b border-border/50 bg-surface/20">
            <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50">
                <Activity className="w-8 h-8 mb-2" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {logs.slice(0, 6).map((log, i) => (
                  <div key={log.id} className="flex gap-4 relative">
                    {/* Vertical Line Connector */}
                    {i !== Math.min(logs.length, 6) - 1 && (
                      <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-border/60" />
                    )}
                    
                    {/* Icon */}
                    <div className="relative z-10 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                      {log.action.includes('created') ? <CheckCircle2 className="w-4 h-4 text-success" /> :
                       log.action.includes('started') ? <Play className="w-4 h-4 text-primary" /> :
                       log.action.includes('stopped') ? <Square className="w-4 h-4 text-warning" /> :
                       log.action.includes('deleted') ? <Trash2 className="w-4 h-4 text-danger" /> :
                       <Clock className="w-4 h-4 text-text-muted" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1.5">
                      <p className="text-sm font-medium text-text-primary leading-none capitalize">
                        {log.action.replace('_', ' ')}
                      </p>
                      {log.container_name && (
                        <p className="text-xs text-text-secondary mt-1.5 font-medium">{log.container_name}</p>
                      )}
                      <p className="text-xs text-text-muted mt-1.5">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Third Section: Resource Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '350ms' }}>
        <div className="glass flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-surface/20">
            <h3 className="text-base font-semibold text-text-primary">CPU Usage Over Time</h3>
            <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md border border-success/20">Live</span>
          </div>
          <div className="h-64 p-6 relative overflow-hidden bg-surface/10">
            {/* Mock chart area */}
            <div className="absolute inset-x-6 bottom-6 top-6 flex items-end justify-between gap-1 opacity-80">
              {[40, 25, 60, 30, 80, 45, 70, 50, 90, 65, 85, 40, 50, 45, 60, 55, 70, 80, 60, 75, 40, 90, 85, 60, 50].map((h, i) => (
                <div key={i} className="w-full bg-primary/40 rounded-t-sm hover:bg-primary/60 transition-colors relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-text-primary text-[10px] px-2 py-1 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-md">
                    {h}% Usage
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
        
        <div className="glass flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-surface/20">
            <h3 className="text-base font-semibold text-text-primary">RAM Usage Over Time</h3>
            <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md border border-success/20">Live</span>
          </div>
          <div className="h-64 p-6 relative overflow-hidden bg-surface/10">
            {/* Mock chart line */}
            <div className="absolute inset-x-6 bottom-6 top-6 opacity-80">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <path d="M0,100 L0,60 Q10,50 20,65 T40,40 T60,55 T80,30 T100,45 L100,100 Z" fill="url(#ramGradient)" />
                <path d="M0,60 Q10,50 20,65 T40,40 T60,55 T80,30 T100,45" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
