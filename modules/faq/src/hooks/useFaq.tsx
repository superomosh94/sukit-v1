import { useCallback } from 'react';
import { useFaqStore } from '../stores/faqStore';
import { faqApi } from '../services/api';
export function useFaq() {
  const { categories, faqs, isLoading, setCategories, setFaqs, setLoading } =
    useFaqStore();
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await faqApi.listCategories());
    } finally {
      setLoading(false);
    }
  }, [setCategories, setLoading]);
  const fetchFaqs = useCallback(
    async (categoryId?: string) => {
      setLoading(true);
      try {
        setFaqs(await faqApi.listFaqs(categoryId));
      } finally {
        setLoading(false);
      }
    },
    [setFaqs, setLoading]
  );
  return { categories, faqs, isLoading, fetchCategories, fetchFaqs };
}
