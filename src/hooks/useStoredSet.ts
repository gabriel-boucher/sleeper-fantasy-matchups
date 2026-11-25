import { useEffect, useState } from 'react';
import { toggleInSet } from '../utils/collections';
import { readStoredJson, writeStoredJson } from '../utils/storage';

function readStoredSet<K extends string>(storageKey: string, allowedKeys: readonly K[], defaultKeys: readonly K[]): ReadonlySet<K> {
  const stored = readStoredJson<unknown>(storageKey);
  return new Set(Array.isArray(stored) ? allowedKeys.filter(key => stored.includes(key)) : defaultKeys);
}

export interface StoredSetState<K extends string> {
  keys: ReadonlySet<K>;
  toggle: (key: K) => void;
  clear: () => void;
}

export function useStoredSet<K extends string>(storageKey: string, allowedKeys: readonly K[], defaultKeys: readonly K[] = []): StoredSetState<K> {
  const [keys, setKeys] = useState(() => readStoredSet(storageKey, allowedKeys, defaultKeys));

  useEffect(() => {
    writeStoredJson(storageKey, [...keys]);
  }, [storageKey, keys]);

  return {
    keys,
    toggle: (key: K) => setKeys(current => toggleInSet(current, key)),
    clear: () => setKeys(new Set<K>())
  };
}
