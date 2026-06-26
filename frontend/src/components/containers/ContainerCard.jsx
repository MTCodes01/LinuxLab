import { Play, Square, Trash2, Terminal, Cpu, HardDrive, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function ContainerCard({ container, onAction, delay }) {
  const navigate = useNavigate();

  const cpuPercent = container.status === 'running' ? Math.floor(Math.random() * 25) + 2  : 0;
  const ramPercent = container.status === 'running' ? Math.floor(Math.random() * 45) + 10 : 0;
  const isRunning  = container.status === 'running';

  return (
    <div
      className="card card-hover flex flex-col animate-slide-up group relative overflow-hidden"
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      {/* Running glow accent */}
      {isRunning && (
        <div
          className="absolute -right-12 -top-12 w-28 h-28 rounded-full blur-3xl opacity-[0.06] bg-success
            group-hover:opacity-[0.12] transition-opacity duration-700 pointer-events-none"
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-default">
            <Terminal className="w-5 h-5 text-text-muted group-hover:text-primary transition-default" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-base leading-tight">{container.name}</h3>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {container.username} · {container.distro}
            </p>
          </div>
        </div>
        <StatusBadge status={container.status} />
      </div>

      {/* Resource mini bars */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* CPU */}
        <div className="bg-surface border border-border rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Cpu className="w-3.5 h-3.5 text-primary opacity-70" />
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">CPU</span>
          </div>
          <p className="text-xl font-bold text-text-primary font-mono leading-none mb-1.5">
            {cpuPercent}<span className="text-xs font-normal text-text-muted">%</span>
          </p>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${cpuPercent}%`,
                background: isRunning ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1">{container.cpu_cores} cores</p>
        </div>

        {/* RAM */}
        <div className="bg-surface border border-border rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <HardDrive className="w-3.5 h-3.5 text-accent opacity-70" />
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">RAM</span>
          </div>
          <p className="text-xl font-bold text-text-primary font-mono leading-none mb-1.5">
            {ramPercent}<span className="text-xs font-normal text-text-muted">%</span>
          </p>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${ramPercent}%`,
                background: isRunning ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1">{container.ram_mb} MB</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        {/* IP */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Globe className="w-3.5 h-3.5" />
          <span className="font-mono">{container.ip_address || '—'}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isRunning ? (
            <>
              <button
                onClick={() => onAction(container.id, 'stop')}
                className="btn btn-ghost p-1.5 hover:text-warning"
                title="Stop"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(`/terminal/${container.id}`)}
                className="btn btn-ghost p-1.5 hover:text-primary"
                title="Open Terminal"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onAction(container.id, 'start')}
              className="btn btn-ghost p-1.5 hover:text-success"
              title="Start"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            onClick={() => onAction(container.id, 'delete')}
            className="btn btn-ghost p-1.5 btn-danger"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
