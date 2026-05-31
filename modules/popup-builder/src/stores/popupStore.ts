import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PopupData } from '../services/api';

interface PopupStore {
  popups: PopupData[];
  currentPopup: PopupData | null;
  isLoading: boolean;
  editorContent: string;
  setPopups: (popups: PopupData[]) => void;
  setCurrentPopup: (popup: PopupData | null) => void;
  setLoading: (loading: boolean) => void;
  setEditorContent: (content: string) => void;
  addPopup: (popup: PopupData) => void;
  updatePopup: (id: string, data: Partial<PopupData>) => void;
  removePopup: (id: string) => void;
}

export const usePopupStore = create<PopupStore>()(
  persist(
    (set) => ({
      popups: [],
      currentPopup: null,
      isLoading: false,
      editorContent: '',
      setPopups: (popups) => set({ popups }),
      setCurrentPopup: (popup) => set({ currentPopup: popup }),
      setLoading: (loading) => set({ isLoading: loading }),
      setEditorContent: (content) => set({ editorContent: content }),
      addPopup: (popup) => set((state) => ({ popups: [...state.popups, popup] })),
      updatePopup: (id, data) =>
        set((state) => ({
          popups: state.popups.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      removePopup: (id) =>
        set((state) => ({
          popups: state.popups.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'sukit-popup-store',
      partialize: (state) => ({ popups: state.popups }),
    }
  )
);
