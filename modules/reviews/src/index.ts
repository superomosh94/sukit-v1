import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const module$: Module = {
  manifest: manifest as any,
  async activate(k: KernelForModule) {
    k.log.info('[Reviews] Activating...');
  },
  async deactivate(k: KernelForModule) {
    k.log.info('[Reviews] Deactivating...');
  },
};
export default module$;
export { ReviewsDashboard } from './pages/ReviewsDashboard';
export { ReviewModeration } from './pages/ReviewModeration';
export { ReviewForm } from './components/ReviewForm';
export { StarRating } from './components/StarRating';
export { useReviews } from './hooks/useReviews';
export { useReviewsStore } from './stores/reviewsStore';
