import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

export { useChatStore } from './stores/chatStore';
export { TrainingConfig } from './components/TrainingConfig';
export { LeadCapture } from './components/LeadCapture';
export { ChatAnalytics } from './components/ChatAnalytics';
export { ConversationList } from './components/ConversationList';

const chatModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[Chat] Activating...');
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[Chat] Deactivating...');
  },
};

export default chatModule;

export { ChatWidget } from './widget';
export { ChatSettings } from './settings';
export { handleMessage, handleUpload } from './api';
