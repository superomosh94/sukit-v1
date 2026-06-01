import type { Deployment } from '../types';
export interface ExportAdapter {
  toStatic(siteId: string): Promise<string>;
  toNextJS(siteId: string): Promise<string>;
  toGitHub(siteId: string, repo: string): Promise<void>;
  deploy(siteId: string, provider: 'netlify' | 'vercel'): Promise<Deployment>;
  getStatus(exportId: string): Promise<string>;
}
export declare function setExportAdapter(adapter: ExportAdapter): void;
export declare function createExportAPI(adapter?: ExportAdapter): {
  toStatic(siteId: string): Promise<string>;
  toNextJS(siteId: string): Promise<string>;
  toGitHub(siteId: string, repo: string): Promise<void>;
  deploy(siteId: string, provider: 'netlify' | 'vercel'): Promise<Deployment>;
};
export type ExportAPI = ReturnType<typeof createExportAPI>;
//# sourceMappingURL=export-engine.d.ts.map
