import { useCallback } from 'react';
import { useEventsStore } from '../stores/eventsStore';
import { eventsApi, EventData } from '../services/api';

export function useEvents() {
  const { events, isLoading, setEvents, setLoading } = useEventsStore();

  const fetchEvents = useCallback(
    async (params?: { status?: string; category?: string }) => {
      setLoading(true);
      try {
        const data = await eventsApi.list(params);
        setEvents(data);
      } finally {
        setLoading(false);
      }
    },
    [setEvents, setLoading]
  );

  const createEvent = useCallback(async (data: EventData) => {
    const ev = await eventsApi.create(data);
    useEventsStore.getState().addEvent(ev);
    return ev;
  }, []);

  return { events, isLoading, fetchEvents, createEvent };
}
