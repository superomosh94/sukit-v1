import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface CCS {
  config: any;
  setConfig: (c: any) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const useCookieConsentStore = create<CCS>()(
  persist(
    (set) => ({
      config: {
        layout: 'bar',
        position: 'bottom',
        theme: 'light',
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      },
      isLoading: false,
      setConfig: (c) => set({ config: c }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-cookie-consent-store' }
  )
);
