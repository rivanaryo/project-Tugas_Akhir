import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { AuthUser } from '../types/auth.types';
import { authService } from '../services/authService';

const isUnauthorizedError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 401;

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const err = error as ApiErrorShape;
    return err.response?.data?.message ?? err.message ?? 'Login failed';
  }

  return 'Login failed';
};

export const useAuth = () => {
  const storedUserOnMount = authService.getStoredUser();
  const hasStoredSession = !!storedUserOnMount?.email?.trim();

  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>(
    hasStoredSession ? 'authenticated' : 'checking'
  );
  const [user, setUser] = useState<AuthUser | null>(hasStoredSession ? storedUserOnMount : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate the HTTP-only cookie session with backend on app bootstrap.
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      try {
        const currentUser = await authService.getCurrentUser();
        authService.saveSession(currentUser);
        setUser(currentUser);
        setStatus('authenticated');
      } catch (err) {
        if (isUnauthorizedError(err)) {
          // Only clear session when the backend explicitly rejects the token.
          authService.clearSession();
          setUser(null);
          setStatus('unauthenticated');
        } else {
          // Non-401 errors (network, server) keep the optimistic state so the
          // user is not kicked out due to transient backend problems.
          // If there was no stored session at all, mark unauthenticated.
          if (!hasStoredSession) {
            setStatus('unauthenticated');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    void initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      setStatus('checking');

      const response = await authService.login({ email, password });
      const safeUser = response.user ?? { email };

      // Save user data and Bearer token returned by backend
      authService.saveSession(safeUser, response.token);

      setUser(safeUser);
      setStatus('authenticated');
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      setUser(null);
      setStatus('unauthenticated');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setError(null);
    setStatus('unauthenticated');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  const isAuthenticated = status === 'authenticated' && !!user?.email?.trim();

  return {
    status,
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    error,
  };
};
