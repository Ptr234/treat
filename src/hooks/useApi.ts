import { useState, useEffect, useCallback, useRef } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiOptions<T = unknown> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export interface ApiResponse<T, Args extends unknown[] = unknown[]> extends ApiState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for making API calls with loading and error states
 * @param apiFunction - The API function to call
 * @param options - Configuration options
 * @returns Object with data, loading, error states and execute function
 */
export function useApi<T, Args extends unknown[] = unknown[]>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {}
): ApiResponse<T, Args> {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: immediate,
    error: null
  });

  const abortController = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      // Cancel previous request
      if (abortController.current) {
        abortController.current.abort();
      }

      // Create new abort controller
      abortController.current = new AbortController();

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        
        if (isMounted.current) {
          setState({
            data: result,
            loading: false,
            error: null
          });
          
          if (onSuccess) {
            onSuccess(result);
          }
        }
        
        return result;
      } catch (error: unknown) {
        if (isMounted.current && (error as Error).name !== 'AbortError') {
          const errorMessage = (error as Error).message || 'An unexpected error occurred';
          setState({
            data: null,
            loading: false,
            error: errorMessage
          });
          
          if (onError) {
            onError(errorMessage);
          }
        }
        return null;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset
  };
}

/**
 * Hook for making paginated API calls
 * @param apiFunction - The API function that accepts page and limit parameters
 * @param options - Configuration options
 * @returns Object with pagination state and controls
 */
export function usePaginatedApi<T, Args extends unknown[] = unknown[]>(
  apiFunction: (page: number, limit: number, ...args: Args) => Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>,
  options: UseApiOptions<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }> & { limit?: number } = {}
) {
  const { limit = 10, ...apiOptions } = options;
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, execute } = useApi(apiFunction, {
    ...apiOptions,
    onSuccess: (result) => {
      if (page === 1) {
        setAllData(result.data);
      } else {
        setAllData(prev => [...prev, ...result.data]);
      }
      setHasMore(result.page < result.totalPages);
      if (apiOptions.onSuccess) {
        apiOptions.onSuccess(result);
      }
    }
  });

  const loadPage = useCallback(
    (pageNum: number, ...args: Args) => {
      setPage(pageNum);
      return execute(pageNum, limit, ...args);
    },
    [execute, limit]
  );

  const loadMore = useCallback(
    (...args: Args) => {
      if (hasMore && !loading) {
        return loadPage(page + 1, ...args);
      }
      return Promise.resolve(null);
    },
    [hasMore, loading, page, loadPage]
  );

  const refresh = useCallback(
    (...args: Args) => {
      setAllData([]);
      setHasMore(true);
      return loadPage(1, ...args);
    },
    [loadPage]
  );

  return {
    data: allData,
    currentPageData: data?.data || [],
    loading,
    error,
    page,
    hasMore,
    totalPages: data?.totalPages || 0,
    total: data?.total || 0,
    loadPage,
    loadMore,
    refresh
  };
}