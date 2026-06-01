import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface CS {
  timers: any[];
  setTimers: (t: any[]) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const useCountdownStore = create<CS>()(
  persist(
    (set) => ({
      timers: [],
      isLoading: false,
      setTimers: (t) => set({ timers: t }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-countdown-store' }
  )
);
