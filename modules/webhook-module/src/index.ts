import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const m: Module = {
  manifest: manifest as any,
  async activate(k) {
    k.log.info('[Webhooks] Activating...');
  },
  async deactivate(k) {
    k.log.info('[Webhooks] Deactivating...');
  },
};
export default m;
export { WebhookDashboard } from './pages/WebhookDashboard';
export { WebhookLogs } from './pages/WebhookLogs';
export { useWebhooks } from './hooks/useWebhooks';
export { useWebhookStore } from './stores/webhookStore';
