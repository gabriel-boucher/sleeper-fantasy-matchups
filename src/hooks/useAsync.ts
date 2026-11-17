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

const UNKNOWN_ERROR_MESSAGE = 'An error occurred';

export function useAsync<K, T>(key: K | null, loadWithStableIdentity: (key: K) => Promise<T>): AsyncState<T> {
  const [result, setResult] = useState<Result<K, T> | null>(null);

  useEffect(() => {
    if (key === null) return;
    let isStale = false;

    loadWithStableIdentity(key).then(
      data => { if (!isStale) setResult({ key, data }); },
      error => { if (!isStale) setResult({ key, error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE }); }
    );

    return () => { isStale = true; };
  }, [key, loadWithStableIdentity]);

  const resultForKey = result?.key === key ? result : null;
  return {
    data: resultForKey?.data ?? null,
    loading: key !== null && resultForKey === null,
    error: resultForKey?.error ?? null
  };
}
