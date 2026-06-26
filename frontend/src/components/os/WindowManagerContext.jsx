import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const WindowManagerContext = createContext();

export function useWindowManager() {
  return useContext(WindowManagerContext);
}

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [highestZIndex, setHighestZIndex] = useState(10);
  const [batterySaver, setBatterySaver] = useState(false);

  const openWindow = useCallback((appId, config) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === appId);
      if (existing) {
        // Just bring to front and unminimize
        setActiveWindowId(appId);
        setHighestZIndex((z) => z + 1);
        return prev.map((w) =>
          w.id === appId
            ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 }
            : w
        );
      }

      // Open new window
      const newWindow = {
        id: appId,
        title: config.title || appId,
        icon: config.icon,
        component: config.component,
        isMinimized: false,
        isMaximized: false,
        zIndex: highestZIndex + 1,
        width: config.width || 800,
        height: config.height || 600,
      };

      setActiveWindowId(appId);
      setHighestZIndex((z) => z + 1);
      return [...prev, newWindow];
    });
  }, [highestZIndex]);

  const closeWindow = useCallback((appId) => {
    setWindows((prev) => prev.filter((w) => w.id !== appId));
    setActiveWindowId((current) => (current === appId ? null : current));
  }, []);

  const minimizeWindow = useCallback((appId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === appId ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((current) => (current === appId ? null : current));
  }, []);

  const toggleMaximize = useCallback((appId) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === appId ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
    focusWindow(appId);
  }, []);

  const focusWindow = useCallback((appId) => {
    setActiveWindowId(appId);
    setHighestZIndex((z) => z + 1);
    setWindows((prev) =>
      prev.map((w) =>
        w.id === appId ? { ...w, zIndex: highestZIndex + 1, isMinimized: false } : w
      )
    );
  }, [highestZIndex]);

  const toggleBatterySaver = useCallback(() => {
    setBatterySaver((b) => !b);
  }, []);

  const contextValue = useMemo(() => ({
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focusWindow,
    batterySaver,
    toggleBatterySaver
  }), [windows, activeWindowId, openWindow, closeWindow, minimizeWindow, toggleMaximize, focusWindow, batterySaver, toggleBatterySaver]);

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
    </WindowManagerContext.Provider>
  );
}
