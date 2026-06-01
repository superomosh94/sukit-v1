import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface ReviewsStore {
  reviews: any[];
  isLoading: boolean;
  setReviews: (r: any[]) => void;
  setLoading: (b: boolean) => void;
  addReview: (r: any) => void;
}
export const useReviewsStore = create<ReviewsStore>()(
  persist(
    (set) => ({
      reviews: [],
      isLoading: false,
      setReviews: (r) => set({ reviews: r }),
      setLoading: (b) => set({ isLoading: b }),
      addReview: (r) => set((s) => ({ reviews: [r, ...s.reviews] })),
    }),
    { name: 'sukit-reviews-store' }
  )
);
