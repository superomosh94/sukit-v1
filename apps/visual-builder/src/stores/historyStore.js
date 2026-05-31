import { create } from 'zustand';

export const useHistoryStore = create((set, get) => ({
  history: [],
  currentIndex: -1,
  push: (state) => set((s) => ({
    history: [...s.history.slice(0, s.currentIndex + 1), state],
    currentIndex: s.currentIndex + 1,
  })),
  undo: () => {
    if (get().currentIndex > 0) {
      set((s) => ({ currentIndex: s.currentIndex - 1 }));
    }
    return get().history[get().currentIndex];
  },
  redo: () => {
    if (get().currentIndex < get().history.length - 1) {
      set((s) => ({ currentIndex: s.currentIndex + 1 }));
    }
    return get().history[get().currentIndex];
  },
  canUndo: () => get().currentIndex > 0,
  canRedo: () => get().currentIndex < get().history.length - 1,
}));
