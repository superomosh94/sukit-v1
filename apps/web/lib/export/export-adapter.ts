import type { ExportAdapter, Deployment } from '@sukit/core';

export function createExportAdapter(): ExportAdapter {
  return {
    async toStatic(_siteId: string): Promise<string> {
      return '';
    },
    async toNextJS(_siteId: string): Promise<string> {
      return '';
    },
    async toGitHub(_siteId: string, _repo: string): Promise<void> {},
    async deploy(
      _siteId: string,
      _provider: 'netlify' | 'vercel'
    ): Promise<Deployment> {
      return {
        id: '',
        siteId: '',
        provider: 'netlify',
        status: 'success',
        createdAt: '',
      };
    },
    async getStatus(_exportId: string): Promise<string> {
      return 'completed';
    },
  };
}

export async function exportFullStack(_siteId: string) {
  const { exportFullStack: realExport } = await import(
    /* webpackIgnore: true */ '@sukit/export-engine/src/export-adapter.js'
  );
  return realExport(_siteId);
}

export async function exportToZip(_siteId: string): Promise<Uint8Array> {
  const { exportToZip: realExport } = await import(
    /* webpackIgnore: true */ '@sukit/export-engine/src/export-adapter.js'
  );
  return realExport(_siteId);
}
