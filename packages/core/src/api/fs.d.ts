import type { FileInfo } from '../types';
export interface FSAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readDirectory(path: string): Promise<FileInfo[]>;
  exists(path: string): Promise<boolean>;
  deleteFile(path: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
}
export declare function setFSAdapter(adapter: FSAdapter): void;
export declare function createFSAPI(adapter?: FSAdapter): {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  list(dir: string): Promise<FileInfo[]>;
  delete(path: string): Promise<void>;
};
export type FSAPI = ReturnType<typeof createFSAPI>;
