import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface TS {
  languages: any[];
  keys: any[];
  setLanguages: (l: any[]) => void;
  setKeys: (k: any[]) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const useTranslationStore = create<TS>()(
  persist(
    (set) => ({
      languages: [],
      keys: [],
      isLoading: false,
      setLanguages: (l) => set({ languages: l }),
      setKeys: (k) => set({ keys: k }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-translation-store' }
  )
);
