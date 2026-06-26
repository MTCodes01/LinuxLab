import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { monitoringAPI, containersAPI, logsAPI } from '../api/client';
import { 
  Box, Cpu, HardDrive, Activity, Play, Square, Terminal, Trash2, 
  Clock, Plus, Shield, Settings, FileText, ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function Sparkline({ points, strokeColor = "var(--color-primary)" }) {
  return (
    <div className="h-6 w-full mt-3 opacity-70">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path
          d={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function StatCard({ title, value, trend, trendType = "up", points, icon: Icon, colorClass }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-border-hover transition-default animate-slide-up">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{title}</span>
          <Icon className={`w-3.5 h-3.5 ${colorClass} opacity-80`} />
        </div>
        
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold text-text-primary tracking-tight font-tech">{value}</span>
          {trend && (
            <span className={`text-[10px] font-semibold font-mono ${
              trendType === "up" ? "text-success" : 
              trendType === "down" ? "text-danger" : "text-text-muted"
            }`}>
              {trend}
            </span>
          )}
        </div>
      </div>
      
      {/* Sparkline chart at the bottom (like the second image) */}
      <Sparkline points={points} strokeColor={`var(--color-${colorClass.includes('primary') ? 'primary' : colorClass.includes('success') ? 'success' : colorClass.includes('warning') ? 'warning' : 'accent'})`} />
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
      <span className="w-1 h-1 rounded-full bg-current" />
      <span className="capitalize text-[10px] font-semibold">{status}</span>
    </span>
  );
}

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

  const totalCores = 64; // mock
  const totalRam = 256 * 1024; // 256GB mock
  const totalDisk = 500; // 500GB mock

  const cpuProgress = overview?.total_cpu_allocated ? Math.round((overview.total_cpu_allocated / totalCores) * 100) : 0;
  const ramProgress = overview?.total_ram_allocated_mb ? Math.round((overview.total_ram_allocated_mb / totalRam) * 100) : 0;
  const runningContainers = overview?.running_containers || 0;
  const stoppedContainers = (overview?.total_containers || 0) - runningContainers;
  const diskAllocated = containers.reduce((acc, c) => acc + (c.storage_limit || 10), 0);
  const diskProgress = Math.round((diskAllocated / totalDisk) * 100);

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this container?')) return;
        await containersAPI.delete(id);
      } else if (action === 'start') {
        await containersAPI.start(id);
      } else if (action === 'stop') {
        await containersAPI.stop(id);
      }
      // Re-fetch containers list
      const { data } = await containersAPI.list();
      setContainers(data.containers || []);
    } catch (err) {
      console.error(`Failed container action ${action}:`, err);
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      
      {/* 1. Stat Cards Row (compact, sparkline, trend) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Running"
          value={runningContainers}
          trend="+2 active"
          trendType="up"
          points="M0,25 Q15,10 30,20 T60,8 T90,15 T100,5"
          icon={Activity}
          colorClass="text-success"
        />
        <StatCard
          title="Stopped"
          value={stoppedContainers}
          trend="stable"
          trendType="neutral"
          points="M0,15 L20,15 L40,15 Q60,15 80,18 T100,10"
          icon={Square}
          colorClass="text-text-muted"
        />
        <StatCard
          title="CPU Core Load"
          value={`${overview?.total_cpu_allocated || 0} Cores`}
          trend={`${cpuProgress}% alloc`}
          trendType="neutral"
          points="M0,20 Q15,28 30,12 T60,25 T90,10 T100,18"
          icon={Cpu}
          colorClass="text-primary"
        />
        <StatCard
          title="RAM Committed"
          value={`${Math.round((overview?.total_ram_allocated_mb || 0) / 1024)} GB`}
          trend={`${ramProgress}% alloc`}
          trendType="neutral"
          points="M0,25 Q15,22 30,25 T60,18 T90,12 T100,8"
          icon={HardDrive}
          colorClass="text-accent"
        />
        <StatCard
          title="Disk Allocated"
          value={`${diskAllocated} GB`}
          trend={`${diskProgress}% limit`}
          trendType="neutral"
          points="M0,22 L30,22 L50,18 L80,18 L100,15"
          icon={Box}
          colorClass="text-warning"
        />
      </div>

      {/* 2. Large Full-Width Chart Section (inspired by the second image) */}
      <div className="bg-card border border-border rounded-xl p-5 md:p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">System Resource Allocations</h3>
            <p className="text-[10px] text-text-muted mt-0.5">CPU and Memory capacity overcommit rates</p>
          </div>
          
          <div className="flex gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-0.5 bg-primary" />
              <span className="text-text-secondary">CPU load ({cpuProgress}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-0.5 bg-accent" />
              <span className="text-text-secondary">RAM load ({ramProgress}%)</span>
            </div>
          </div>
        </div>
        
        <div className="h-56 relative bg-surface/10 rounded-lg border border-border/30 overflow-hidden">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible opacity-95">
            {/* Gridlines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3" />
            
            {/* Gradient fills */}
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            {/* CPU Path */}
            <path d="M0,100 L0,70 Q10,50 20,65 T40,40 T60,55 T80,30 T100,45 L100,100 Z" fill="url(#cpuGrad)" />
            <path d="M0,70 Q10,50 20,65 T40,40 T60,55 T80,30 T100,45" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />

            {/* RAM Path */}
            <path d="M0,100 L0,80 Q15,70 30,85 T60,60 T90,75 L100,65 L100,100 Z" fill="url(#ramGrad)" />
            <path d="M0,80 Q15,70 30,85 T60,60 T90,75 L100,65" fill="none" stroke="var(--color-accent)" strokeWidth="1.8" strokeDasharray="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
          
          {/* Timeline Labels */}
          <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] text-text-muted font-mono pointer-events-none">
            <span>09:00</span>
            <span>10:00</span>
            <span>11:00</span>
            <span>12:00</span>
            <span>13:00</span>
            <span>14:00</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Containers and Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left 8 Columns: Container Overview Table */}
        <div className="xl:col-span-8 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-surface/20">
            <div>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Latest Containers</h3>
              <p className="text-xs text-text-muted mt-0.5">Quick overview of your active deployments</p>
            </div>
            <button 
              onClick={() => navigate('/containers')}
              className="text-xs font-medium text-primary hover:text-primary-hover transition-default px-2.5 py-1 rounded border border-border hover:bg-card cursor-pointer"
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-text-muted bg-surface/30 border-b border-border">
                  <th className="py-3 px-5 font-semibold">Name & Distro</th>
                  <th className="py-3 px-5 font-semibold">Status</th>
                  <th className="py-3 px-5 font-semibold hidden sm:table-cell">Resources</th>
                  <th className="py-3 px-5 font-semibold hidden md:table-cell">IP Address</th>
                  <th className="py-3 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.slice(0, 5).map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-surface/20 transition-default group">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-surface border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors">
                          <Box className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">{c.name}</div>
                          <div className="text-[10px] text-text-muted font-mono">{c.distro}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-5 hidden sm:table-cell text-text-secondary">
                      <span className="font-tech">{c.cpu_cores} vCPU</span>
                      <span className="text-text-muted mx-1">•</span>
                      <span className="font-tech">{c.ram_mb} MB</span>
                    </td>
                    <td className="py-3 px-5 hidden md:table-cell text-text-muted font-tech">
                      {c.ip_address || '—'}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.status === 'running' ? (
                          <button 
                            onClick={() => handleAction(c.id, 'stop')}
                            className="p-1 text-text-secondary hover:text-warning hover:bg-card border border-transparent hover:border-border rounded transition-default cursor-pointer" 
                            title="Stop"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleAction(c.id, 'start')}
                            className="p-1 text-text-secondary hover:text-success hover:bg-card border border-transparent hover:border-border rounded transition-default cursor-pointer" 
                            title="Start"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/terminal/${c.id}`)}
                          className="p-1 text-primary hover:text-primary-hover hover:bg-card border border-transparent hover:border-border rounded transition-default cursor-pointer" 
                          title="Terminal Console"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {containers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">
                      <div className="flex flex-col items-center justify-center">
                        <Box className="w-6 h-6 mb-2 text-text-muted opacity-30 animate-pulse" />
                        <p className="text-xs">No containers deployed yet</p>
                        <button
                          onClick={() => navigate('/containers?create=true')}
                          className="mt-3 text-xs bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg border border-primary/20 transition-default cursor-pointer"
                        >
                          Deploy New Container
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Columns: Recent Activity & Quick Actions */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/containers?create=true')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface hover:bg-card hover:border-primary/50 text-left transition-default text-xs text-text-secondary hover:text-text-primary group cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                <span>Create Container</span>
              </button>
              <button
                onClick={() => navigate('/settings?tab=ssh')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface hover:bg-card hover:border-primary/50 text-left transition-default text-xs text-text-secondary hover:text-text-primary group cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                <span>Manage SSH Keys</span>
              </button>
              <button
                onClick={() => navigate('/logs')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface hover:bg-card hover:border-primary/50 text-left transition-default text-xs text-text-secondary hover:text-text-primary group cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                <span>View Activity Logs</span>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface hover:bg-card hover:border-primary/50 text-left transition-default text-xs text-text-secondary hover:text-text-primary group cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                <span>System Settings</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-card border border-border rounded-xl flex flex-col flex-1 shadow-sm overflow-hidden min-h-[250px]">
            <div className="px-5 py-4 border-b border-border bg-surface/20">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Recent Activity</h3>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto max-h-[300px]">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-text-muted opacity-40">
                  <Activity className="w-6 h-6 mb-1.5" />
                  <p className="text-xs">No recent operations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.slice(0, 5).map((log, i) => (
                    <div key={log.id} className="flex gap-3 relative">
                      {i !== Math.min(logs.length, 5) - 1 && (
                        <div className="absolute left-3 top-6 bottom-[-16px] w-px bg-border" />
                      )}
                      
                      <div className="relative z-10 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
                        <Clock className="w-3 h-3 text-text-secondary" />
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-semibold text-text-primary leading-tight capitalize">
                          {log.action.replace('_', ' ')}
                        </p>
                        {log.container_name && (
                          <p className="text-[10px] text-text-secondary mt-0.5 font-medium">{log.container_name}</p>
                        )}
                        <p className="text-[9px] text-text-muted mt-0.5">
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

      </div>

    </DashboardLayout>
  );
}
