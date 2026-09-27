import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomTabs } from './MobileBottomTabs';
import { useNavigation } from '../context/NavigationContext';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentPage } = useNavigation();

  // Close mobile drawer on route transition
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentPage]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="ui-shell app-container">
      {/* Persistent Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Column */}
      <div className="ui-shell__main main-content">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main
          className="ui-shell__content"
          style={{
            maxWidth: 'var(--content-max)',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>

      {/* Persistent Mobile Bottom Navigation */}
      <MobileBottomTabs onOpenSidebar={() => setSidebarOpen(true)} />
    </div>
  );
};
export default AppShell;
