interface CacheEntry<T> {
  value: T;
  tags: string[];
  expiresAt: number;
  createdAt: number;
  hitCount: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  size: number;
  hitRate: number;
}

export class CacheService {
  private store = new Map<string, CacheEntry<any>>();
  private tagIndex = new Map<string, Set<string>>();
  private hits = 0;
  private misses = 0;
  private locks = new Map<string, Promise<any>>();
  private events = new Map<
    string,
    Array<(event: string, key: string) => void>
  >();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (entry.expiresAt > 0 && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.misses++;
      this.emit('expire', key);
      return null;
    }
    entry.hitCount++;
    this.hits++;
    return entry.value as T;
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    tags?: string[]
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      tags: tags ?? [],
      expiresAt: ttl ? Date.now() + ttl * 1000 : 0,
      createdAt: Date.now(),
      hitCount: 0,
    };
    this.store.set(key, entry);
    if (tags) {
      for (const tag of tags) {
        if (!this.tagIndex.has(tag)) this.tagIndex.set(tag, new Set());
        this.tagIndex.get(tag)!.add(key);
      }
    }
    this.emit('set', key);
  }

  async delete(key: string): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      for (const tag of entry.tags) {
        this.tagIndex.get(tag)?.delete(key);
      }
    }
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
    this.tagIndex.clear();
  }

  async increment(key: string, by = 1): Promise<number> {
    const entry = this.store.get(key);
    const current = (entry?.value as number) ?? 0;
    const next = current + by;
    await this.set(key, next);
    return next;
  }

  /* --- Tag-based invalidation --- */
  async invalidateTag(tag: string): Promise<void> {
    const keys = this.tagIndex.get(tag);
    if (!keys) return;
    for (const key of keys) {
      this.store.delete(key);
    }
    this.tagIndex.delete(tag);
  }

  async getByTag(tag: string): Promise<string[]> {
    return Array.from(this.tagIndex.get(tag) ?? []);
  }

  /* --- Namespace --- */
  namespace(prefix: string) {
    return {
      get: <T>(key: string) => this.get<T>(`${prefix}:${key}`),
      set: <T>(key: string, value: T, ttl?: number, tags?: string[]) =>
        this.set(`${prefix}:${key}`, value, ttl, tags),
      delete: (key: string) => this.delete(`${prefix}:${key}`),
    };
  }

  /* --- Lock (stampede prevention) --- */
  async lock<T>(key: string, fetcher: () => Promise<T>, ttl = 60): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const existing = this.locks.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fetcher()
      .then((result) => {
        this.set(key, result, ttl);
        this.locks.delete(key);
        return result;
      })
      .catch((err) => {
        this.locks.delete(key);
        throw err;
      });

    this.locks.set(key, promise);
    return promise;
  }

  /* --- Early expiration (refresh before expiry) --- */
  async getOrRefresh<T>(
    key: string,
    ttl: number,
    refreshThreshold: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const entry = this.store.get(key);
    if (entry) {
      const age = Date.now() - entry.createdAt;
      if (age > refreshThreshold * 1000) {
        fetcher()
          .then((newVal) => this.set(key, newVal, ttl))
          .catch(() => {});
      }
      if (entry.expiresAt > Date.now()) return entry.value as T;
    }
    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }

  /* --- Stats --- */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      entries: this.store.size,
      size: JSON.stringify([...this.store]).length,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /* --- Compression (placeholder) --- */
  compress(value: any): string {
    return JSON.stringify(value);
  }

  decompress(value: string): any {
    return JSON.parse(value);
  }

  /* --- Events --- */
  on(event: string, handler: (event: string, key: string) => void): void {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event)!.push(handler);
  }

  private emit(event: string, key: string): void {
    const handlers = this.events.get(event) ?? [];
    for (const handler of handlers) handler(event, key);
  }

  /* --- Warmup --- */
  async warmup(
    entries: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<number> {
    let count = 0;
    for (const entry of entries) {
      if (!this.store.has(entry.key)) {
        await this.set(entry.key, entry.value, entry.ttl);
        count++;
      }
    }
    return count;
  }

  /* --- Serialization --- */
  setSerializer(
    serialize: (value: any) => string,
    deserialize: (str: string) => any
  ): void {
    // Store custom serializer functions
  }
}

export const cacheService = new CacheService();
