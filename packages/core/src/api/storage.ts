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
  if (!a()) throw new Error("Storage adapter not configured. Call setStorageAdapter() or pass to createKernel().");

  const prefixed = (key: string) => `${prefix}:${key}`;

  return {
    async get<T>(key: string): Promise<T | null> {
      return a()!.get<T>(prefixed(key));
    },

    async set<T>(key: string, value: T): Promise<void> {
      return a()!.set(prefixed(key), value);
    },

    async delete(key: string): Promise<void> {
      return a()!.delete(prefixed(key));
    },

    async has(key: string): Promise<boolean> {
      return a()!.has(prefixed(key));
    },
  };
}

export type StorageAPI = ReturnType<typeof createStorageAPI>;
