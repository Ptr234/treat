'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '@/types';
import { apiFetch } from '@/lib/api-client';

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

/** Normalize auth responses from both Next.js and ASP.NET backends */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractUser(data: any): User | null {
  if (!data) return null;
  // ASP.NET returns { id, email, name, role, picture }
  // Next.js  returns { user: { id, email, name, role, picture } }
  const u = data.user ?? data;
  if (!u?.email) return null;
  return {
    id: u.id ?? u.sub, name: u.name, email: u.email, role: u.role,
    picture: u.picture, isVerified: true,
    createdAt: u.createdAt ?? new Date().toISOString(),
    updatedAt: u.updatedAt ?? new Date().toISOString(),
  };
}

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
      const json = await apiFetch('/api/auth/me');
      if (json.success && json.data) {
        const user = extractUser(json.data);
        if (user) {
          setState({ user, isAuthenticated: true, isLoading: false, error: null });
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

    const json = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!json.success) {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error(json.error || 'Login failed');
    }

    const user = extractUser(json.data);
    setState({ user, isAuthenticated: true, isLoading: false, error: null });
  }, []);

  // ── Login with Google credential ──────────────────────────────────
  const loginWithGoogle = useCallback(async (credential: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));

    const json = await apiFetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken: credential }),
    });

    if (!json.success) {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error(json.error || 'Google login failed');
    }

    const user = extractUser(json.data);
    setState({ user, isAuthenticated: true, isLoading: false, error: null });
  }, []);

  // ── Logout via API ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
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
