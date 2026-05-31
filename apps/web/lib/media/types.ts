export interface StorageAdapter {
  upload(path: string, buffer: Buffer, mimeType: string): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  url(path: string): string;
}
