import { EventBus } from '../internal/event-bus';

export function createEventsAPI(bus: EventBus) {
  return {
    on(
      event: string,
      handler: (payload: any) => void | Promise<void>,
      options?: { priority?: number; filter?: (payload: any) => boolean }
    ): () => void {
      return bus.on(event, handler, options);
    },

    once(event: string, handler: (payload: any) => void | Promise<void>): void {
      bus.once(event, handler);
    },

    async emit(
      event: string,
      payload?: any,
      options?: { priority?: number; batch?: boolean; dedupKey?: string }
    ): Promise<void> {
      await bus.emit(event, payload, options);
    },

    off(event: string, handler: (payload: any) => void | Promise<void>): void {
      bus.off(event, handler);
    },

    use(mw: (event: string, payload: any) => Promise<[string, any]>): void {
      bus.use(mw);
    },

    namespace(prefix: string) {
      return bus.namespace(prefix);
    },

    registerSchema(event: string, validator: (payload: any) => boolean): void {
      bus.registerSchema(event, validator);
    },

    enableTracing(): void {
      bus.enableTracing();
    },
    disableTracing(): void {
      bus.disableTracing();
    },
    getTrace(event?: string) {
      return bus.getTrace(event);
    },
    getTraceById(traceId: string) {
      return bus.getTraceById(traceId);
    },

    getMetrics(event?: string) {
      return bus.getMetrics(event);
    },

    setPersistence(adapter: {
      save(event: string, payload: any): Promise<void>;
      replay(event?: string): Promise<Array<{ event: string; payload: any }>>;
    }): void {
      bus.setPersistence(adapter);
    },

    async replay(event?: string): Promise<void> {
      await bus.replay(event);
    },

    snapshot(label: string) {
      return bus.snapshot(label);
    },
    getSnapshots() {
      return bus.getSnapshots();
    },

    emitVersioned(
      event: string,
      version: number,
      payload?: any
    ): Promise<void> {
      return bus.emitVersioned(event, version, payload);
    },

    onVersioned(
      event: string,
      version: number,
      handler: (payload: any) => void | Promise<void>
    ): () => void {
      return bus.onVersioned(event, version, handler);
    },

    listenerCount(event: string): number {
      return bus.listenerCount(event);
    },

    clear(): void {
      bus.clear();
    },
  };
}

export type EventsAPI = ReturnType<typeof createEventsAPI>;
