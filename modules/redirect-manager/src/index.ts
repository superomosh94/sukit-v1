import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const m: Module = {
  manifest: manifest as any,
  async activate(k) {
    k.log.info('[Redirect] Activating...');
  },
  async deactivate(k) {
    k.log.info('[Redirect] Deactivating...');
  },
};
export default m;
export { RedirectDashboard } from './pages/RedirectDashboard';
export { useRedirects } from './hooks/useRedirects';
export { useRedirectStore } from './stores/redirectStore';
