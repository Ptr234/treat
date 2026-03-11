'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string; password: string; firstName: string; lastName: string; phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  resendVerificationCode: () => Promise<void>;
  clearError: () => void;
  clearVerification: () => void;
  refreshUser: () => Promise<void>;
  pendingVerification: { email: string; type: 'registration' | 'login' } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    pendingVerification: null,
  });

  // Stub implementations — admin auth implemented in Plan 03 via Sanity
  const login = async (_email: string, _password: string): Promise<void> => {
    setState(s => ({ ...s, error: 'Admin login not yet configured. Complete Phase 1 Plan 03.' }));
  };

  const register = async () => {
    setState(s => ({ ...s, error: 'Public registration is not available — admin-only platform.' }));
  };

  const logout = async () => {
    setState(s => ({ ...s, user: null, isAuthenticated: false }));
  };

  const googleSignIn = async () => {
    setState(s => ({ ...s, error: 'Google sign-in not configured.' }));
  };

  const noop = async () => {};

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyEmail: noop,
    googleSignIn,
    resendVerificationCode: noop,
    clearError: () => setState(s => ({ ...s, error: null })),
    clearVerification: () => setState(s => ({ ...s, pendingVerification: null })),
    refreshUser: noop,
    pendingVerification: state.pendingVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
