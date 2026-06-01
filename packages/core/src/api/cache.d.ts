export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  increment(key: string, by?: number): Promise<number>;
}
export declare function setCacheAdapter(adapter: CacheAdapter): void;
export declare function createCacheAPI(adapter?: CacheAdapter): {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
};
export type CacheAPI = ReturnType<typeof createCacheAPI>;
//# sourceMappingURL=cache.d.ts.map
