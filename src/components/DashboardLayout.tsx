import React from 'react';

interface DashboardLayoutProps {
  leftSidebar: React.ReactNode;
  header: React.ReactNode;
  chart: React.ReactNode;
  rightPanel: React.ReactNode;
  bottomPanel: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  leftSidebar,
  header,
  chart,
  rightPanel,
  bottomPanel,
}) => {
  return (
    <div className="h-screen w-screen bg-[#05050F] text-white overflow-hidden grid grid-cols-[60px_1fr_320px] grid-rows-[64px_1fr_auto]">
      {/* 
        Grid Areas:
        [Nav] [Header] [RightPanel]
        [Nav] [Chart ] [RightPanel]
        [Nav] [Bottom] [RightPanel]
      */}

      {/* Left Sidebar (Navigation) */}
      <aside className="col-start-1 row-start-1 row-span-3 z-50 border-r border-white/5 bg-[#05050F]/90 backdrop-blur-xl flex flex-col items-center py-4">
        {leftSidebar}
      </aside>

      {/* Top Bar (Header) */}
      <header className="col-start-2 row-start-1 z-40 border-b border-white/5 bg-[#05050F]/80 backdrop-blur-md px-6 flex items-center">
        {header}
      </header>

      {/* Center Stage (Chart) */}
      <main className="col-start-2 row-start-2 relative z-0 bg-deep-space">
        {/* Chart Container */}
        <div className="absolute inset-0">
          {chart}
        </div>
      </main>

      {/* Bottom Panel (The Terminal) */}
      <section className="col-start-2 row-start-3 z-30 border-t border-white/5 bg-[#05050F]/90 backdrop-blur-lg">
        {bottomPanel}
      </section>

      {/* Right Panel (Execution Deck) */}
      <aside className="col-start-3 row-start-1 row-span-3 z-50 border-l border-white/5 bg-[#05050F]/90 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        {rightPanel}
      </aside>
    </div>
  );
};

export default DashboardLayout;