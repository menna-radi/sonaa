import React from 'react';
import { DependencyProvider } from './core/di/DependencyProvider';
import { LanguageProvider } from './presentation/context/LanguageContext';
import { AuthProvider, useAuth } from './presentation/context/AuthContext';
import { NavigationProvider } from './presentation/context/NavigationContext';
import { LoginPage } from './presentation/features/auth/pages/LoginPage';
import { DashboardPage } from './presentation/features/dashboard/pages/DashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          border: '3px solid rgba(0,0,0,0.06)', 
          borderTopColor: 'var(--color-primary)', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return user ? <DashboardPage /> : <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DependencyProvider>
        <AuthProvider>
          <LanguageProvider>
            <NavigationProvider>
              <AppContent />
            </NavigationProvider>
          </LanguageProvider>
        </AuthProvider>
      </DependencyProvider>
    </QueryClientProvider>
  );
};

export default App;
