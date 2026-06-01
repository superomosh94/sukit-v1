export class EventBus {
    handlers = new Map();
    onceHandlers = new Map();
    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event).add(handler);
        return () => this.off(event, handler);
    }
    once(event, handler) {
        if (!this.onceHandlers.has(event)) {
            this.onceHandlers.set(event, new Set());
        }
        this.onceHandlers.get(event).add(handler);
    }
    async emit(event, payload) {
        const handlers = this.handlers.get(event);
        if (handlers) {
            for (const handler of handlers) {
                try {
                    await handler(payload);
                }
                catch (error) {
                    console.error(`[EventBus] Error in handler for "${event}":`, error);
                }
            }
        }
        const onceHandlers = this.onceHandlers.get(event);
        if (onceHandlers) {
            for (const handler of onceHandlers) {
                try {
                    await handler(payload);
                }
                catch (error) {
                    console.error(`[EventBus] Error in once-handler for "${event}":`, error);
                }
            }
            this.onceHandlers.delete(event);
        }
    }
    off(event, handler) {
        this.handlers.get(event)?.delete(handler);
    }
    clear() {
        this.handlers.clear();
        this.onceHandlers.clear();
    }
    listenerCount(event) {
        return (this.handlers.get(event)?.size ?? 0) + (this.onceHandlers.get(event)?.size ?? 0);
    }
}
