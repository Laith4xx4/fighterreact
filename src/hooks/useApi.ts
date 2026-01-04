import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiOptions<T> {
  autoFetch?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = { autoFetch: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const hasExecuted = useRef(false);

  const execute = useCallback(async () => {
    // Prevent multiple simultaneous executions
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiCall();
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [apiCall, isLoading]);

  useEffect(() => {
    // Track if component is mounted
    isMounted.current = true;

    // Auto-fetch only once if enabled and not already executed
    if (options.autoFetch !== false && !hasExecuted.current) {
      hasExecuted.current = true;
      execute();
    }

    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [options.autoFetch, execute]);

  return {
    data,
    isLoading,
    error,
    execute,
    refetch: execute,
  };
}
