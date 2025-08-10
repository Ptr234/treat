import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client.js';
import secureTokenStorage from '../utils/secureTokenStorage.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingVerification, setPendingVerification] = useState(null);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.login(credentials);
      if (result.success && result.data?.requiresVerification) {
        setPendingVerification({
          email: result.data.email,
          type: 'login'
        });
      } else if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.register(userData);
      if (result.success && result.data?.requiresVerification) {
        setPendingVerification({
          email: result.data.email,
          type: 'registration'
        });
      } else if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (code) => {
    if (!pendingVerification) {
      throw new Error('No pending verification');
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.verifyEmail(
        pendingVerification.email, 
        code, 
        pendingVerification.type
      );
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        setPendingVerification(null);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async (idToken) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.googleSignIn(idToken);
      
      if (result.success && result.data?.requiresVerification) {
        setPendingVerification({
          email: result.data.email,
          type: result.data.isExistingUser ? 'login' : 'registration'
        });
      } else if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    if (!pendingVerification) {
      throw new Error('No pending verification');
    }
    
    try {
      setError(null);
      const result = await apiClient.resendVerificationCode(
        pendingVerification.email, 
        pendingVerification.type
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearVerification = () => {
    setPendingVerification(null);
    setError(null);
  };

  const logout = useCallback(async () => {
    await apiClient.logout();
    setUser(null);
    setError(null);
    setPendingVerification(null);
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiClient.verifyToken();
      if (result.success) {
        setUser(result.data.user);
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = await secureTokenStorage.getToken();
      if (token) {
        verifyToken();
      } else {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Listen for token expiration
    const handleTokenExpiration = () => {
      setUser(null);
      setError('Session expired. Please log in again.');
    };
    
    window.addEventListener('tokenExpired', handleTokenExpiration);
    
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiration);
    };
  }, [verifyToken]);

  const value = {
    user,
    login,
    register,
    verifyEmail,
    googleSignIn,
    resendVerificationCode,
    clearVerification,
    logout,
    loading,
    error,
    pendingVerification,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator' || user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};