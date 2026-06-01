import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface PS {
  plans: any[];
  setPlans: (p: any[]) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const usePricingStore = create<PS>()(
  persist(
    (set) => ({
      plans: [],
      isLoading: false,
      setPlans: (p) => set({ plans: p }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-pricing-store' }
  )
);
