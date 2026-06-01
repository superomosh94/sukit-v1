import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const countdownModule: Module = {
  manifest: manifest as any,
  async activate(k: KernelForModule) {
    k.log.info('[Countdown] Activating...');
  },
  async deactivate(k: KernelForModule) {
    k.log.info('[Countdown] Deactivating...');
  },
};
export default countdownModule;
export { CountdownDashboard } from './pages/CountdownDashboard';
export { CountdownTimer } from './components/CountdownTimer';
export { useCountdown } from './hooks/useCountdown';
export { useCountdownStore } from './stores/countdownStore';
