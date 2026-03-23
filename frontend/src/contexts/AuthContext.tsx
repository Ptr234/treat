'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // start true — checking session on mount
    error: null,
  });

  // ── Check existing session on mount ────────────────────────────────
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me/');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.user) {
          setState({
            user: json.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      }
    } catch {
      // Session check failed silently — user is not logged in
    }
    setState(s => ({ ...s, isLoading: false }));
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // ── Login via API ──────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));

    const res = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error(json.error || 'Login failed');
    }

    setState({
      user: json.data.user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  // ── Login with Google credential ──────────────────────────────────
  const loginWithGoogle = useCallback(async (credential: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));

    const res = await fetch('/api/auth/google/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error(json.error || 'Google login failed');
    }

    setState({
      user: json.data.user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  // ── Logout via API ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await fetch('/api/auth/logout/', { method: 'POST' });
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

  const value: AuthContextType = {
    ...state,
    login,
    loginWithGoogle,
    logout,
    clearError,
    refreshUser: checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
