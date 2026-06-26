import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TerminalView from '../components/terminal/TerminalView';
import { containersAPI } from '../api/client';
import { ArrowLeft, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

export default function TerminalPage() {
  const { containerId } = useParams();
  const navigate = useNavigate();
  const [container, setContainer] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [key, setKey] = useState(0); // For reconnect

  useEffect(() => {
    if (containerId) {
      containersAPI.get(containerId).then(({ data }) => setContainer(data)).catch(() => {});
    }
  }, [containerId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d1117' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-12 border-b" style={{ background: 'var(--color-surface-800)', borderColor: 'var(--color-glass-border)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-surface-700 transition-default"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-accent animate-pulse-glow' : 'bg-danger'}`} />
            <span className="text-sm font-medium text-text-primary">
              {container ? `${container.username}@${container.name}` : 'Terminal'}
            </span>
            <span className="text-xs text-text-muted font-mono">
              {container?.distro}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setKey(k => k + 1)}
            className="p-1.5 rounded-lg hover:bg-surface-700 transition-default"
            title="Reconnect"
          >
            <RotateCcw className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-surface-700 transition-default"
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? (
              <Minimize2 className="w-4 h-4 text-text-secondary" />
            ) : (
              <Maximize2 className="w-4 h-4 text-text-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 terminal-container" style={{ borderRadius: 0 }}>
        <TerminalView
          key={key}
          containerId={parseInt(containerId)}
          onConnectionChange={setConnected}
        />
      </div>
    </div>
  );
}
