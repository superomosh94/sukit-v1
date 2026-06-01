import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EventData } from '../services/api';

interface EventsStore {
  events: EventData[];
  currentEvent: EventData | null;
  isLoading: boolean;
  setEvents: (events: EventData[]) => void;
  setCurrentEvent: (event: EventData | null) => void;
  setLoading: (loading: boolean) => void;
  addEvent: (event: EventData) => void;
  removeEvent: (id: string) => void;
}

export const useEventsStore = create<EventsStore>()(
  persist(
    (set) => ({
      events: [],
      currentEvent: null,
      isLoading: false,
      setEvents: (events) => set({ events }),
      setCurrentEvent: (event) => set({ currentEvent: event }),
      setLoading: (loading) => set({ isLoading: loading }),
      addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'sukit-events-store', partialize: (s) => ({ events: s.events }) }
  )
);
