import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const module$: Module = {
  manifest: manifest as any,
  async activate(k: KernelForModule) {
    k.log.info('[Newsletter] Activating...');
  },
  async deactivate(k: KernelForModule) {
    k.log.info('[Newsletter] Deactivating...');
  },
};
export default module$;
export { NewsletterDashboard } from './pages/NewsletterDashboard';
export { CampaignList } from './pages/CampaignList';
export { CampaignEditor } from './pages/CampaignEditor';
export { SubscriberList } from './pages/SubscriberList';
export { useNewsletter } from './hooks/useNewsletter';
export { useNewsletterStore } from './stores/newsletterStore';
