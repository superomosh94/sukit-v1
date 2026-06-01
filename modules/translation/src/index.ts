import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const m: Module = {
  manifest: manifest as any,
  async activate(k) {
    k.log.info('[Translation] Activating...');
  },
  async deactivate(k) {
    k.log.info('[Translation] Deactivating...');
  },
};
export default m;
export { TranslationDashboard } from './pages/TranslationDashboard';
export { TranslationEditor } from './pages/TranslationEditor';
export { LanguageSwitcher } from './components/LanguageSwitcher';
export { useTranslation } from './hooks/useTranslation';
export { useTranslationStore } from './stores/translationStore';
