import { useState, useCallback } from 'react';

interface TauriCommandState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseTauriCommandReturn<T> extends TauriCommandState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useTauriCommand<T>(
  commandFn: (...args: never[]) => Promise<T>
): UseTauriCommandReturn<T> {
  const [state, setState] = useState<TauriCommandState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const typedFn = commandFn as (...a: unknown[]) => Promise<T>;
        const result = await typedFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [commandFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
