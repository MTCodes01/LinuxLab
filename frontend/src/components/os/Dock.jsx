import { motion } from 'framer-motion';
import { useWindowManager } from './WindowManagerContext';
import { Box, BookTemplate, FileText, BatteryCharging, Battery, Terminal } from 'lucide-react';
import { cn } from '../../utils/cn';

// Hardcode apps for now, later could come from a config
const DOCK_APPS = [
  { id: 'dashboard', title: 'System Overview', icon: Terminal },
  { id: 'containers', title: 'Containers', icon: Box },
  { id: 'templates', title: 'Templates', icon: BookTemplate },
  { id: 'logs', title: 'Activity Logs', icon: FileText },
];

function DockIcon({ app, isOpen, isMinimized, isActive, onClick }) {
  const { batterySaver } = useWindowManager();
  
  const springConfig = batterySaver 
    ? { duration: 0 } 
    : { type: 'spring', stiffness: 400, damping: 20 };

  return (
    <div className="relative group flex flex-col items-center">
      {/* Tooltip */}
      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity font-tech text-xs bg-[var(--color-surface)] border border-[var(--color-glass-border)] px-3 py-1 text-text-main uppercase whitespace-nowrap pointer-events-none">
        {app.title}
      </div>
      
      {/* Icon */}
      <motion.button
        whileHover={!batterySaver ? { scale: 1.15, y: -4 } : {}}
        whileTap={!batterySaver ? { scale: 0.95 } : {}}
        transition={springConfig}
        onClick={() => onClick(app)}
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
          isOpen ? "bg-[rgba(255,255,255,0.1)]" : "hover:bg-[rgba(255,255,255,0.05)]",
          isActive && "shadow-[0_0_15px_rgba(255,0,60,0.3)] border border-[rgba(255,0,60,0.5)]"
        )}
      >
        <app.icon className={cn("w-6 h-6", isOpen ? "text-neon-cyan" : "text-text-main")} />
      </motion.button>
      
      {/* Indicator */}
      <div className="h-2 w-full flex justify-center items-center mt-1">
        {isOpen && (
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isMinimized ? "bg-[var(--color-accent-yellow)]" : "bg-[var(--color-accent-pink)]",
            !isMinimized && "shadow-[0_0_8px_var(--color-accent-pink)]"
          )} />
        )}
      </div>
    </div>
  );
}

export default function Dock() {
  const { windows, activeWindowId, openWindow, batterySaver, toggleBatterySaver } = useWindowManager();

  const handleAppClick = (app) => {
    // We need to resolve the component for this app.
    // This will be handled in the Desktop or a global registry.
    // For now, we will fire an event or just open it if we have a registry.
    
    // Dispatch a custom event for the App.jsx to handle, or pass a callback.
    // Since WindowManagerContext has `openWindow`, we need the component.
    // We'll set the component lazily in App.jsx or pass a string ID and resolve it there.
    // Let's pass the string ID, we will map it to components when we call openWindow.
    window.dispatchEvent(new CustomEvent('launch-app', { detail: app.id }));
  };

  return (
    <div className="glass-pill px-4 pt-3 pb-1 flex gap-2 items-end">
      {DOCK_APPS.map((app) => {
        const win = windows.find(w => w.id === app.id);
        return (
          <DockIcon
            key={app.id}
            app={app}
            isOpen={!!win}
            isMinimized={win?.isMinimized}
            isActive={activeWindowId === app.id}
            onClick={handleAppClick}
          />
        );
      })}

      {/* Divider */}
      <div className="w-[1px] h-10 bg-[var(--color-glass-border)] mx-2 my-auto" />

      {/* Battery Saver Toggle */}
      <div className="relative group flex flex-col items-center">
        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity font-tech text-xs bg-[var(--color-surface)] border border-[var(--color-glass-border)] px-3 py-1 text-text-main uppercase whitespace-nowrap pointer-events-none">
          Battery Saver
        </div>
        <motion.button
          whileHover={!batterySaver ? { scale: 1.15, y: -4 } : {}}
          whileTap={!batterySaver ? { scale: 0.95 } : {}}
          onClick={toggleBatterySaver}
          className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          {batterySaver ? (
            <Battery className="w-6 h-6 text-neon-green" />
          ) : (
            <BatteryCharging className="w-6 h-6 text-text-muted" />
          )}
        </motion.button>
        <div className="h-2 w-full flex justify-center items-center mt-1">
          {batterySaver && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] shadow-[0_0_8px_var(--color-accent-green)]" />}
        </div>
      </div>
    </div>
  );
}
