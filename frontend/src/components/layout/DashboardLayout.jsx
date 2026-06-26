import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-background text-text-primary flex selection:bg-primary/30 relative overflow-hidden">
      {/* Top Ambient Glow (inspired by the second image) */}
      <div className="absolute top-0 left-[calc(50%+130px)] -translate-x-1/2 w-[700px] h-[220px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      
      {/* Sidebar - Naturally takes up space in Flex layout */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col z-10 relative">
        <TopBar title={title} />
        
        <main className="flex-1 p-6 md:p-8 pb-12 w-full max-w-7xl mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
