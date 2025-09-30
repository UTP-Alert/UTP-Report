import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export const usePerformanceMonitor = (componentName: string, threshold: number = 100) => {
  const startTimeRef = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      const newMetrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now()
      };
      
      setMetrics(newMetrics);
      
      if (renderTime > threshold) {
        console.warn(
          `⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
          newMetrics
        );
      }
    };
  });

  return metrics;
};

export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  dependencies: React.DependencyList = [],
  timeout: number = 10000
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const executeOperation = async () => {
      setLoading(true);
      setError(null);
      
      // Cancel previous operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Operation timed out after ${timeout}ms`));
          }, timeout);
        });
        
        // Race between operation and timeout
        const result = await Promise.race([
          operation(),
          timeoutPromise
        ]);
        
        if (!abortControllerRef.current.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!abortControllerRef.current.signal.aborted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          console.error('Async operation failed:', error);
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    };

    executeOperation();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  const retry = () => {
    setError(null);
    // This will trigger the useEffect to run again
    setData(null);
  };

  return { data, loading, error, retry };
};