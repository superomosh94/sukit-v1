import { useCallback } from 'react';
import { useCookieConsentStore } from '../stores/cookieConsentStore';
import { cookieConsentApi } from '../services/api';
export function useCookieConsent() {
  const { config, isLoading, setConfig, setLoading } = useCookieConsentStore();
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      setConfig(await cookieConsentApi.getConfig());
    } finally {
      setLoading(false);
    }
  }, [setConfig, setLoading]);
  return { config, isLoading, fetchConfig };
}
