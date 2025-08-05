import { useState, useEffect } from 'react';
import apiClient from '../api/client.js';

// Custom hook for API calls with loading and error states
export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { immediate = true, ...requestOptions } = options;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.request(endpoint, requestOptions);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [endpoint, immediate]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for authenticated API calls
export function useAuthenticatedApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { immediate = true, ...requestOptions } = options;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const result = await apiClient.request(endpoint, requestOptions);
      setData(result);
    } catch (err) {
      setError(err.message);
      
      // Handle authentication errors
      if (err.message.includes('token') || err.message.includes('unauthorized')) {
        apiClient.logout();
        // Could redirect to login page here
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [endpoint, immediate]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (endpoint, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.request(endpoint, options);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

// Hook specifically for authentication
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.login(credentials);
      if (result.success) {
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
      if (result.success) {
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

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const verifyToken = async () => {
    try {
      setLoading(true);
      const result = await apiClient.verifyToken();
      if (result.success) {
        setUser(result.data.user);
      }
    } catch (err) {
      // Token is invalid, logout
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    user,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: !!user
  };
}