import { createKernel, type SukitKernel } from '@sukit/core';
import { prismaAuthAdapter } from './adapters/auth-adapter';
import { prismaSitesAdapter } from './adapters/sites-adapter';
import { prismaPagesAdapter } from './adapters/pages-adapter';
import { prismaMediaAdapter } from './adapters/media-adapter';
import { prismaStorageAdapter } from './adapters/storage-adapter';
import { prismaSettingsAdapter } from './adapters/settings-adapter';
import { prismaTasksAdapter } from './adapters/tasks-adapter';
import { prismaExportAdapter } from './adapters/export-adapter';
import { createMemoryCacheAdapter } from './adapters/cache-adapter';

let kernelInstance: SukitKernel | null = null;

export function createSukitKernel(): SukitKernel {
  if (kernelInstance) return kernelInstance;

  const kernel = createKernel({
    auth: prismaAuthAdapter,
    sites: prismaSitesAdapter,
    pages: prismaPagesAdapter,
    media: prismaMediaAdapter,
    storage: prismaStorageAdapter,
    settings: prismaSettingsAdapter,
    tasks: prismaTasksAdapter,
    cache: createMemoryCacheAdapter(),
    export: prismaExportAdapter,
  });

  kernelInstance = kernel;

  if (typeof window !== 'undefined') {
    (window as any).__SUKIT__ = kernel;
  }

  return kernel;
}

export function getSukitKernel(): SukitKernel {
  if (!kernelInstance)
    throw new Error('Kernel not initialized. Call createSukitKernel() first.');
  return kernelInstance;
}
