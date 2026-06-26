import { useWindowManager } from './WindowManagerContext';
import Window from './Window';
import Dock from './Dock';
import { cn } from '../../utils/cn';
import { useAuth } from '../../auth/AuthContext';

export default function Desktop() {
  const { windows, activeWindowId, batterySaver } = useWindowManager();
  const { user } = useAuth();

  return (
    <div className="relative w-screen h-screen overflow-hidden text-text-main">
      {/* Background patterns */}
      <div className={cn(
        "absolute inset-0 bg-matrix-pattern z-0",
        !batterySaver && "scanlines"
      )} />

      {/* Desktop Workspace */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* We can place desktop icons here later if needed */}
      </div>

      {/* Windows Area */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {windows.map((w) => (
          <Window
            key={w.id}
            windowData={w}
            isActive={w.id === activeWindowId}
          />
        ))}
      </div>

      {/* Dock Area */}
      <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Dock />
        </div>
      </div>
    </div>
  );
}
