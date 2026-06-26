import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Floating Sidebar (fixed) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-[284px] min-h-screen flex flex-col transition-default">
        {/* Sticky TopBar */}
        <TopBar title={title} />
        
        {/* Page Content */}
        <main className="flex-1 p-8 pb-12 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
