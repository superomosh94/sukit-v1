import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface FaqStore {
  categories: any[];
  faqs: any[];
  setCategories: (c: any[]) => void;
  setFaqs: (f: any[]) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const useFaqStore = create<FaqStore>()(
  persist(
    (set) => ({
      categories: [],
      faqs: [],
      isLoading: false,
      setCategories: (c) => set({ categories: c }),
      setFaqs: (f) => set({ faqs: f }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-faq-store' }
  )
);
