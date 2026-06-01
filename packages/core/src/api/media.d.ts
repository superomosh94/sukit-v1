import type { MediaAsset, ImageOptions } from '../types';
export interface MediaAdapter {
  upload(file: File | Buffer, siteId: string): Promise<MediaAsset>;
  get(id: string): Promise<MediaAsset>;
  list(siteId: string): Promise<MediaAsset[]>;
  delete(id: string): Promise<void>;
  getUrl(id: string, options?: ImageOptions): string;
}
export declare function setMediaAdapter(adapter: MediaAdapter): void;
export declare function createMediaAPI(adapter?: MediaAdapter): {
  upload(file: File | Buffer, siteId: string): Promise<MediaAsset>;
  get(id: string): Promise<MediaAsset>;
  list(siteId: string): Promise<MediaAsset[]>;
  url(id: string, options?: ImageOptions): string;
  delete(id: string): Promise<void>;
};
export type MediaAPI = ReturnType<typeof createMediaAPI>;
//# sourceMappingURL=media.d.ts.map
