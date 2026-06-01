'use client';

import React, {
  createContext,
  useContext,
  type ReactNode,
  useCallback,
  useRef,
} from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface SlotCacheContextValue {
  get: (key: string) => any | null;
  set: (key: string, data: any) => void;
  invalidate: (key?: string) => void;
}

const SlotCacheContext = createContext<SlotCacheContextValue | null>(null);

export function useSlotCache() {
  const ctx = useContext(SlotCacheContext);
  if (!ctx)
    throw new Error('useSlotCache must be used within SlotCacheProvider');
  return ctx;
}

export interface SlotCacheProviderProps {
  children: ReactNode;
  ttl?: number;
}

export function SlotCacheProvider({
  children,
  ttl = 60000,
}: SlotCacheProviderProps) {
  const cache = useRef<Map<string, CacheEntry>>(new Map());

  const get = useCallback(
    (key: string) => {
      const entry = cache.current.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > ttl) {
        cache.current.delete(key);
        return null;
      }
      return entry.data;
    },
    [ttl]
  );

  const set = useCallback((key: string, data: any) => {
    cache.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const invalidate = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  return (
    <SlotCacheContext.Provider value={{ get, set, invalidate }}>
      {children}
    </SlotCacheContext.Provider>
  );
}
