import { useCallback } from 'react';
import { useNewsletterStore } from '../stores/newsletterStore';
import { newsletterApi } from '../services/api';
export function useNewsletter() {
  const { lists, campaigns, isLoading, setLists, setCampaigns, setLoading } =
    useNewsletterStore();
  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const d = await newsletterApi.listLists();
      setLists(d);
    } finally {
      setLoading(false);
    }
  }, [setLists, setLoading]);
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const d = await newsletterApi.listCampaigns();
      setCampaigns(d);
    } finally {
      setLoading(false);
    }
  }, [setCampaigns, setLoading]);
  return { lists, campaigns, isLoading, fetchLists, fetchCampaigns };
}
