import { useCallback } from 'react';
import { useCountdownStore } from '../stores/countdownStore';
import { countdownApi } from '../services/api';
export function useCountdown() {
  const { timers, isLoading, setTimers, setLoading } = useCountdownStore();
  const fetchTimers = useCallback(async () => {
    setLoading(true);
    try {
      setTimers(await countdownApi.list());
    } finally {
      setLoading(false);
    }
  }, [setTimers, setLoading]);
  return { timers, isLoading, fetchTimers };
}
