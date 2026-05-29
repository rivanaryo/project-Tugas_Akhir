import React from 'react';
import type { ReactNode } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
