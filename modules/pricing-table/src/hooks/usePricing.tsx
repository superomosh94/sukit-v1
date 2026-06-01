import { useCallback } from 'react';
import { usePricingStore } from '../stores/pricingStore';
import { pricingApi } from '../services/api';
export function usePricing() {
  const { plans, isLoading, setPlans, setLoading } = usePricingStore();
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(await pricingApi.list());
    } finally {
      setLoading(false);
    }
  }, [setPlans, setLoading]);
  return { plans, isLoading, fetchPlans };
}
