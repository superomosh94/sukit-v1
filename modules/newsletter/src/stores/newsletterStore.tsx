import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface NewsletterStore {
  lists: any[];
  campaigns: any[];
  isLoading: boolean;
  setLists: (l: any[]) => void;
  setCampaigns: (c: any[]) => void;
  setLoading: (b: boolean) => void;
}
export const useNewsletterStore = create<NewsletterStore>()(
  persist(
    (set) => ({
      lists: [],
      campaigns: [],
      isLoading: false,
      setLists: (l) => set({ lists: l }),
      setCampaigns: (c) => set({ campaigns: c }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-newsletter-store' }
  )
);
