import React, { useContext } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('ProtectedRoute must be used within AuthProvider');
  }

  const { status, isAuthenticated, loading } = context;

  if (status === 'checking' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
