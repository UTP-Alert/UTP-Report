// Error handling utilities

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export class TimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage?: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(
          errorMessage || `Operation timed out after ${timeoutMs}ms`,
          timeoutMs
        )),
        timeoutMs
      )
    )
  ]);
};

export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  fallback?: T,
  errorHandler?: (error: Error) => void
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Async operation failed:', error);
    if (errorHandler) {
      errorHandler(error instanceof Error ? error : new Error(String(error)));
    }
    return fallback;
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

export const safeJsonParse = <T = any>(
  json: string,
  fallback: T
): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

export const logError = (error: Error, context?: string) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'
  };
  
  console.error('Application Error:', errorInfo);
  
  // In production, you might want to send this to an error tracking service
  // Example: Sentry.captureException(error, { extra: errorInfo });
};