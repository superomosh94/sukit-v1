export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

let _adapter: StorageAdapter | null = null;

export function setStorageAdapter(adapter: StorageAdapter): void {
  _adapter = adapter;
}

export function createStorageAPI(prefix: string, adapter?: StorageAdapter) {
  const a = () => adapter ?? _adapter;
  const ttlTimers = new Map<string, NodeJS.Timeout>();

  const prefixed = (key: string) => `${prefix}:${key}`;

  const ensure = () => {
    const inst = a();
    if (!inst) throw new Error('Storage adapter not configured');
    return inst;
  };

  const setTtl = (key: string, ttl: number) => {
    const existing = ttlTimers.get(key);
    if (existing) clearTimeout(existing);
    ttlTimers.set(
      key,
      setTimeout(async () => {
        await ensure().delete(prefixed(key));
        ttlTimers.delete(key);
      }, ttl * 1000)
    );
  };

  return {
    async get<T>(key: string): Promise<T | null> {
      return ensure().get<T>(prefixed(key));
    },

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
      await ensure().set(prefixed(key), value);
      if (ttl && ttl > 0) setTtl(key, ttl);
    },

    async delete(key: string): Promise<void> {
      const existing = ttlTimers.get(key);
      if (existing) clearTimeout(existing);
      ttlTimers.delete(key);
      return ensure().delete(prefixed(key));
    },

    async has(key: string): Promise<boolean> {
      return ensure().has(prefixed(key));
    },

    async clear(): Promise<void> {
      // Clear TTLS
      for (const [, timer] of ttlTimers) clearTimeout(timer);
      ttlTimers.clear();
    },

    /* --- Encryption (basic placeholder) --- */
    encryptionKey: null as string | null,

    setEncryption(key: string): void {
      this.encryptionKey = key;
    },

    async setEncrypted(key: string, value: string): Promise<void> {
      if (!this.encryptionKey) throw new Error('Encryption key not set');
      const encrypted = Buffer.from(value).toString('base64');
      await ensure().set(prefixed(key), encrypted);
    },

    async getEncrypted(key: string): Promise<string | null> {
      const val = await ensure().get<string>(prefixed(key));
      if (!val) return null;
      return Buffer.from(val, 'base64').toString('utf-8');
    },
  };
}

export type StorageAPI = ReturnType<typeof createStorageAPI>;
