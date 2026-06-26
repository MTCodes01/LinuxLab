import { Play, Square, RotateCcw, Trash2, Terminal, Shield, MoreVertical } from 'lucide-react';
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
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
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
      className="glass glass-hover p-6 flex flex-col animate-slide-up"
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">{container.name}</h3>
          <p className="text-sm text-text-secondary flex items-center gap-1.5">
            {container.username} <span className="text-border">•</span> {container.distro}
          </p>
        </div>
        <StatusBadge status={container.status} />
      </div>

      {/* Stats row (if running) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1 font-medium">CPU Usage</p>
          <div className="flex items-end gap-2">
            <span className="text-lg font-semibold text-text-primary">{cpuPercent}%</span>
            <span className="text-xs text-text-muted mb-1">of {container.cpu_cores} Cores</span>
          </div>
          <div className="w-full bg-background rounded-full h-1 mt-2">
            <div className="bg-primary h-1 rounded-full" style={{ width: `${cpuPercent}%` }} />
          </div>
        </div>
        
        <div className="bg-surface border border-border rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1 font-medium">RAM Usage</p>
          <div className="flex items-end gap-2">
            <span className="text-lg font-semibold text-text-primary">{ramPercent}%</span>
            <span className="text-xs text-text-muted mb-1">of {container.ram_mb} MB</span>
          </div>
          <div className="w-full bg-background rounded-full h-1 mt-2">
            <div className="bg-accent h-1 rounded-full" style={{ width: `${ramPercent}%` }} />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        {/* Info */}
        <div className="text-xs text-text-muted font-tech">
          IP: {container.ip_address || '—'}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {container.status === 'running' ? (
            <>
              <button 
                onClick={() => onAction(container.id, 'stop')}
                className="p-2 text-text-secondary hover:text-warning hover:bg-surface rounded-lg transition-default" 
                title="Stop"
              >
                <Square className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate(`/terminal/${container.id}`)}
                className="p-2 text-primary hover:text-primary-hover hover:bg-primary/10 rounded-lg transition-default" 
                title="Open Console"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => onAction(container.id, 'start')}
              className="p-2 text-text-secondary hover:text-success hover:bg-surface rounded-lg transition-default" 
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
