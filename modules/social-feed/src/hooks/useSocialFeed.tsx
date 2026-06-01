import { useCallback } from 'react';
import { useSocialFeedStore } from '../stores/socialFeedStore';
import { socialFeedApi } from '../services/api';
export function useSocialFeed() {
  const { posts, isLoading, setPosts, setLoading } = useSocialFeedStore();
  const fetchPosts = useCallback(
    async (platform?: string) => {
      setLoading(true);
      try {
        setPosts(await socialFeedApi.list(platform));
      } finally {
        setLoading(false);
      }
    },
    [setPosts, setLoading]
  );
  return { posts, isLoading, fetchPosts };
}
