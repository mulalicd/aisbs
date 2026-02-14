import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : 300;
  });
  const [isResizing, setIsResizing] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const startResizing = React.useCallback((mouseDownEvent) => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  const resize = React.useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        // Calculate new width: mouse X position minus the left offset of the sidebar (18px)
        const newWidth = mouseMoveEvent.clientX - 18;
        if (newWidth >= 200 && newWidth <= 600) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  if (isHome) {
    return (
      <div className="book-cover-layout w-full">
        {children}
      </div>
    );
  }

  return (
    <div
      className={`app-layout relative ${isResizing ? 'resize-active' : ''}`}
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
    >
      {/* Mobile Menu Button - Visible < 1024px */}
      <button
        className="fixed top-4 right-4 z-[60] p-2 bg-black text-white rounded lg:hidden shadow-lg hover:bg-gray-800 transition-colors"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle Menu"
      >
        {isSidebarOpen ? 'Close X' : 'Menu ☰'}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with dynamic class */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'translate-x-0' : ''}`}>
        <Sidebar className={isSidebarOpen ? 'open' : ''} onClose={() => setIsSidebarOpen(false)} />
        {/* Resize Handle */}
        <div
          className={`resize-handle xl:block hidden ${isResizing ? 'dragging' : ''}`}
          onMouseDown={startResizing}
        />
      </div>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
