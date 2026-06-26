import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TerminalView from '../components/terminal/TerminalView';
import { containersAPI } from '../api/client';
import { ArrowLeft, Maximize2, Minimize2, RotateCcw, Copy, Check, Terminal, X, Plus } from 'lucide-react';

export default function TerminalPage() {
  const { containerId } = useParams();
  const navigate = useNavigate();
  const [container, setContainer] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [key, setKey] = useState(0); // For reconnect
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    // Faking copy since xterm handles its own selection
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/containers')}
          className="p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary transition-default shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Console</h1>
          <p className="text-sm text-text-muted flex items-center gap-2">
            Connect to <span className="font-tech text-text-secondary">{container?.name || 'Loading...'}</span>
          </p>
        </div>
      </div>

      {/* Console Container */}
      <div className="flex-1 flex flex-col bg-[#000000] rounded-2xl border border-border shadow-card overflow-hidden transition-default">
        
        {/* Tabs / Toolbar */}
        <div className="flex items-end justify-between bg-surface border-b border-border pl-2 pr-4 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#000000] border-t border-l border-r border-border rounded-t-lg relative">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-primary font-tech">
                {container ? `${container.username}@${container.name}` : 'session_1'}
              </span>
              <div className={`w-2 h-2 rounded-full ml-2 ${connected ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-danger'}`} />
              
              {/* Active Tab Accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-t-lg" />
            </div>
            
            <button className="p-2 ml-1 text-text-muted hover:text-text-primary transition-default rounded-lg hover:bg-surface-hover">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-background border border-transparent hover:border-border transition-default"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => setKey(k => k + 1)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background border border-transparent hover:border-border transition-default"
              title="Reconnect"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background border border-transparent hover:border-border transition-default"
              title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Terminal Area */}
        <div className="flex-1 relative p-4">
          <TerminalView
            key={key}
            containerId={parseInt(containerId)}
            onConnectionChange={setConnected}
          />
          
          {/* Disconnected Overlay */}
          {!connected && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                <RotateCcw className="w-6 h-6 text-text-muted animate-spin-slow" />
              </div>
              <p className="text-text-primary font-medium">Connecting to instance...</p>
              <p className="text-sm text-text-muted mt-1">Establishing secure websocket connection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
