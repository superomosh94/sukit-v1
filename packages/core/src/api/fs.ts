import type { FileInfo } from '../types';

export interface FSAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readDirectory(path: string): Promise<FileInfo[]>;
  exists(path: string): Promise<boolean>;
  deleteFile(path: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
}

let _adapter: FSAdapter | null = null;

export function setFSAdapter(adapter: FSAdapter): void {
  _adapter = adapter;
}

export function createFSAPI(adapter?: FSAdapter) {
  const a = () => adapter ?? _adapter;

  return {
    async read(path: string): Promise<string> {
      return a()!.readFile(path);
    },

    async write(path: string, content: string): Promise<void> {
      return a()!.writeFile(path, content);
    },

    async exists(path: string): Promise<boolean> {
      return a()!.exists(path);
    },

    async list(dir: string): Promise<FileInfo[]> {
      return a()!.readDirectory(dir);
    },

    async delete(path: string): Promise<void> {
      return a()!.deleteFile(path);
    },
  };
}

export type FSAPI = ReturnType<typeof createFSAPI>;
