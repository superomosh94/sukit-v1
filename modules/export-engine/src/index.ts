import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

const exportEngineModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[ExportEngine] Activating...');

    kernel.ui.registerSlot('deploy:export', () => null, { position: 10 });

    kernel.api.post('/api/export/:siteId', async (_req, params) => {
      const siteId = params.siteId;
      try {
        const { exportFullStack } = await import('./export-adapter.js');
        const tree = await exportFullStack(siteId);
        return new Response(
          JSON.stringify({
            exportId: crypto.randomUUID(),
            format: 'fullstack',
            status: 'completed',
            fileCount: tree.size,
            totalSize: tree.totalBytes(),
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: {
              message: err instanceof Error ? err.message : 'Export failed',
            },
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    });

    kernel.blocks.register({
      type: 'exportButton',
      name: 'Export Button',
      description: 'One-click export to full-stack app',
      category: 'widgets',
      icon: 'Download',
      component: () => null,
      schema: {},
      defaultProps: {},
      defaultStyles: {},
    });

    kernel.events.on('site:export', async ({ siteId }: any) => {
      const { exportQueue } = await import('./ExportQueue.js');
      await exportQueue.queueExport(siteId);
    });

    kernel.log.info('[ExportEngine] Activated');
  },

  async deactivate(kernel: KernelForModule) {
    kernel.blocks.unregister('exportButton');
    kernel.log.info('[ExportEngine] Deactivated');
  },
};

export default exportEngineModule;
