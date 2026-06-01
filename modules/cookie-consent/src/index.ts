import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const m: Module = {
  manifest: manifest as any,
  async activate(k) {
    k.log.info('[CookieConsent] Activating...');
  },
  async deactivate(k) {
    k.log.info('[CookieConsent] Deactivating...');
  },
};
export default m;
export { CookieConsentDashboard } from './pages/CookieConsentDashboard';
export { CookieBanner } from './components/CookieBanner';
export { useCookieConsent } from './hooks/useCookieConsent';
export { useCookieConsentStore } from './stores/cookieConsentStore';
