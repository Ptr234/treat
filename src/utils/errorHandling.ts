export interface ApiError {
  message: string;
  code?: string | number;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface ErrorLogEntry {
  error: Error | ApiError;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  context?: Record<string, unknown>;
}

/**
 * Custom error class for API errors
 */
export class ApiErrorClass extends Error {
  public code?: string | number;
  public statusCode?: number;
  public details?: Record<string, unknown>;

  constructor(message: string, code?: string | number, statusCode?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Parse and normalize different types of errors
 */
export function parseError(error: unknown): ApiError {
  if (error instanceof ApiErrorClass) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR'
    };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      message: (typeof err.message === 'string' ? err.message : 
                typeof err.error === 'string' ? err.error : 
                'An unknown error occurred'),
      code: (typeof err.code === 'string' || typeof err.code === 'number' ? err.code : 
            typeof err.statusCode === 'number' ? err.statusCode : 
            'OBJECT_ERROR'),
      statusCode: (typeof err.statusCode === 'number' ? err.statusCode : 
                  typeof err.status === 'number' ? err.status : 
                  undefined),
      details: err.details && typeof err.details === 'object' ? err.details as Record<string, unknown> : err as Record<string, unknown>
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNEXPECTED_ERROR'
  };
}

/**
 * Get user-friendly error message based on error type/code
 */
export function getFriendlyErrorMessage(error: ApiError): string {
  if (error.statusCode) {
    switch (error.statusCode) {
      case 400:
        return 'Please check your input and try again.';
      case 401:
        return 'You need to log in to access this resource.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
    }
  }

  if (error.code) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Network connection issue. Please check your internet connection.';
      case 'TIMEOUT_ERROR':
        return 'Request timeout. Please try again.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'AUTH_ERROR':
        return 'Authentication failed. Please log in again.';
      case 'PERMISSION_ERROR':
        return 'You don\'t have permission to perform this action.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'RATE_LIMIT':
        return 'Too many requests. Please wait and try again.';
    }
  }

  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Log error to console and potentially external service
 */
export function logError(error: Error | ApiError, context?: Record<string, unknown>): void {
  const errorLog: ErrorLogEntry = {
    error,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    context
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog);
  }

  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorService(errorLog);
  }

  // Store in localStorage for offline analysis (with rotation)
  try {
    const storageKey = 'error_logs';
    const maxLogs = 50;
    
    const existingLogs = localStorage.getItem(storageKey);
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    logs.push(errorLog);
    
    // Keep only the latest logs
    if (logs.length > maxLogs) {
      logs.splice(0, logs.length - maxLogs);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(logs));
  } catch (storageError) {
    console.warn('Failed to store error log:', storageError);
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break; // Don't wait after the last attempt
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
      const finalDelay = delay + jitter;

      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }

  throw lastError;
}

/**
 * Create a wrapper for async functions with error handling
 */
export function withErrorHandling<Args extends unknown[], Return>(
  fn: (...args: Args) => Promise<Return>,
  onError?: (error: ApiError) => void
): (...args: Args) => Promise<Return> {
  return (async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const parsedError = parseError(error);
      logError(parsedError, { functionName: fn.name, args });
      
      if (onError) {
        onError(parsedError);
      }
      
      throw parsedError;
    }
  });
}

/**
 * Handle fetch responses and convert to ApiError if needed
 */
export async function handleFetchResponse(response: Response): Promise<unknown> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: Record<string, unknown> = {};

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorDetails = errorData;
    } catch {
      // Response is not JSON, use status text
    }

    throw new ApiErrorClass(
      errorMessage,
      response.status,
      response.status,
      errorDetails
    );
  }

  try {
    return await response.json();
  } catch {
    // If response is not JSON, return text
    return await response.text();
  }
}

/**
 * Global error handler for unhandled promises and errors
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(parseError(event.reason), { type: 'unhandledrejection' });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      type: 'uncaughtError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
}