interface CachedPromise<T> {
  value: Promise<T>;
  loadedAt: number;
}

export function withExpiringCache<T>(load: (key: string) => Promise<T>, durationMs: number): (key: string) => Promise<T> {
  const cache = new Map<string, CachedPromise<T>>();

  return key => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.loadedAt < durationMs) return cached.value;

    const value = load(key);
    cache.set(key, { value, loadedAt: Date.now() });
    value.catch(() => cache.delete(key));
    return value;
  };
}
