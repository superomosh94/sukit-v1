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
  const events = new Map<string, Array<(event: string, key: string) => void>>();
  let statsHits = 0;
  let statsMisses = 0;

  return {
    async get<T>(key: string): Promise<T | null> {
      const val = await a()!.get<T>(key);
      if (val !== null) statsHits++;
      else statsMisses++;
      return val;
    },

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
      await a()!.set(key, value, ttl);
      this._emit('set', key);
    },

    async delete(key: string): Promise<void> {
      await a()!.delete(key);
      this._emit('delete', key);
    },

    async clear(): Promise<void> {
      await a()!.clear();
    },

    async increment(key: string, by?: number): Promise<number> {
      return a()!.increment(key, by);
    },

    /* --- Tags --- */
    tagIndex: new Map<string, Set<string>>(),

    async setWithTags<T>(
      key: string,
      value: T,
      tags: string[],
      ttl?: number
    ): Promise<void> {
      await this.set(key, value, ttl);
      for (const tag of tags) {
        if (!this.tagIndex.has(tag)) this.tagIndex.set(tag, new Set());
        this.tagIndex.get(tag)!.add(key);
      }
    },

    async invalidateTag(tag: string): Promise<void> {
      const keys = this.tagIndex.get(tag);
      if (!keys) return;
      for (const key of keys) {
        await this.delete(key);
      }
      this.tagIndex.delete(tag);
    },

    /* --- Namespace --- */
    namespace(prefix: string) {
      return {
        get: <T>(key: string) => this.get<T>(`${prefix}:${key}`),
        set: <T>(key: string, value: T, ttl?: number) =>
          this.set(`${prefix}:${key}`, value, ttl),
        delete: (key: string) => this.delete(`${prefix}:${key}`),
      };
    },

    /* --- Stats --- */
    getStats(): { hits: number; misses: number; entries: number } {
      return {
        hits: statsHits,
        misses: statsMisses,
        entries: this.tagIndex.size,
      };
    },

    /* --- Events --- */
    on(event: string, handler: (event: string, key: string) => void): void {
      if (!events.has(event)) events.set(event, []);
      events.get(event)!.push(handler);
    },

    _emit(event: string, key: string): void {
      const handlers = events.get(event) ?? [];
      for (const handler of handlers) handler(event, key);
    },
  };
}

export type CacheAPI = ReturnType<typeof createCacheAPI>;
