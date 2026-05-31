import { Socket } from 'socket.io-client';
import type { BuilderSocketEvent } from './protocol';
import { encrypt } from './encryption';

export class BuilderPortal {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private encryptionKey: string | null = null;
  private broadcastedVersions: Map<string, number> = new Map();
  private throttledBroadcasts: Map<string, number> = new Map();
  private onEvent: ((event: BuilderSocketEvent) => void) | null = null;
  private handleBroadcastBound: ((event: BuilderSocketEvent) => void) | null = null;

  open(socket: Socket, roomId: string, encryptionKey?: string) {
    this.socket = socket;
    this.roomId = roomId;
    this.encryptionKey = encryptionKey || null;
    this.setupListeners();
  }

  close() {
    if (!this.socket) return;
    if (this.handleBroadcastBound) {
      this.socket.off('broadcast', this.handleBroadcastBound);
    }
    this.socket.emit('leave-room', this.roomId);
    this.socket = null;
    this.roomId = null;
    this.encryptionKey = null;
    this.broadcastedVersions.clear();
    this.throttledBroadcasts.clear();
    this.onEvent = null;
    this.handleBroadcastBound = null;
  }

  private setupListeners() {
    this.handleBroadcastBound = this.handleBroadcast.bind(this);
    this.socket!.on('broadcast', this.handleBroadcastBound);
    this.socket!.emit('join-room', this.roomId);
  }

  private handleBroadcast(event: BuilderSocketEvent) {
    const dedupKey = `${event.type}:${event.userId}`;
    const eventVersion = 'payload' in event && 'version' in (event as any).payload ? (event as any).payload.version : 0;
    const lastVersion = this.broadcastedVersions.get(dedupKey) || 0;

    if (eventVersion > 0 && eventVersion <= lastVersion) return;
    if (eventVersion > 0) {
      this.broadcastedVersions.set(dedupKey, eventVersion);
    }

    this.onEvent?.(event);
  }

  setEventHandler(handler: (event: BuilderSocketEvent) => void) {
    this.onEvent = handler;
  }

  async broadcast(event: BuilderSocketEvent, volatile = false) {
    if (!this.socket || !this.roomId) return;

    if (event.type === 'CURSOR_MOVE' || event.type === 'IDLE_CHANGE') {
      const now = Date.now();
      const last = this.throttledBroadcasts.get(event.type) || 0;
      if (now - last < 33) return;
      this.throttledBroadcasts.set(event.type, now);
    }

    const dedupKey = `${event.type}:${event.userId}`;
    const eventVersion = 'version' in (event as any).payload ? (event as any).payload.version : 0;
    if (eventVersion > 0) {
      this.broadcastedVersions.set(dedupKey, eventVersion);
    }

    if (this.encryptionKey) {
      const { encrypted, iv } = await encrypt(this.encryptionKey, event);
      data = { type: 'SCENE_SYNC', roomId: this.roomId, payload: { sections: [], pageSettings: {}, sceneVersion: 0 }, userId: event.userId, timestamp: Date.now() };
      this.socket.emit(volatile ? 'server-volatile' : 'server', this.roomId, { encrypted, iv });
      return;
    }

    this.socket.emit(volatile ? 'server-volatile' : 'server', this.roomId, event);
  }

  requestFullSync() {
    this.socket?.emit('request-full-sync', this.roomId);
  }
}
