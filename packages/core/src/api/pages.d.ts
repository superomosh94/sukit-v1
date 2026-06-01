import type { Page } from '../types';
export interface PagesAdapter {
  create(siteId: string, slug: string, title: string): Promise<Page>;
  get(siteId: string, pageId: string): Promise<Page>;
  save(page: Page): Promise<void>;
  delete(siteId: string, pageId: string): Promise<void>;
  list(siteId: string): Promise<Page[]>;
}
export declare function setPagesAdapter(adapter: PagesAdapter): void;
export declare function createPagesAPI(adapter?: PagesAdapter): {
  create(siteId: string, slug: string, title: string): Promise<Page>;
  get(siteId: string, pageId: string): Promise<Page>;
  save(page: Page): Promise<void>;
  delete(siteId: string, pageId: string): Promise<void>;
  list(siteId: string): Promise<Page[]>;
};
export type PagesAPI = ReturnType<typeof createPagesAPI>;
//# sourceMappingURL=pages.d.ts.map
