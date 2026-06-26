import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary flex relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed top-0 inset-x-0 h-80 z-0 opacity-60"
        style={{
          background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        <TopBar onMobileMenuOpen={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-5 md:p-7 pb-12 animate-fade-in">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
