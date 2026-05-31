import type { SukitModule } from '@sukit/modules-core';

const popupBuilderModule: SukitModule = {
  id: '@sukit/module-popup-builder',
  name: 'Popup Builder',
  version: '1.0.0',
  description: 'Create popups, modals, slide-ins, and floating bars with triggers, animations, and analytics',
  enabled: true,
  settings: {
    defaultAnimation: {
      type: 'select',
      label: 'Default Animation',
      default: 'fade',
      options: [
        { label: 'Fade', value: 'fade' },
        { label: 'Slide Up', value: 'slide-up' },
        { label: 'Slide Down', value: 'slide-down' },
        { label: 'Zoom', value: 'zoom' },
        { label: 'Bounce', value: 'bounce' },
      ],
    },
    enableAnalytics: {
      type: 'boolean',
      label: 'Enable Analytics',
      default: true,
    },
  },
};

export default popupBuilderModule;

export { PopupDashboard } from './pages/PopupDashboard';
export { PopupEditor } from './pages/PopupEditor';
export { PopupRenderer } from './components/PopupRenderer';
export { PopupAnalytics } from './components/PopupAnalytics';
export { usePopups, usePopupTriggers } from './hooks/usePopup';
export { usePopupStore } from './stores/popupStore';
