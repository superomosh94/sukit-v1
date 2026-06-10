import { useShallow } from 'zustand/react/shallow';
import { useBuilderStore } from '../stores/builderStore';
import type { Section, BuilderActions, DeviceViewport } from '../types';

export function useBuilderSections(): Section[] {
  return useBuilderStore((state) => state.sections);
}

export function useBuilderSelection(): {
  selection: { id: string; type: 'section' | 'column' | 'block' } | null;
  select: BuilderActions['select'];
  clearSelection: BuilderActions['clearSelection'];
} {
  return useBuilderStore(
    useShallow((state) => ({
      selection: state.selection,
      select: state.select,
      clearSelection: state.clearSelection,
    }))
  );
}

export function useBuilderViewport(): {
  viewport: DeviceViewport;
  setViewport: BuilderActions['setViewport'];
  zoom: number;
  setZoom: BuilderActions['setZoom'];
} {
  return useBuilderStore(
    useShallow((state) => ({
      viewport: state.viewport,
      setViewport: state.setViewport,
      zoom: state.zoom,
      setZoom: state.setZoom,
    }))
  );
}

export function useBuilderHistory(): {
  undo: BuilderActions['undo'];
  redo: BuilderActions['redo'];
  canUndo: boolean;
  canRedo: boolean;
} {
  return useBuilderStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
    }))
  );
}

export function useBuilderClipboard(): {
  copySelection: BuilderActions['copySelection'];
  pasteClipboard: BuilderActions['pasteClipboard'];
  hasClipboard: boolean;
} {
  return useBuilderStore(
    useShallow((state) => ({
      copySelection: state.copySelection,
      pasteClipboard: state.pasteClipboard,
      hasClipboard: state.clipboard !== null,
    }))
  );
}

export function useBuilderActions(): BuilderActions {
  return useBuilderStore(
    useShallow((state) => ({
      addSection: state.addSection,
      deleteSection: state.deleteSection,
      duplicateSection: state.duplicateSection,
      reorderSections: state.reorderSections,
      addBlock: state.addBlock,
      updateBlock: state.updateBlock,
      deleteBlock: state.deleteBlock,
      duplicateBlock: state.duplicateBlock,
      moveBlock: state.moveBlock,
      select: state.select,
      clearSelection: state.clearSelection,
      toggleSelection: state.toggleSelection,
      nudgeBlock: state.nudgeBlock,
      undo: state.undo,
      redo: state.redo,
      setViewport: state.setViewport,
      setZoom: state.setZoom,
      copySelection: state.copySelection,
      pasteClipboard: state.pasteClipboard,
      setSections: state.setSections,
      setPageSettings: state.setPageSettings,
      setShowGrid: state.setShowGrid,
      setGridSize: state.setGridSize,
      setSnapToGrid: state.setSnapToGrid,
      setSnapDistance: state.setSnapDistance,
      setFullscreen: state.setFullscreen,
      toggleFullscreen: state.toggleFullscreen,
      setPanOffset: state.setPanOffset,
      setIsPanning: state.setIsPanning,
      setShowOutlines: state.setShowOutlines,
      setIsResizing: state.setIsResizing,
      loadBlocks: state.loadBlocks,
      exportBlocks: state.exportBlocks,
      clear: state.clear,
      setCustomBreakpoints: state.setCustomBreakpoints,
      setColumnSpan: state.setColumnSpan,
      setSectionVisibility: state.setSectionVisibility,
      saveCurrentAsTemplate: state.saveCurrentAsTemplate,
      loadTemplate: state.loadTemplate,
      deleteTemplate: state.deleteTemplate,
      getTemplates: state.getTemplates,
    }))
  ) as BuilderActions;
}
