'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, AuthResponse } from '@/types';
import apiClient from '@/lib/api';

// Auth context type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  googleSignIn: (token: string) => Promise<void>;
  resendVerificationCode: () => Promise<void>;
  clearError: () => void;
  clearVerification: () => void;
  refreshUser: () => Promise<void>;
  pendingVerification: { email: string; type: 'registration' | 'login' } | null;
}

// Auth action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_PENDING_VERIFICATION'; payload: { email: string; type: 'registration' | 'login' } | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_VERIFICATION' }
  | { type: 'LOGOUT' };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        isLoading: false,
        pendingVerification: null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_PENDING_VERIFICATION':
      return { ...state, pendingVerification: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'CLEAR_VERIFICATION':
      return { ...state, pendingVerification: null };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        pendingVerification: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  pendingVerification: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if user has a valid token
      const token = localStorage.getItem('authToken');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Verify token with backend
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data as User });
      } else {
        // Invalid token, remove it
        localStorage.removeItem('authToken');
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.login(email, password);
      
      if (response.success) {
        const data = response.data as AuthResponse;
        if (data?.token) {
          // Direct login success
          localStorage.setItem('authToken', data.token);
          dispatch({ type: 'SET_USER', payload: data.user as User });
        } else {
          // Requires email verification
          dispatch({ type: 'SET_PENDING_VERIFICATION', payload: { email, type: 'login' } });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Login failed' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.register(userData);
      
      if (response.success) {
        // Registration successful, user needs to verify email
        dispatch({ type: 'SET_PENDING_VERIFICATION', payload: { email: userData.email, type: 'registration' } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Registration failed' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.verifyEmail(code);
      
      if (response.success && response.data) {
        const data = response.data as AuthResponse;
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          dispatch({ type: 'SET_USER', payload: data.user });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Email verification failed' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email verification failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const googleSignIn = async (token: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.googleAuth(token);
      
      if (response.success) {
        const data = response.data as AuthResponse;
        if (data?.token) {
          localStorage.setItem('authToken', data.token);
          dispatch({ type: 'SET_USER', payload: data.user });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
          // May require email verification
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Google sign-in failed' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const resendVerificationCode = async () => {
    if (!state.pendingVerification) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.request('/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({ email: state.pendingVerification.email }),
      });
      
      if (!response.success) {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to resend code' });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend code';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearVerification = () => {
    dispatch({ type: 'CLEAR_VERIFICATION' });
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data as User });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyEmail,
    googleSignIn,
    resendVerificationCode,
    clearError,
    clearVerification,
    refreshUser,
    pendingVerification: state.pendingVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;