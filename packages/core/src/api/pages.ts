import type { Page } from "../types";

export interface PagesAdapter {
  create(siteId: string, slug: string, title: string): Promise<Page>;
  get(siteId: string, pageId: string): Promise<Page>;
  save(page: Page): Promise<void>;
  delete(siteId: string, pageId: string): Promise<void>;
  list(siteId: string): Promise<Page[]>;
}

let _adapter: PagesAdapter | null = null;

export function setPagesAdapter(adapter: PagesAdapter): void {
  _adapter = adapter;
}

export function createPagesAPI(adapter?: PagesAdapter) {
  const a = () => adapter ?? _adapter;
  if (!a()) throw new Error("Pages adapter not configured.");

  return {
    async create(siteId: string, slug: string, title: string): Promise<Page> {
      return a()!.create(siteId, slug, title);
    },

    async get(siteId: string, pageId: string): Promise<Page> {
      return a()!.get(siteId, pageId);
    },

    async save(page: Page): Promise<void> {
      return a()!.save(page);
    },

    async delete(siteId: string, pageId: string): Promise<void> {
      return a()!.delete(siteId, pageId);
    },

    async list(siteId: string): Promise<Page[]> {
      return a()!.list(siteId);
    },
  };
}

export type PagesAPI = ReturnType<typeof createPagesAPI>;
