import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface Result<K, T> {
  key: K;
  data?: T;
  error?: string;
}

// Runs `load(key)` whenever `key` changes; a null key means nothing to load.
// `load` must be stable (e.g. a module-level function) to avoid refetching on every render.
export function useAsync<K, T>(key: K | null, load: (key: K) => Promise<T>): AsyncState<T> {
  const [result, setResult] = useState<Result<K, T> | null>(null);

  useEffect(() => {
    if (key === null) return;
    let ignore = false;

    load(key).then(
      data => { if (!ignore) setResult({ key, data }); },
      err => { if (!ignore) setResult({ key, error: err instanceof Error ? err.message : 'An error occurred' }); }
    );

    return () => { ignore = true; };
  }, [key, load]);

  const current = result?.key === key ? result : null;
  return {
    data: current?.data ?? null,
    loading: key !== null && current === null,
    error: current?.error ?? null
  };
}
