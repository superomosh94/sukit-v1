import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface SFS {
  posts: any[];
  setPosts: (p: any[]) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const useSocialFeedStore = create<SFS>()(
  persist(
    (set) => ({
      posts: [],
      isLoading: false,
      setPosts: (p) => set({ posts: p }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-social-feed-store' }
  )
);
