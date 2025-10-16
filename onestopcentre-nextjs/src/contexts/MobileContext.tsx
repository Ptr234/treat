'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  mobileMenuOpen: boolean;
}

type MobileAction =
  | { type: 'SET_SCREEN_SIZE'; payload: { width: number; height: number } }
  | { type: 'SET_ORIENTATION'; payload: 'portrait' | 'landscape' }
  | { type: 'SET_TOUCH_DEVICE'; payload: boolean }
  | { type: 'TOGGLE_MOBILE_MENU' }
  | { type: 'SET_MOBILE_MENU'; payload: boolean };

interface MobileContextType extends MobileState {
  toggleMobileMenu: () => void;
  setMobileMenu: (open: boolean) => void;
}

const mobileReducer = (state: MobileState, action: MobileAction): MobileState => {
  switch (action.type) {
    case 'SET_SCREEN_SIZE':
      const { width, height } = action.payload;
      return {
        ...state,
        screenWidth: width,
        screenHeight: height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      };
    case 'SET_ORIENTATION':
      return {
        ...state,
        orientation: action.payload
      };
    case 'SET_TOUCH_DEVICE':
      return {
        ...state,
        touchDevice: action.payload
      };
    case 'TOGGLE_MOBILE_MENU':
      return {
        ...state,
        mobileMenuOpen: !state.mobileMenuOpen
      };
    case 'SET_MOBILE_MENU':
      return {
        ...state,
        mobileMenuOpen: action.payload
      };
    default:
      return state;
  }
};

const getInitialScreenSize = () => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

const getInitialOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'landscape';
  
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

const getInitialTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

const initialScreenSize = getInitialScreenSize();

const initialState: MobileState = {
  isMobile: initialScreenSize.width < 768,
  isTablet: initialScreenSize.width >= 768 && initialScreenSize.width < 1024,
  isDesktop: initialScreenSize.width >= 1024,
  screenWidth: initialScreenSize.width,
  screenHeight: initialScreenSize.height,
  orientation: getInitialOrientation(),
  touchDevice: getInitialTouchDevice(),
  mobileMenuOpen: false
};

const MobileContext = createContext<MobileContextType | undefined>(undefined);

interface MobileProviderProps {
  children: ReactNode;
}

export const MobileProvider: React.FC<MobileProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(mobileReducer, initialState);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      dispatch({ 
        type: 'SET_SCREEN_SIZE', 
        payload: { width, height } 
      });
      
      dispatch({ 
        type: 'SET_ORIENTATION', 
        payload: height > width ? 'portrait' : 'landscape' 
      });
      
      // Close mobile menu when switching to desktop
      if (width >= 1024 && state.mobileMenuOpen) {
        dispatch({ type: 'SET_MOBILE_MENU', payload: false });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.mobileMenuOpen]);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      // Small delay to get accurate dimensions after orientation change
      setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        dispatch({ 
          type: 'SET_SCREEN_SIZE', 
          payload: { width, height } 
        });
        
        dispatch({ 
          type: 'SET_ORIENTATION', 
          payload: height > width ? 'portrait' : 'landscape' 
        });
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!state.mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target && !target.closest('[data-mobile-menu]')) {
        dispatch({ type: 'SET_MOBILE_MENU', payload: false });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [state.mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.mobileMenuOpen) {
        dispatch({ type: 'SET_MOBILE_MENU', payload: false });
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state.mobileMenuOpen]);

  const toggleMobileMenu = () => {
    dispatch({ type: 'TOGGLE_MOBILE_MENU' });
  };

  const setMobileMenu = (open: boolean) => {
    dispatch({ type: 'SET_MOBILE_MENU', payload: open });
  };

  const value: MobileContextType = {
    ...state,
    toggleMobileMenu,
    setMobileMenu
  };

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  );
};

export const useMobile = (): MobileContextType => {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
};

export default MobileContext;