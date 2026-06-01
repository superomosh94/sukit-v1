import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

const codeEditorModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[CodeEditor] Activating...');

    kernel.ui.registerSlot('sidebar:left', () => <div>File Tree</div>, {
      position: 30,
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[CodeEditor] Deactivating...');
  },
};

export default codeEditorModule;
