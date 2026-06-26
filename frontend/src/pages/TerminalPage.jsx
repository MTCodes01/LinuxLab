import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TerminalView from '../components/terminal/TerminalView';
import { containersAPI } from '../api/client';
import {
  ArrowLeft, Maximize2, Minimize2, RotateCcw, Copy, Check,
  Terminal, Plus, Wifi, WifiOff
} from 'lucide-react';

export default function TerminalPage() {
  const { containerId } = useParams();
  const navigate = useNavigate();
  const [container, setContainer] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [key, setKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (containerId) {
      containersAPI.get(containerId)
        .then(({ data }) => setContainer(data))
        .catch(() => {});
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

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ padding: '1rem 1.25rem' }}>

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/containers')}
          className="p-2 rounded-lg bg-surface border border-border text-text-secondary
            hover:text-text-primary hover:border-border-hover transition-default flex-shrink-0"
          title="Back to Containers"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-text-primary">Console Terminal</h1>
            {/* Connection badge */}
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border
              ${connected
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-danger/10 text-danger border-danger/20'
              }`}
            >
              {connected
                ? <><Wifi className="w-3 h-3" /> Connected</>
                : <><WifiOff className="w-3 h-3" /> Connecting...</>
              }
            </span>
          </div>
          {container && (
            <p className="text-sm text-text-muted mt-0.5 font-mono">
              {container.username}@{container.name} · {container.distro}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setKey(k => k + 1)}
            className="btn btn-secondary text-sm gap-1.5"
            title="Reconnect"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reconnect</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn btn-secondary p-2"
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal container */}
      <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-border shadow-lg"
        style={{ background: '#000', minHeight: '60vh' }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a0a] border-b border-white/[0.07]">
          {/* macOS-style dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>

          {/* Tab */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#141414] border border-white/[0.07] rounded-lg">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-mono text-text-secondary">
              {container ? `${container.username}@${container.name}` : 'session_1'}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ml-1 ${connected ? 'bg-success' : 'bg-danger'}`} />
          </div>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-default"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Terminal viewport */}
        <div className="flex-1 relative p-3">
          <TerminalView
            key={key}
            containerId={parseInt(containerId)}
            onConnectionChange={setConnected}
          />

          {/* Connecting overlay */}
          {!connected && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/[0.07] flex items-center justify-center mb-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-base font-semibold text-text-primary">Connecting...</p>
              <p className="text-sm text-text-muted mt-1">Establishing secure WebSocket session</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
