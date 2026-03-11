// Export all contexts
export { AuthProvider, useAuth } from './AuthContext';
export { NotificationProvider, useNotification } from './NotificationContext';
export { ThemeProvider, useTheme } from './ThemeContext';
export { MobileProvider, useMobile } from './MobileContext';

// Re-export context types from their original locations
export type { AuthState, User } from '../types';
export type { Notification } from './NotificationContext';
export type { ThemeMode } from './ThemeContext';