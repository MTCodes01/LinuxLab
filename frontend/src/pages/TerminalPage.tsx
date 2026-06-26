import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TerminalPage() {
  const { containerId } = useParams();
  const navigate = useNavigate();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#09090B',
        foreground: '#FAFAFA',
        cursor: '#8B5CF6',
        black: '#111114',
        red: '#ef4444',
        green: '#10B981',
        yellow: '#F59E0B',
        blue: '#3B82F6',
        magenta: '#8B5CF6',
        cyan: '#0EA5E9',
        white: '#FAFAFA'
      },
      fontFamily: '"JetBrains Mono", monospace'
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    term.writeln(`Connecting to container ${containerId}...`);
    setTimeout(() => {
      term.writeln(`\x1b[32mConnected successfully.\x1b[0m`);
      term.write(`root@${containerId}:~# `);
    }, 1000);

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [containerId]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="font-mono text-sm text-primary">{containerId}</span>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <div ref={terminalRef} className="h-full w-full rounded-lg overflow-hidden border border-border p-2 bg-[#09090B]" />
      </div>
    </div>
  );
}
