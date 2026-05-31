export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  increment(key: string, by?: number): Promise<number>;
}

let _adapter: CacheAdapter | null = null;

export function setCacheAdapter(adapter: CacheAdapter): void {
  _adapter = adapter;
}

export function createCacheAPI(adapter?: CacheAdapter) {
  const a = () => adapter ?? _adapter;

  return {
    async get<T>(key: string): Promise<T | null> {
      return a()!.get<T>(key);
    },

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
      return a()!.set(key, value, ttl);
    },

    async delete(key: string): Promise<void> {
      return a()!.delete(key);
    },

    async clear(): Promise<void> {
      return a()!.clear();
    },
  };
}

export type CacheAPI = ReturnType<typeof createCacheAPI>;
