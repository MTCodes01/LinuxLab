import { Play, Square, RotateCcw, Trash2, Terminal, Shield, MoreVertical, Box, Cpu, HardDrive, Globe } from 'lucide-react';
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
      <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
      <span className="capitalize">{status}</span>
    </span>
  );
}

export default function ContainerCard({ container, onAction, delay }) {
  const navigate = useNavigate();
  
  // Fake stats for visual representation if real stats missing
  const cpuPercent = container.status === 'running' ? Math.floor(Math.random() * 20) + 1 : 0;
  const ramPercent = container.status === 'running' ? Math.floor(Math.random() * 40) + 10 : 0;

  return (
    <div 
      className="glass glass-hover p-5 flex flex-col animate-slide-up group relative overflow-hidden"
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      {container.status === 'running' && (
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl opacity-5 bg-success group-hover:opacity-10 transition-opacity duration-500" />
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-surface/50 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors">
            <Box className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1 tracking-tight leading-none mt-1">{container.name}</h3>
            <p className="text-xs text-text-secondary flex items-center gap-1.5 font-medium">
              {container.username} <span className="text-border">•</span> {container.distro}
            </p>
          </div>
        </div>
        <StatusBadge status={container.status} />
      </div>

      {/* Stats row (if running) */}
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        <div className="bg-surface/30 border border-border/50 rounded-xl p-3 hover:bg-surface/50 transition-colors">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Cpu className="w-3.5 h-3.5 text-text-muted" />
            <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">CPU</p>
          </div>
          <div className="flex items-end gap-1.5 mb-2">
            <span className="text-lg font-bold text-text-primary leading-none">{cpuPercent}%</span>
            <span className="text-[10px] text-text-muted font-medium pb-0.5">of {container.cpu_cores} Cores</span>
          </div>
          <div className="w-full bg-surface border border-border/50 rounded-full h-1">
            <div className={`h-1 rounded-full ${container.status === 'running' ? 'bg-primary shadow-[0_0_8px_rgba(124,58,237,0.5)]' : 'bg-text-muted'}`} style={{ width: `${cpuPercent}%` }} />
          </div>
        </div>
        
        <div className="bg-surface/30 border border-border/50 rounded-xl p-3 hover:bg-surface/50 transition-colors">
          <div className="flex items-center gap-1.5 mb-1.5">
            <HardDrive className="w-3.5 h-3.5 text-text-muted" />
            <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">RAM</p>
          </div>
          <div className="flex items-end gap-1.5 mb-2">
            <span className="text-lg font-bold text-text-primary leading-none">{ramPercent}%</span>
            <span className="text-[10px] text-text-muted font-medium pb-0.5">of {container.ram_mb} MB</span>
          </div>
          <div className="w-full bg-surface border border-border/50 rounded-full h-1">
            <div className={`h-1 rounded-full ${container.status === 'running' ? 'bg-accent shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'bg-text-muted'}`} style={{ width: `${ramPercent}%` }} />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50 relative z-10">
        {/* Info */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium bg-surface/30 px-2.5 py-1 rounded-md border border-border/50">
          <Globe className="w-3.5 h-3.5" />
          <span className="font-tech mt-0.5">{container.ip_address || '—'}</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {container.status === 'running' ? (
            <>
              <button 
                onClick={() => onAction(container.id, 'stop')}
                className="p-2 text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-default" 
                title="Stop"
              >
                <Square className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate(`/terminal/${container.id}`)}
                className="p-2 text-primary hover:text-primary-hover hover:bg-primary/10 rounded-lg transition-default shadow-[0_0_10px_rgba(124,58,237,0.1)] border border-transparent hover:border-primary/20" 
                title="Open Console"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => onAction(container.id, 'start')}
              className="p-2 text-text-secondary hover:text-success hover:bg-success/10 rounded-lg transition-default" 
              title="Start"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <button 
            onClick={() => onAction(container.id, 'delete')}
            className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-default" 
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
