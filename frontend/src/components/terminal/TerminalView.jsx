import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { getTerminalWSUrl } from '../../api/client';

export default function TerminalView({ containerId, onConnectionChange }) {
  const termRef = useRef(null);
  const terminalInstance = useRef(null);
  const wsRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!termRef.current || !containerId) return;

    // Create terminal
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 14,
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        cursorAccent: '#0d1117',
        selectionBackground: 'rgba(56, 139, 253, 0.3)',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39d353',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d364',
        brightWhite: '#f0f6fc',
      },
      allowTransparency: true,
      scrollback: 5000,
    });

    // Addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(termRef.current);
    fitAddon.fit();

    terminalInstance.current = term;
    fitAddonRef.current = fitAddon;

    // Connect WebSocket
    const wsUrl = getTerminalWSUrl(containerId);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      onConnectionChange?.(true);
      // Send initial size
      const dims = fitAddon.proposeDimensions();
      if (dims) {
        ws.send('\x01' + JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }));
      }
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        term.write(new Uint8Array(event.data));
      } else {
        term.write(event.data);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      onConnectionChange?.(false);
      term.write('\r\n\x1b[31m[Connection closed]\x1b[0m\r\n');
    };

    ws.onerror = () => {
      setConnected(false);
      onConnectionChange?.(false);
    };

    // Terminal input → WebSocket
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims && ws.readyState === WebSocket.OPEN) {
        ws.send('\x01' + JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }));
      }
    };

    term.onResize(({ cols, rows }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('\x01' + JSON.stringify({ type: 'resize', cols, rows }));
      }
    });

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
    };
  }, [containerId]);

  return (
    <div className="relative w-full h-full">
      {/* Connection status */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-2 py-1 rounded-lg text-xs"
           style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-accent animate-pulse-glow' : 'bg-danger'}`} />
        <span className="text-text-muted">{connected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div ref={termRef} className="w-full h-full" style={{ padding: '8px' }} />
    </div>
  );
}
