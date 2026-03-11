'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  systemPreference: 'light' | 'dark';
}

type ThemeAction =
  | { type: 'SET_MODE'; payload: ThemeMode }
  | { type: 'SET_SYSTEM_PREFERENCE'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_THEME' };

interface ThemeContextType extends ThemeState {
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_MODE':
      const newMode = action.payload;
      const isDark = newMode === 'dark' || (newMode === 'system' && state.systemPreference === 'dark');
      return {
        ...state,
        mode: newMode,
        isDark
      };
    case 'SET_SYSTEM_PREFERENCE':
      const systemPreference = action.payload;
      const isDarkWithSystem = state.mode === 'dark' || (state.mode === 'system' && systemPreference === 'dark');
      return {
        ...state,
        systemPreference,
        isDark: isDarkWithSystem
      };
    case 'TOGGLE_THEME':
      const nextMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light';
      return {
        ...state,
        mode: nextMode,
        isDark: nextMode === 'dark'
      };
    default:
      return state;
  }
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  
  const stored = localStorage.getItem('theme') as ThemeMode;
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored;
  }
  return 'system';
};

const getSystemPreference = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState: ThemeState = {
  mode: 'system',
  isDark: false,
  systemPreference: 'light'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    const systemPreference = getSystemPreference();
    
    dispatch({ type: 'SET_SYSTEM_PREFERENCE', payload: systemPreference });
    dispatch({ type: 'SET_MODE', payload: initialTheme });
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_SYSTEM_PREFERENCE', payload: e.matches ? 'dark' : 'light' });
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    if (state.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.isDark]);

  const setTheme = (mode: ThemeMode) => {
    localStorage.setItem('theme', mode);
    dispatch({ type: 'SET_MODE', payload: mode });
  };

  const toggleTheme = () => {
    const newMode = state.mode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  const value: ThemeContextType = {
    ...state,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;