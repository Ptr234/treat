import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that debounces a callback function
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
  delay: number,
  deps: React.DependencyList = []
): (...args: Args) => Return {
  const [debouncedCallback, setDebouncedCallback] = useState<(...args: Args) => Return>(() => callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, delay, ...deps]);

  return debouncedCallback;
}

/**
 * Hook for debounced search functionality
 * @param searchValue - The search value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns Object with debounced value and loading state
 */
export function useDebouncedSearch(searchValue: string, delay: number = 300) {
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue, delay);

  useEffect(() => {
    if (searchValue !== debouncedSearchValue) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchValue, debouncedSearchValue]);

  return {
    debouncedValue: debouncedSearchValue,
    isSearching
  };
}