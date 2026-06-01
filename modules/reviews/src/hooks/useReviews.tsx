import { useCallback } from 'react';
import { useReviewsStore } from '../stores/reviewsStore';
import { reviewsApi } from '../services/api';
export function useReviews() {
  const { reviews, isLoading, setReviews, setLoading } = useReviewsStore();
  const fetchReviews = useCallback(
    async (params?: any) => {
      setLoading(true);
      try {
        const d = await reviewsApi.list(params);
        setReviews(d);
      } finally {
        setLoading(false);
      }
    },
    [setReviews, setLoading]
  );
  return { reviews, isLoading, fetchReviews };
}
