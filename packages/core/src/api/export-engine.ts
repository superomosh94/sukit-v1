import type { Deployment } from "../types";

export interface ExportAdapter {
  toStatic(siteId: string): Promise<string>;
  toNextJS(siteId: string): Promise<string>;
  toGitHub(siteId: string, repo: string): Promise<void>;
  deploy(siteId: string, provider: "netlify" | "vercel"): Promise<Deployment>;
  getStatus(exportId: string): Promise<string>;
}

let _adapter: ExportAdapter | null = null;

export function setExportAdapter(adapter: ExportAdapter): void {
  _adapter = adapter;
}

export function createExportAPI(adapter?: ExportAdapter) {
  const a = () => adapter ?? _adapter;
  if (!a()) throw new Error("Export adapter not configured.");

  return {
    async toStatic(siteId: string): Promise<string> {
      return a()!.toStatic(siteId);
    },

    async toNextJS(siteId: string): Promise<string> {
      return a()!.toNextJS(siteId);
    },

    async toGitHub(siteId: string, repo: string): Promise<void> {
      return a()!.toGitHub(siteId, repo);
    },

    async deploy(siteId: string, provider: "netlify" | "vercel"): Promise<Deployment> {
      return a()!.deploy(siteId, provider);
    },
  };
}

export type ExportAPI = ReturnType<typeof createExportAPI>;
