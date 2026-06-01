import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface RedirectStore {
  redirects: any[];
  setRedirects: (r: any[]) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const useRedirectStore = create<RedirectStore>()(
  persist(
    (set) => ({
      redirects: [],
      isLoading: false,
      setRedirects: (r) => set({ redirects: r }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-redirect-store' }
  )
);
