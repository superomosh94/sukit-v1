import { useCallback } from 'react';
import { useTranslationStore } from '../stores/translationStore';
import { translationApi } from '../services/api';
export function useTranslation() {
  const { languages, keys, isLoading, setLanguages, setKeys, setLoading } =
    useTranslationStore();
  const fetchLanguages = useCallback(async () => {
    setLoading(true);
    try {
      setLanguages(await translationApi.listLanguages());
    } finally {
      setLoading(false);
    }
  }, [setLanguages, setLoading]);
  const fetchKeys = useCallback(
    async (params?: any) => {
      setLoading(true);
      try {
        setKeys(await translationApi.listKeys(params));
      } finally {
        setLoading(false);
      }
    },
    [setKeys, setLoading]
  );
  return { languages, keys, isLoading, fetchLanguages, fetchKeys };
}
