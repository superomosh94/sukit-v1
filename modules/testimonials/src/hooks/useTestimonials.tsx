import { useCallback } from 'react';
import { useTestimonialStore } from '../stores/testimonialStore';
import { testimonialApi } from '../services/api';
export function useTestimonials() {
  const { testimonials, isLoading, setTestimonials, setLoading } =
    useTestimonialStore();
  const fetchTestimonials = useCallback(
    async (featured?: boolean) => {
      setLoading(true);
      try {
        setTestimonials(await testimonialApi.list(featured));
      } finally {
        setLoading(false);
      }
    },
    [setTestimonials, setLoading]
  );
  return { testimonials, isLoading, fetchTestimonials };
}
