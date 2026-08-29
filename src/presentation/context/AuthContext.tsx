/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../../domain/entities/User';
import { useDependencies } from '../../core/di/DependencyProvider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { useCases } = useDependencies();
  const { loginUseCase, logoutUseCase, getCurrentUserUseCase } = useCases;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load session on startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const result = await getCurrentUserUseCase.execute();
        if (result.success) {
          setUser(result.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session validation failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [getCurrentUserUseCase]);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginUseCase.execute(email, pass);
      if (result.success) {
        setUser(result.data);
      } else {
        setError(result.error.message || 'authentication_failed');
        throw result.error;
      }
    } catch (err: unknown) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loginUseCase]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const result = await logoutUseCase.execute();
      if (result.success) {
        setUser(null);
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  }, [logoutUseCase]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
