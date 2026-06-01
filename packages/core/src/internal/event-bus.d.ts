type EventHandler = (payload: any) => void | Promise<void>;
export declare class EventBus {
  private handlers;
  private onceHandlers;
  on(event: string, handler: EventHandler): () => void;
  once(event: string, handler: EventHandler): void;
  emit(event: string, payload?: any): Promise<void>;
  off(event: string, handler: EventHandler): void;
  clear(): void;
  listenerCount(event: string): number;
}
export {};
