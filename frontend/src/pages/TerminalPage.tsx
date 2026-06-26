import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { ArrowLeft, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTerminalWSUrl } from '@/api/client';

export default function TerminalPage() {
  const { containerId } = useParams();
  const navigate = useNavigate();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !containerId) return;

    const term = new Terminal({
      cursorBlink: true,
      scrollback: 5000,
      // Tell xterm to receive binary data
      allowProposedApi: true,
      theme: {
        background: '#09090B',
        foreground: '#FAFAFA',
        cursor: '#8B5CF6',
        selectionBackground: '#8B5CF640',
        black: '#111114',
        red: '#ef4444',
        green: '#10B981',
        yellow: '#F59E0B',
        blue: '#3B82F6',
        magenta: '#8B5CF6',
        cyan: '#0EA5E9',
        white: '#FAFAFA',
        brightBlack: '#3f3f46',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#a78bfa',
        brightCyan: '#38bdf8',
        brightWhite: '#ffffff',
      },
      fontFamily: '"JetBrains Mono", "Cascadia Code", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.4,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln(`\x1b[2mConnecting to container ${containerId}...\x1b[0m`);

    const wsUrl = getTerminalWSUrl(containerId);
    // Use binary type so Docker raw stream arrives as ArrayBuffer, not garbled string
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      term.writeln(`\x1b[32mConnected successfully.\x1b[0m`);
      // Send initial resize
      const { cols, rows } = term;
      ws.send(`\x01${JSON.stringify({ type: 'resize', cols, rows })}`);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        // Binary: raw Docker output — write directly as Uint8Array
        term.write(new Uint8Array(event.data));
      } else {
        // Text fallback (error messages from backend)
        term.write(event.data);
      }
    };

    ws.onerror = () => {
      term.writeln(`\x1b[31m\r\nWebSocket connection error.\x1b[0m`);
    };

    ws.onclose = (evt) => {
      term.writeln(`\r\n\x1b[33mConnection closed${evt.reason ? `: ${evt.reason}` : '.'}\x1b[0m`);
    };

    // Send user keystrokes to backend
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Send resize events to backend
    term.onResize(({ cols, rows }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`\x01${JSON.stringify({ type: 'resize', cols, rows })}`);
      }
    });

    // Fit terminal on window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
    };
  }, [containerId]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090B]">
      {/* Toolbar */}
      <div className="h-12 border-b border-border flex items-center px-4 justify-between bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground hover:text-foreground h-8 px-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
            <span className="font-mono text-sm text-muted-foreground">
              container/<span className="text-foreground">{containerId}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 overflow-hidden p-2">
        <div
          ref={terminalRef}
          className="h-full w-full"
          style={{ padding: '6px' }}
        />
      </div>
    </div>
  );
}
