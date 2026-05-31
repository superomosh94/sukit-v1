export * from './types';
export * from './stores/mediaStore';
export { useMediaStore } from './stores/mediaStore';
export { MediaLibrary } from './components/MediaLibrary';
export { MediaDetails } from './components/MediaDetails';
export { UploadButton } from './components/UploadButton';

// Module lifecycle for kernel compatibility
import type { Module, KernelForModule } from '@sukit/core';
import { useMediaStore } from './stores/mediaStore';
import manifest from '../manifest.json';

const mediaLibraryModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[MediaLibrary] Activating...');

    kernel.events.on('media:afterUpload', async ({ data }: any) => {
      kernel.log.debug('Media uploaded', data);
      const store = useMediaStore.getState();
      await store.loadAssets(store.currentFolder ?? undefined);
    });
    kernel.events.on('media:afterDelete', async ({ data }: any) => {
      kernel.log.debug('Media deleted', data);
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[MediaLibrary] Deactivating...');
  },
};

export default mediaLibraryModule;
