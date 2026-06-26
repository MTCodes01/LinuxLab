import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from './WindowManagerContext';
import { cn } from '../../utils/cn';
import { X, Minus, Plus } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Window({ windowData, isActive }) {
  const { id, title, component: Component, isMinimized, isMaximized, zIndex, width, height } = windowData;
  const { closeWindow, minimizeWindow, toggleMaximize, focusWindow, batterySaver } = useWindowManager();
  const [isDragging, setIsDragging] = useState(false);
  const dragConstraintsRef = useRef(null); // Actually, we'll let it drag freely or bound to desktop

  if (isMinimized) return null;

  const handlePointerDown = (e) => {
    focusWindow(id);
  };

  const springConfig = batterySaver 
    ? { duration: 0 } 
    : { type: 'spring', stiffness: 400, damping: 30 };

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        width: isMaximized ? '100vw' : width,
        height: isMaximized ? '100vh' : height,
        x: isMaximized ? 0 : undefined,
        y: isMaximized ? 0 : undefined,
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={springConfig}
      onPointerDown={handlePointerDown}
      drag={!isMaximized}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{
        position: 'absolute',
        top: isMaximized ? 0 : '10vh',
        left: isMaximized ? 0 : '10vw',
        zIndex,
      }}
      className={cn(
        "wireframe-panel flex flex-col overflow-hidden pointer-events-auto",
        isActive && "focused corner-accent",
        isDragging && "opacity-80"
      )}
    >
      {/* Title Bar */}
      <div 
        className={cn(
          "h-10 flex items-center justify-between px-4 select-none cursor-move",
          "border-b border-[rgba(255,255,255,0.08)] bg-[var(--color-surface)]"
        )}
      >
        <div className="flex gap-2 items-center group">
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] flex items-center justify-center cursor-pointer"
          >
            <X className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
            className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] flex items-center justify-center cursor-pointer"
          >
            <Minus className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
            className="w-3.5 h-3.5 rounded-full bg-[#27c93f] flex items-center justify-center cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <div className={cn(
          "font-heading text-sm font-semibold tracking-wider",
          isActive ? "text-text-main" : "text-text-muted"
        )}>
          {title}
        </div>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative bg-[var(--color-element)] p-0">
        <Component />
      </div>
    </motion.div>
  );
}
