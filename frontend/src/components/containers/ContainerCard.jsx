import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Play, Square, RotateCcw, RefreshCw, Trash2, Terminal,
  Cpu, MemoryStick, HardDrive, Globe, Clock, Wifi,
} from 'lucide-react';
import anime from 'animejs';

const distroIcons = {
  'ubuntu-24.04': '🐧',
  'debian-12': '🌀',
  'fedora': '🎩',
  'alpine': '🏔️',
  'archlinux': '🔷',
  'python-lab': '🐍',
  'c-dev-lab': '⚙️',
  'docker-learning-lab': '🐳',
};

export default function ContainerCard({ container, onAction, delay = 0 }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const isRunning = container.status === 'running';

  useEffect(() => {
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: delay * 80,
        easing: 'easeOutExpo',
      });
    }
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="glass glass-hover p-5 transition-default group"
      style={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{distroIcons[container.distro] || '🐧'}</span>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{container.name}</h3>
            <p className="text-xs text-text-muted font-mono">{container.username}@{container.distro}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={isRunning ? 'status-running' : 'status-stopped'} />
          <span className="text-xs font-medium capitalize" style={{ color: isRunning ? 'var(--color-accent)' : 'var(--color-danger)' }}>
            {container.status}
          </span>
        </div>
      </div>

      {/* Resource bars */}
      <div className="space-y-2 mb-4">
        <ResourceBar icon={Cpu} label="CPU" value={`${container.cpu_limit} cores`} percent={container.cpu_limit / 8 * 100} color="var(--color-primary)" />
        <ResourceBar icon={MemoryStick} label="RAM" value={`${container.ram_limit} MB`} percent={container.ram_limit / 16384 * 100} color="var(--color-accent)" />
        <ResourceBar icon={HardDrive} label="Disk" value={`${container.storage_limit} GB`} percent={container.storage_limit / 100 * 100} color="var(--color-warning)" />
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="flex items-center gap-1.5 text-text-muted">
          <Globe className="w-3 h-3" />
          <span className="truncate">{container.ip_address || 'No IP'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted">
          <Wifi className="w-3 h-3" />
          <span>SSH: {container.ssh_enabled ? `Port ${container.ssh_port}` : 'Off'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(new Date(container.created_at), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted">
          <Clock className="w-3 h-3" />
          <span>Active {formatDistanceToNow(new Date(container.last_active), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-3 border-t" style={{ borderColor: 'var(--color-glass-border)' }}>
        {isRunning ? (
          <ActionButton icon={Square} label="Stop" color="var(--color-warning)" onClick={() => onAction(container.id, 'stop')} />
        ) : (
          <ActionButton icon={Play} label="Start" color="var(--color-accent)" onClick={() => onAction(container.id, 'start')} />
        )}
        <ActionButton icon={RotateCcw} label="Restart" color="var(--color-primary)" onClick={() => onAction(container.id, 'restart')} />
        <ActionButton icon={RefreshCw} label="Reset" color="var(--color-primary-light)" onClick={() => onAction(container.id, 'reset')} />
        <ActionButton icon={Trash2} label="Delete" color="var(--color-danger)" onClick={() => onAction(container.id, 'delete')} />
        <div className="flex-1" />
        <button
          onClick={() => navigate(`/terminal/${container.id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-default hover:brightness-110"
          style={{ background: 'var(--color-primary)' }}
          disabled={!isRunning}
          title={isRunning ? 'Open Terminal' : 'Container must be running'}
        >
          <Terminal className="w-3.5 h-3.5" />
          Terminal
        </button>
      </div>
    </div>
  );
}

function ResourceBar({ icon: Icon, label, value, percent, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
      <div className="flex-1">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-600)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percent, 100)}%`, background: color }}
          />
        </div>
      </div>
      <span className="text-xs text-text-muted w-16 text-right">{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg transition-default hover:scale-110"
      style={{ color }}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
