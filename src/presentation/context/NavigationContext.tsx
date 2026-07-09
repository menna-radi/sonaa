/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type PageKey =
  | 'overview'
  | 'live_activity'
  | 'craftsmen'
  | 'tasks'
  | 'verification'
  | 'reports'
  | 'payments'
  | 'analytics'
  | 'broadcast'
  | 'notifications'
  | 'ads'
  | 'campaigns'
  | 'scheduled'
  | 'expired'
  | 'promotions'
  | 'ad_analytics'
  | 'settings'
  | 'create_ad'
  | 'service_management';

const VALID_PAGES: PageKey[] = [
  'overview', 'live_activity', 'craftsmen', 'tasks', 'verification',
  'reports', 'payments', 'analytics', 'broadcast', 'notifications',
  'ads', 'campaigns', 'scheduled', 'expired', 'promotions',
  'ad_analytics', 'settings', 'create_ad', 'service_management',
];

const getInitialPage = (): PageKey => {
  const hash = window.location.hash.replace('#', '') as PageKey;
  return VALID_PAGES.includes(hash) ? hash : 'overview';
};

interface NavigationContextType {
  currentPage: PageKey;
  navigate: (page: PageKey) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageKey>(getInitialPage);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useCallback((page: PageKey) => {
    setCurrentPage(page);
    setSearchQuery(''); // Reset search query on page navigation
    window.location.hash = page;
  }, []);

  // Support browser back / forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageKey;
      setSearchQuery(''); // Reset search query on page navigation
      if (VALID_PAGES.includes(hash)) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('overview');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPage, navigate, searchQuery, setSearchQuery }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext;
