import type { MediaAsset, ImageOptions } from '../types';

export interface MediaAdapter {
  upload(file: File | Buffer, siteId: string): Promise<MediaAsset>;
  get(id: string): Promise<MediaAsset>;
  list(siteId: string): Promise<MediaAsset[]>;
  delete(id: string): Promise<void>;
  getUrl(id: string, options?: ImageOptions): string;
}

let _adapter: MediaAdapter | null = null;

export function setMediaAdapter(adapter: MediaAdapter): void {
  _adapter = adapter;
}

export function createMediaAPI(adapter?: MediaAdapter) {
  const a = () => adapter ?? _adapter;

  return {
    async upload(file: File | Buffer, siteId: string): Promise<MediaAsset> {
      return a()!.upload(file, siteId);
    },

    async get(id: string): Promise<MediaAsset> {
      return a()!.get(id);
    },

    async list(siteId: string): Promise<MediaAsset[]> {
      return a()!.list(siteId);
    },

    url(id: string, options?: ImageOptions): string {
      return a()!.getUrl(id, options);
    },

    async delete(id: string): Promise<void> {
      return a()!.delete(id);
    },
  };
}

export type MediaAPI = ReturnType<typeof createMediaAPI>;
