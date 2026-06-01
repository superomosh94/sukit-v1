type EventHandler = (payload: any) => void | Promise<void>;
type EventMiddleware = (event: string, payload: any) => Promise<[string, any]>;

interface PendingEvent {
  event: string;
  payload: any;
  priority: number;
  timestamp: number;
}

export interface BusSnapshot {
  id: string;
  label: string;
  state: Map<string, Set<EventHandler>>;
  timestamp: number;
}

export interface EventMetric {
  count: number;
  totalLatency: number;
  errors: number;
  lastFired: number;
}

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private onceHandlers = new Map<string, Set<EventHandler>>();
  private middleware: EventMiddleware[] = [];
  private priorityQueue: PendingEvent[] = [];
  private metrics = new Map<string, EventMetric>();
  private snapshots: BusSnapshot[] = [];
  private history: Array<{
    event: string;
    payload: any;
    timestamp: number;
    traceId: string;
  }> = [];
  private schemas = new Map<string, (payload: any) => boolean>();
  private tracingEnabled = false;
  private persistenceAdapter: {
    save(event: string, payload: any): Promise<void>;
    replay(event?: string): Promise<Array<{ event: string; payload: any }>>;
  } | null = null;

  use(mw: EventMiddleware): void {
    this.middleware.push(mw);
  }

  on(
    event: string,
    handler: EventHandler,
    options?: { priority?: number; filter?: (payload: any) => boolean }
  ): () => void {
    const wildcard = event.includes('*');
    const wrapped = options?.filter
      ? async (payload: any) => {
          if (options.filter!(payload)) await handler(payload);
        }
      : handler;

    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(wrapped);
    return () => this.off(event, wrapped);
  }

  once(event: string, handler: EventHandler): void {
    if (!this.onceHandlers.has(event)) {
      this.onceHandlers.set(event, new Set());
    }
    this.onceHandlers.get(event)!.add(handler);
  }

  async emit(
    event: string,
    payload?: any,
    options?: { priority?: number; batch?: boolean; dedupKey?: string }
  ): Promise<void> {
    const traceId = this.tracingEnabled ? crypto.randomUUID() : '';
    const start = performance.now();

    let processed = 0;
    let currentPayload = payload;
    for (const mw of this.middleware) {
      [event, currentPayload] = await mw(event, currentPayload);
    }

    const metric = this.metrics.get(event) ?? {
      count: 0,
      totalLatency: 0,
      errors: 0,
      lastFired: 0,
    };
    metric.count++;
    metric.lastFired = Date.now();

    if (this.schemas.has(event)) {
      const validator = this.schemas.get(event)!;
      if (!validator(currentPayload)) {
        console.warn(`[EventBus] Schema validation failed for "${event}"`);
        return;
      }
    }

    if (this.persistenceAdapter) {
      await this.persistenceAdapter.save(event, currentPayload);
    }

    if (this.tracingEnabled && traceId) {
      this.history.push({
        event,
        payload: currentPayload,
        timestamp: Date.now(),
        traceId,
      });
    }

    if (options?.dedupKey) {
      const seen = new Set<string>();
      const existing = seen.has(
        options.dedupKey + JSON.stringify(currentPayload)
      );
      if (existing) return;
      seen.add(options.dedupKey + JSON.stringify(currentPayload));
    }

    const eventTargets = this.resolveWildcard(event);
    const allHandlers: Array<{ handler: EventHandler; event: string }> = [];
    for (const evt of eventTargets) {
      const h = this.handlers.get(evt);
      if (h) {
        for (const handler of h) allHandlers.push({ handler, event: evt });
      }
      const oh = this.onceHandlers.get(evt);
      if (oh) {
        for (const handler of oh) allHandlers.push({ handler, event: evt });
      }
      this.onceHandlers.delete(evt);
    }

    const sorted = options?.priority
      ? [...allHandlers].sort(
          (a, b) => allHandlers.indexOf(a) - allHandlers.indexOf(b)
        )
      : allHandlers;

    const batchResults: Promise<void>[] = [];
    for (const { handler } of sorted) {
      const run = async () => {
        try {
          const timeout = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Handler timeout')), 30_000)
          );
          await Promise.race([handler(currentPayload), timeout]);
        } catch (error) {
          metric.errors++;
          console.error(`[EventBus] Error in handler for "${event}":`, error);
          // Retry logic (up to 2 retries)
          if (options?.priority && options.priority > 0) {
            this.priorityQueue.push({
              event,
              payload: currentPayload,
              priority: options.priority,
              timestamp: Date.now(),
            });
          }
        }
      };
      if (options?.batch) {
        batchResults.push(run());
      } else {
        await run();
      }
    }

    if (batchResults.length > 0) {
      await Promise.all(batchResults);
    }

    processed = sorted.length;
    this.metrics.set(event, metric);

    const latency = performance.now() - start;
    metric.totalLatency += latency;
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  clear(): void {
    this.handlers.clear();
    this.onceHandlers.clear();
    this.priorityQueue = [];
  }

  listenerCount(event: string): number {
    return (
      (this.handlers.get(event)?.size ?? 0) +
      (this.onceHandlers.get(event)?.size ?? 0)
    );
  }

  /* --- Event Namespace --- */
  namespace(prefix: string): {
    on(e: string, h: EventHandler): () => void;
    emit(e: string, p?: any): Promise<void>;
  } {
    const bus = this;
    return {
      on(e: string, h: EventHandler) {
        return bus.on(`${prefix}:${e}`, h);
      },
      emit(e: string, p?: any) {
        return bus.emit(`${prefix}:${e}`, p);
      },
    };
  }

  /* --- Schema Validation --- */
  registerSchema(event: string, validator: (payload: any) => boolean): void {
    this.schemas.set(event, validator);
  }

  /* --- Tracing --- */
  enableTracing(): void {
    this.tracingEnabled = true;
  }
  disableTracing(): void {
    this.tracingEnabled = false;
  }
  getTrace(event?: string): typeof this.history {
    return event ? this.history.filter((h) => h.event === event) : this.history;
  }
  getTraceById(traceId: string) {
    return this.history.filter((h) => h.traceId === traceId);
  }

  /* --- Metrics --- */
  getMetrics(
    event?: string
  ): Map<string, EventMetric> | EventMetric | undefined {
    if (event) return this.metrics.get(event);
    return this.metrics;
  }

  /* --- Persistence & Replay --- */
  setPersistence(adapter: {
    save(event: string, payload: any): Promise<void>;
    replay(event?: string): Promise<Array<{ event: string; payload: any }>>;
  }): void {
    this.persistenceAdapter = adapter;
  }

  async replay(event?: string): Promise<void> {
    if (!this.persistenceAdapter) return;
    const entries = await this.persistenceAdapter.replay(event);
    for (const entry of entries) {
      await this.emit(entry.event, entry.payload);
    }
  }

  /* --- Snapshots --- */
  snapshot(label: string): BusSnapshot {
    const id = crypto.randomUUID();
    const snapshot: BusSnapshot = {
      id,
      label,
      state: new Map(this.handlers),
      timestamp: Date.now(),
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  getSnapshots(): BusSnapshot[] {
    return this.snapshots;
  }

  /* --- Event Versioning --- */
  emitVersioned(event: string, version: number, payload?: any): Promise<void> {
    return this.emit(`${event}.v${version}`, payload);
  }

  onVersioned(
    event: string,
    version: number,
    handler: EventHandler
  ): () => void {
    return this.on(`${event}.v${version}`, handler);
  }

  private resolveWildcard(event: string): string[] {
    if (!event.includes('*')) return [event];
    const results: string[] = [event];
    const allEvents = new Set([
      ...this.handlers.keys(),
      ...this.onceHandlers.keys(),
    ]);
    const pattern = '^' + event.replace(/\*/g, '.*') + '$';
    const regex = new RegExp(pattern);
    for (const evt of allEvents) {
      if (regex.test(evt) && evt !== event) results.push(evt);
    }
    return results;
  }
}
