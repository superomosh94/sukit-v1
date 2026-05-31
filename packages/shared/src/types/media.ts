export type StorageType = 'local' | 's3' | 'r2';

export interface StorageConfig {
  type: StorageType;
  basePath?: string;
  bucket?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  cdnUrl?: string;
}

export interface MediaItem {
  id: string;
  siteId: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: string;
  siteId: string;
  name: string;
  parentId?: string;
  path: string;
  createdAt: string;
}
