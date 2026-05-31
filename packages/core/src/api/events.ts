import { EventBus } from "../internal/event-bus";

export function createEventsAPI(bus: EventBus) {
  return {
    on(event: string, handler: (payload: any) => void | Promise<void>): () => void {
      return bus.on(event, handler);
    },

    once(event: string, handler: (payload: any) => void | Promise<void>): void {
      bus.once(event, handler);
    },

    async emit(event: string, payload?: any): Promise<void> {
      await bus.emit(event, payload);
    },

    off(event: string, handler: (payload: any) => void | Promise<void>): void {
      bus.off(event, handler);
    },
  };
}

export type EventsAPI = ReturnType<typeof createEventsAPI>;
