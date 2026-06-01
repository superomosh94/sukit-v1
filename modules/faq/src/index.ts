import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const m: Module = {
  manifest: manifest as any,
  async activate(k) {
    k.log.info('[FAQ] Activating...');
  },
  async deactivate(k) {
    k.log.info('[FAQ] Deactivating...');
  },
};
export default m;
export { FaqDashboard } from './pages/FaqDashboard';
export { FaqCategories } from './pages/FaqCategories';
export { FaqAccordion } from './components/FaqAccordion';
export { useFaq } from './hooks/useFaq';
export { useFaqStore } from './stores/faqStore';
