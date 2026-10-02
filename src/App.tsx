import React from 'react';
import { DependencyProvider } from './core/di/DependencyProvider';
import { LanguageProvider } from './presentation/context/LanguageContext';
import { ThemeProvider } from './presentation/context/ThemeContext';
import { AuthProvider, useAuth } from './presentation/context/AuthContext';
import { NavigationProvider } from './presentation/context/NavigationContext';
import { ToastProvider } from './presentation/components/ui/Toast';
import { ConfirmProvider } from './presentation/components/ui/ConfirmDialog';
import { LoginPage } from './presentation/features/auth/pages/LoginPage';
import { DashboardPage } from './presentation/features/dashboard/pages/DashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (n, e) =>
        n < 1 &&
        !(
          e instanceof Error &&
          (e as { status?: number }).status &&
          [400, 401, 403, 404, 409].includes((e as { status?: number }).status!)
        ),
    },
  },
});

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface-page)' }}>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          border: '3px solid var(--border)', 
          borderTopColor: 'var(--text-strong)', 
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
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <NavigationProvider>
                <ToastProvider>
                  <ConfirmProvider>
                    <AppContent />
                  </ConfirmProvider>
                </ToastProvider>
              </NavigationProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </DependencyProvider>
    </QueryClientProvider>
  );
};

export default App;
