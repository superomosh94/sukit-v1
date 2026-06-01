import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

export { useFormBuilderStore } from './stores/formBuilderStore';
export type {
  FormField,
  ConditionalRule,
  FormStep,
  FormIntegration,
  EmailNotification,
} from './stores/formBuilderStore';
export { FormBuilderCanvas } from './components/FormBuilderCanvas';
export { FieldLibrary } from './components/FieldLibrary';
export { ConditionalLogic } from './components/ConditionalLogic';
export { MultiStepEditor } from './components/MultiStepEditor';
export { FormIntegrations } from './components/FormIntegrations';
export { EmailNotificationEditor } from './components/EmailNotificationEditor';

const formBuilderModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[FormBuilder] Activating...');

    kernel.blocks.register({
      type: 'form',
      name: 'Form',
      description: 'Drag-and-drop form builder',
      category: 'forms',
      icon: 'FileInput',
      component: () => <div>Form Block</div>,
      schema: { type: 'form', properties: {} },
      defaultProps: {},
      defaultStyles: {},
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[FormBuilder] Deactivating...');
    kernel.blocks.unregister('form');
  },
};

export default formBuilderModule;
