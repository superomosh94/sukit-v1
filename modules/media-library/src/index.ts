export * from './types';
export * from './stores/mediaStore';
export { useMediaStore } from './stores/mediaStore';
export { MediaLibrary } from './components/MediaLibrary';
export { MediaDetails } from './components/MediaDetails';
export { UploadButton } from './components/UploadButton';
export { MediaPicker } from './components/MediaPicker';
export { MediaDragPreview } from './components/MediaDragPreview';
export { ClipboardUpload } from './components/ClipboardUpload';
export { UrlImport } from './components/UrlImport';
export { BulkUpload } from './components/BulkUpload';
export { UploadQueueManager } from './components/UploadQueueManager';
export { CompressionSettings } from './components/CompressionSettings';
export { ResponsiveSizesPanel } from './components/ResponsiveSizesPanel';
export { LazyLoadingToggle } from './components/LazyLoadingToggle';
export { ExifStrippingToggle } from './components/ExifStrippingToggle';
export { ColorProfileConversion } from './components/ColorProfileConversion';
export { OrientationCorrection } from './components/OrientationCorrection';
export { CopyrightCreditEditor } from './components/CopyrightCreditEditor';
export { UsageTracking } from './components/UsageTracking';

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

    kernel.events.on('media:open-picker', async ({ data }: any) => {
      kernel.log.debug('Opening media picker', data);
      const store = useMediaStore.getState();
      const result = await store.openPicker(data?.options ?? {});
      if (result && data?.callback) {
        data.callback(result);
      }
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[MediaLibrary] Deactivating...');
  },
};

export default mediaLibraryModule;
