import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const m: Module = {
  manifest: manifest as any,
  async activate(k) {
    k.log.info('[PricingTable] Activating...');
  },
  async deactivate(k) {
    k.log.info('[PricingTable] Deactivating...');
  },
};
export default m;
export { PricingTableDashboard } from './pages/PricingTableDashboard';
export { PricingTable } from './components/PricingTable';
export { usePricing } from './hooks/usePricing';
export { usePricingStore } from './stores/pricingStore';
