import { useCallback } from 'react';
import { useCustomCodeStore } from '../stores/customCodeStore';
import { customCodeApi } from '../services/api';
export function useCustomCode() {
  const { snippets, isLoading, setSnippets, setLoading } = useCustomCodeStore();
  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    try {
      setSnippets(await customCodeApi.list());
    } finally {
      setLoading(false);
    }
  }, [setSnippets, setLoading]);
  return { snippets, isLoading, fetchSnippets };
}
