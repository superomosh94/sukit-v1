export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}
export declare function setStorageAdapter(adapter: StorageAdapter): void;
export declare function createStorageAPI(
  prefix: string,
  adapter?: StorageAdapter
): {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
};
export type StorageAPI = ReturnType<typeof createStorageAPI>;
//# sourceMappingURL=storage.d.ts.map
