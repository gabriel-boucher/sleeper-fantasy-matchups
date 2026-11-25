export function groupBy<T, K>(items: T[], getKey: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  items.forEach(item => {
    const key = getKey(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  });
  return groups;
}

export function filterEntries<V>(record: Record<string, V>, keep: (key: string, value: V) => boolean): Record<string, V> {
  return Object.fromEntries(Object.entries(record).filter(([key, value]) => keep(key, value)));
}

export function range(first: number, last: number): number[] {
  return Array.from({ length: Math.max(last - first + 1, 0) }, (_, i) => first + i);
}

export function toMapKeepingFirst<K, V>(entries: (readonly [K, V])[]): Map<K, V> {
  const map = new Map<K, V>();
  entries.forEach(([key, value]) => {
    if (!map.has(key)) map.set(key, value);
  });
  return map;
}

export function toggleInSet<T>(set: ReadonlySet<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}
