import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface TS {
  testimonials: any[];
  setTestimonials: (t: any[]) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const useTestimonialStore = create<TS>()(
  persist(
    (set) => ({
      testimonials: [],
      isLoading: false,
      setTestimonials: (t) => set({ testimonials: t }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-testimonial-store' }
  )
);
