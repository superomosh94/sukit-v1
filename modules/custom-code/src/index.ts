import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const m: Module = {
  manifest: manifest as any,
  async activate(k) {
    k.log.info('[CustomCode] Activating...');
  },
  async deactivate(k) {
    k.log.info('[CustomCode] Deactivating...');
  },
};
export default m;
export { CustomCodeDashboard } from './pages/CustomCodeDashboard';
export { useCustomCode } from './hooks/useCustomCode';
export { useCustomCodeStore } from './stores/customCodeStore';
