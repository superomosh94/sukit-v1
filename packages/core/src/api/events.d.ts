import { EventBus } from '../internal/event-bus';
export declare function createEventsAPI(bus: EventBus): {
  on(
    event: string,
    handler: (payload: any) => void | Promise<void>
  ): () => void;
  once(event: string, handler: (payload: any) => void | Promise<void>): void;
  emit(event: string, payload?: any): Promise<void>;
  off(event: string, handler: (payload: any) => void | Promise<void>): void;
};
export type EventsAPI = ReturnType<typeof createEventsAPI>;
