import type { Site, SiteOptions } from "../types";

export interface SitesAdapter {
  create(name: string, options?: SiteOptions): Promise<Site>;
  get(id: string): Promise<Site>;
  update(id: string, data: Partial<Site>): Promise<Site>;
  delete(id: string): Promise<void>;
  list(options?: { limit?: number; offset?: number }): Promise<Site[]>;
}

let _adapter: SitesAdapter | null = null;

export function setSitesAdapter(adapter: SitesAdapter): void {
  _adapter = adapter;
}

export function createSitesAPI(adapter?: SitesAdapter) {
  const a = () => adapter ?? _adapter;
  if (!a()) throw new Error("Sites adapter not configured.");

  return {
    async create(name: string, options?: SiteOptions): Promise<Site> {
      return a()!.create(name, options);
    },

    async get(id: string): Promise<Site> {
      return a()!.get(id);
    },

    async update(id: string, data: Partial<Site>): Promise<Site> {
      return a()!.update(id, data);
    },

    async delete(id: string): Promise<void> {
      return a()!.delete(id);
    },

    async list(): Promise<Site[]> {
      return a()!.list();
    },
  };
}

export type SitesAPI = ReturnType<typeof createSitesAPI>;
