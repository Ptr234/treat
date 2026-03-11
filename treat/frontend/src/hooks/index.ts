// Export all custom hooks
export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebouncedCallback, useDebouncedSearch } from './useDebounce';
export { useApi, usePaginatedApi } from './useApi';
export { 
  useIntersectionObserver, 
  useInfiniteScroll, 
  useLazyImage, 
  useVisibilityTracker 
} from './useIntersectionObserver';

// Firestore data hooks
export { useFirestoreCollection } from './useFirestoreCollection';
export { useTickets } from './useTickets';
export { useEvents } from './useEvents';
export { useProjects } from './useProjects';
export { useDashboard } from './useDashboard';

// Re-export hook types
export type { UseApiOptions, ApiResponse, ApiState } from './useApi';
export type { UseIntersectionObserverOptions } from './useIntersectionObserver';