import type { CacheAdapter } from '@sukit/core';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export function createMemoryCacheAdapter(): CacheAdapter {
  const store = new Map<string, CacheEntry<any>>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.expiresAt > 0 && entry.expiresAt <= now) {
        store.delete(key);
      }
    }
  }, 60_000);

  return {
    async get<T>(key: string): Promise<T | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt > 0 && entry.expiresAt <= Date.now()) {
        store.delete(key);
        return null;
      }
      return entry.value as T;
    },

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
      store.set(key, {
        value,
        expiresAt: ttl ? Date.now() + ttl * 1000 : 0,
      });
    },

    async delete(key: string): Promise<void> {
      store.delete(key);
    },

    async clear(): Promise<void> {
      store.clear();
    },

    async increment(key: string, by = 1): Promise<number> {
      const entry = store.get(key);
      const current = (entry?.value as number) ?? 0;
      const next = current + by;
      store.set(key, { value: next, expiresAt: entry?.expiresAt ?? 0 });
      return next;
    },
  };
}
