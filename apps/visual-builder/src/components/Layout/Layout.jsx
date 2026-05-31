// src/components/Layout/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <TopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} />
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        {/* Right Sidebar (Contextual) */}
        {rightSidebarOpen && (
          <RightSidebar onClose={() => setRightSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default Layout;
