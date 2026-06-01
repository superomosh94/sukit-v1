export type StorageAdapter = {
  save(
    key: string,
    data: Buffer,
    contentType?: string
  ): Promise<{ url: string; key: string }>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string): string;
  size(key: string): Promise<number>;
};

import { writeFile, readFile, unlink, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

export class LocalStorageAdapter implements StorageAdapter {
  private root: string;
  private publicBaseUrl: string;

  constructor(root: string, publicBaseUrl: string) {
    this.root = root;
    this.publicBaseUrl = publicBaseUrl.replace(/\/$/, '');
  }

  private resolve(key: string): string {
    const safe = key.replace(/\.\./g, '').replace(/^\/+/, '');
    return join(this.root, safe);
  }

  async save(
    key: string,
    data: Buffer,
    _contentType?: string
  ): Promise<{ url: string; key: string }> {
    const path = this.resolve(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
    return { url: this.getUrl(key), key };
  }

  async read(key: string): Promise<Buffer> {
    return readFile(this.resolve(key));
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.resolve(key));
    } catch {}
  }

  async exists(key: string): Promise<boolean> {
    return existsSync(this.resolve(key));
  }

  getUrl(key: string): string {
    return `${this.publicBaseUrl}/${key.replace(/^\/+/, '')}`;
  }

  async size(key: string): Promise<number> {
    const s = await stat(this.resolve(key));
    return s.size;
  }
}

let _storage: StorageAdapter | null = null;
export function getStorage(): StorageAdapter {
  if (_storage) return _storage;
  const root = process.env.STORAGE_LOCAL_ROOT || './storage';
  const baseUrl = process.env.STORAGE_PUBLIC_URL || '/storage';
  _storage = new LocalStorageAdapter(root, baseUrl);
  return _storage;
}

export async function saveUpload(
  prefix: string,
  filename: string,
  data: Buffer
): Promise<string> {
  const key = `${prefix}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { url } = await getStorage().save(key, data);
  return url;
}
