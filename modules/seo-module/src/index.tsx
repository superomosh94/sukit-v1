import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

export { useSeoStore } from './stores/seoStore';
export { SeoDashboard } from './components/SeoDashboard';
export { MetaEditor } from './components/MetaEditor';
export { SchemaEditor } from './components/SchemaEditor';

const seoModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[SEO] Activating...');

    kernel.events.on('page:afterSave', async ({ pageId }) => {
      kernel.log.debug(`Generating meta tags for page ${pageId}`);
    });

    kernel.settings.registerPanel({
      id: 'seo',
      label: 'SEO Settings',
      icon: 'Search',
      component: () => <div>SEO Settings Panel</div>,
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[SEO] Deactivating...');
  },
};

export default seoModule;
