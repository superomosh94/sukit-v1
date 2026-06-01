import type { Site, SiteOptions } from '../types';
export interface SitesAdapter {
  create(name: string, options?: SiteOptions): Promise<Site>;
  get(id: string): Promise<Site>;
  update(id: string, data: Partial<Site>): Promise<Site>;
  delete(id: string): Promise<void>;
  list(options?: { limit?: number; offset?: number }): Promise<Site[]>;
}
export declare function setSitesAdapter(adapter: SitesAdapter): void;
export declare function createSitesAPI(adapter?: SitesAdapter): {
  create(name: string, options?: SiteOptions): Promise<Site>;
  get(id: string): Promise<Site>;
  update(id: string, data: Partial<Site>): Promise<Site>;
  delete(id: string): Promise<void>;
  list(): Promise<Site[]>;
};
export type SitesAPI = ReturnType<typeof createSitesAPI>;
//# sourceMappingURL=sites.d.ts.map
