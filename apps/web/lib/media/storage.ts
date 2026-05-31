import type { StorageAdapter } from './types';

export type { StorageAdapter };

export class LocalStorageAdapter implements StorageAdapter {
  constructor(
    private basePath: string = process.env.UPLOAD_DIR ?? './uploads',
    private baseUrl: string = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/uploads`
  ) {}

  async upload(
    path: string,
    buffer: Buffer,
    _mimeType: string
  ): Promise<string> {
    const fs = await import('fs/promises');
    const fullPath = `${this.basePath}/${path}`;
    await fs.mkdir(fullPath.split('/').slice(0, -1).join('/'), {
      recursive: true,
    });
    await fs.writeFile(fullPath, buffer);
    return this.url(path);
  }

  async download(path: string): Promise<Buffer> {
    const fs = await import('fs/promises');
    return fs.readFile(`${this.basePath}/${path}`);
  }

  async delete(path: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.unlink(`${this.basePath}/${path}`);
  }

  url(path: string): string {
    return `${this.baseUrl}/${path}`;
  }
}

let _storageAdapter: StorageAdapter | null = null;

export async function getStorageAdapter(): Promise<StorageAdapter> {
  if (_storageAdapter) return _storageAdapter;

  const provider = process.env.STORAGE_PROVIDER ?? 'local';
  if (provider === 's3' || provider === 'r2') {
    const { S3StorageAdapter } = await import('./s3-adapter');
    _storageAdapter = new S3StorageAdapter();
  } else {
    _storageAdapter = new LocalStorageAdapter();
  }

  return _storageAdapter;
}
