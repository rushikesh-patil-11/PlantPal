import React, { ReactNode, useState } from 'react';
import { Navbar } from '../navbar';
import { Sidebar } from './sidebar';
import { MobileSidebar } from './mobile-sidebar';

interface MainLayoutProps {
  children: ReactNode;
  withSidebar?: boolean;
}

export function MainLayout({ children, withSidebar = true }: MainLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <Navbar 
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen} 
      />
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex flex-1">
        {withSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
