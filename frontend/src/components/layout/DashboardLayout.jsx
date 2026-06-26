import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-gradient-mesh" style={{ background: 'var(--color-surface-900)' }}>
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <Sidebar />
      <div className="ml-[240px] relative z-10">
        <TopBar title={title} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
