import { useCallback } from 'react';
import { useWebhookStore } from '../stores/webhookStore';
import { webhookApi } from '../services/api';
export function useWebhooks() {
  const { webhooks, isLoading, setWebhooks, setLoading } = useWebhookStore();
  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      setWebhooks(await webhookApi.list());
    } finally {
      setLoading(false);
    }
  }, [setWebhooks, setLoading]);
  return { webhooks, isLoading, fetchWebhooks };
}
