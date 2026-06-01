import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface CCStore {
  snippets: any[];
  setSnippets: (s: any[]) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const useCustomCodeStore = create<CCStore>()(
  persist(
    (set) => ({
      snippets: [],
      isLoading: false,
      setSnippets: (s) => set({ snippets: s }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-custom-code-store' }
  )
);
