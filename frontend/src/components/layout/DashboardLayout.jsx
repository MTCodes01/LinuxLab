import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-desktop relative overflow-hidden text-text-primary">
      <div className="absolute inset-0 bg-matrix-pattern pointer-events-none opacity-50" />
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
