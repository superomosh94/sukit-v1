'use client';

import { create } from 'zustand';

export interface BuilderState {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  undoStack: string[];
  redoStack: string[];
  zoom: number;
  showGuides: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  pushUndo: (snapshot: string) => void;
  pushRedo: (snapshot: string) => void;
  popUndo: () => string | undefined;
  popRedo: () => string | undefined;
  clearUndo: () => void;
  clearRedo: () => void;
  setZoom: (zoom: number) => void;
  setShowGuides: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
}

export const useBuilderStore = create<BuilderState>()((set, get) => ({
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  undoStack: [],
  redoStack: [],
  zoom: 100,
  showGuides: true,
  showGrid: false,
  snapToGrid: true,
  gridSize: 8,

  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSaved: date }),
  pushUndo: (snapshot) =>
    set((state) => ({
      undoStack: [...state.undoStack.slice(-49), snapshot],
      redoStack: [],
    })),
  pushRedo: (snapshot) =>
    set((state) => ({ redoStack: [...state.redoStack, snapshot] })),
  popUndo: () => {
    const state = get();
    if (state.undoStack.length === 0) return undefined;
    const snapshot = state.undoStack[state.undoStack.length - 1];
    set({ undoStack: state.undoStack.slice(0, -1) });
    return snapshot;
  },
  popRedo: () => {
    const state = get();
    if (state.redoStack.length === 0) return undefined;
    const snapshot = state.redoStack[state.redoStack.length - 1];
    set({ redoStack: state.redoStack.slice(0, -1) });
    return snapshot;
  },
  clearUndo: () => set({ undoStack: [] }),
  clearRedo: () => set({ redoStack: [] }),
  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
  setShowGuides: (show) => set({ showGuides: show }),
  setShowGrid: (show) => set({ showGrid: show }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  setGridSize: (size) => set({ gridSize: size }),
}));
