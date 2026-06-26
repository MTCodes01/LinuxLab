import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-background text-text-primary flex selection:bg-primary/30">
      {/* Docked Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-[260px] min-h-screen flex flex-col transition-all duration-300">
        <TopBar title={title} />
        
        <main className="flex-1 p-6 md:p-8 pb-12 w-full max-w-7xl mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
