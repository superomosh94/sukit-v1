import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const m: Module = {
  manifest: manifest as any,
  async activate(k) {
    k.log.info('[SocialFeed] Activating...');
  },
  async deactivate(k) {
    k.log.info('[SocialFeed] Deactivating...');
  },
};
export default m;
export { SocialFeedDashboard } from './pages/SocialFeedDashboard';
export { SocialFeedGrid } from './components/SocialFeedGrid';
export { SocialFeedCarousel } from './components/SocialFeedCarousel';
export { useSocialFeed } from './hooks/useSocialFeed';
export { useSocialFeedStore } from './stores/socialFeedStore';
