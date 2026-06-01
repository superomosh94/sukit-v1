'use client';

// Re-export core builder types
export type {
  Block,
  Column,
  Section,
  Page,
  PageSettings,
  Site,
  SiteSettings,
  User,
  Media,
  Form,
  Module,
  BlockPropSchema,
  BlockSchema,
  BlockRegistration,
  Animation,
  HoverEffectConfig,
  ResponsiveOverrides,
  DeviceViewport,
  BuilderState,
  BuilderActions,
  BuilderSnapshot,
  BuilderStore,
} from './types';

// Re-export store
// Re-export block registry
export { blockRegistry } from './block-registry';

// Re-export block registration
export { registerAllBlocks } from './registrations';

// Re-export core utilities
export {
  stateToDocument,
  documentToState,
  migrateDocument,
  compressForExport,
  decompressImport,
} from './serializer';
export type { SceneDocument } from './serializer';
export { exportToHtml, exportJson } from './exporter';
export {
  animationSchema,
  blockSchema,
  columnSchema,
  sectionSchema,
  pageSchema,
  validateBlock,
} from './validators';

// Re-export constants
export {
  BREAKPOINTS,
  DEVICE_WIDTHS,
  DEFAULT_GRID_COLUMNS,
  DEFAULT_GRID_GAP,
  DEFAULT_MAX_WIDTH,
  DEFAULT_CONTAINER_PADDING,
  MAX_HISTORY,
} from './constants';

// Re-export default factories
export {
  createDefaultSection,
  createDefaultColumn,
  createDefaultBlock,
} from './defaults';

// Re-export canvas components
export { Canvas as BuilderCanvas } from './canvas/Canvas';
export { CanvasHeader as BuilderToolbar } from './canvas/CanvasHeader';
export { LayerPanel } from './canvas/LayerPanel';
export { SectionTypePicker } from './canvas/SectionTypePicker';
export { ZoomControls } from './canvas/ZoomControls';
export { DeviceFrame } from './canvas/DeviceFrame';
export { KeyboardShortcutsPanel } from './canvas/KeyboardShortcutsPanel';
export { SectionRenderer, PageRenderer } from './canvas/renderer';

// Re-export property panel
export { PropertyPanel } from './property-panel/PropertyPanel';

// Re-export block palette and components
export { BlockPalette, focusBlockSearch } from './components/BlockPalette';
export { SaveIndicator } from './components/SaveIndicator';
export { ConfirmDialog } from './components/ConfirmDialog';
export { HeadingValidator } from './components/HeadingValidator';
export { LinkValidator } from './components/LinkValidator';
export { FormValidator } from './components/FormValidator';
export { PageSettingsEditor } from './components/PageSettingsEditor';
export { ToastContainer, showToast } from './components/Toast';
export { ContextMenu } from './components/ContextMenu';
export type { ContextMenuItem } from './components/ContextMenu';
export { VersionHistoryPanel } from './components/VersionHistoryPanel';
export { Ruler } from './canvas/Ruler';

// Re-export new builder components
export { BlockSearch } from './components/BlockSearch';
export { BlockPreview } from './components/BlockPreview';
export { BlockVariations } from './components/BlockVariations';
export { HistorySlider } from './components/HistorySlider';

// Re-export hooks
export {
  default as BuilderProvider,
  useBuilderContext,
} from './hooks/BuilderProvider';
export {
  useBuilderSections,
  useBuilderSelection,
  useBuilderViewport,
  useBuilderHistory,
  useBuilderClipboard,
  useBuilderActions,
} from './hooks/useBuilder';
export { useBuilderStore } from './stores/builderStore';

// Re-export integration hooks
export { useCodeEditorIntegration } from './hooks/useCodeEditorIntegration';
export { useCommerceIntegration } from './hooks/useCommerceIntegration';
export { useAiChatIntegration } from './hooks/useAiChatIntegration';
export { usePopupBuilderIntegration } from './hooks/usePopupBuilderIntegration';
export { useBackupIntegration } from './hooks/useBackupIntegration';
export { useRedirectManagerIntegration } from './hooks/useRedirectManagerIntegration';

// Module lifecycle for kernel compatibility
import type { Module, KernelForModule } from '@sukit/core';
import { registerAllBlocks } from './registrations';
import manifest from '../manifest.json';

const visualBuilderModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[VisualBuilder] Activating...');
    registerAllBlocks();
    kernel.events.on('page:beforeSave', async ({ pageId }) => {
      kernel.log.debug(`Page ${pageId} about to save`);
    });
    kernel.events.on('page:afterSave', async ({ pageId }) => {
      kernel.log.debug(`Page ${pageId} saved`);
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[VisualBuilder] Deactivating...');
    const blockTypes = [
      'container',
      'section',
      'row',
      'column',
      'grid',
      'stack',
      'heading',
      'paragraph',
      'text',
      'link',
      'list',
      'quote',
      'code',
      'accordion',
      'tabs',
      'carousel',
      'card',
      'table',
      'testimonial',
      'pricing',
      'faq',
      'menu',
      'breadcrumb',
      'back-to-top',
      'image',
      'gallery',
      'video',
      'icon',
      'avatar',
      'map',
      'divider',
      'spacer',
      'form',
      'button',
    ];
    blockTypes.forEach((type) => kernel.blocks.unregister(type));
  },
};

export default visualBuilderModule;
