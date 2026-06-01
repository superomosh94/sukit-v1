import { useCallback } from 'react';
import { useRedirectStore } from '../stores/redirectStore';
import { redirectApi } from '../services/api';
export function useRedirects() {
  const { redirects, isLoading, setRedirects, setLoading } = useRedirectStore();
  const fetchRedirects = useCallback(async () => {
    setLoading(true);
    try {
      setRedirects(await redirectApi.list());
    } finally {
      setLoading(false);
    }
  }, [setRedirects, setLoading]);
  return { redirects, isLoading, fetchRedirects };
}
