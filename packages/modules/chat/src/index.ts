import { SukitModule } from '@sukit/modules-core';
import { ChatWidget } from './widget';
import { ChatSettings } from './settings';

const chatModule: SukitModule = {
  id: '@sukit/module-chat',
  name: 'AI Chat Assistant',
  version: '1.0.0',
  description: 'AI-powered chat widget for your SUKIT websites',
  enabled: true,
  widget: {
    component: ChatWidget,
    position: 'bottom-right',
    settings: {
      welcomeMessage: 'Hello! How can I help you today?',
      theme: 'light',
    },
  },
  apiRoutes: [
    { method: 'POST', path: '/api/chat/message', handler: 'handleMessage' },
    { method: 'POST', path: '/api/chat/upload', handler: 'handleUpload' },
  ],
  settings: {
    apiKey: { type: 'encrypted', label: 'OpenAI API Key', required: true },
    model: {
      type: 'select',
      label: 'AI Model',
      default: 'gpt-4-turbo',
      options: [
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
      ],
    },
    welcomeMessage: { type: 'text', label: 'Welcome Message', default: 'Hello! How can I help you today?' },
    theme: {
      type: 'select',
      label: 'Widget Theme',
      default: 'light',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  },
};

export default chatModule;
