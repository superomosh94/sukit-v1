import type { SukitKernel } from '@sukit/core';
import type { WebSocketMessage, PresenceInfo } from '../../types';
import { promisify } from 'util';
import { deflate, inflate } from 'zlib';

const pDeflate = promisify(deflate);
const pInflate = promisify(inflate);

type MessageHandler = (
  message: WebSocketMessage,
  userId: string
) => Promise<void> | void;

interface RoomState {
  users: Map<
    string,
    {
      userId: string;
      joinedAt: string;
      socketId: string;
      cursor?: any;
      selectedBlock?: string;
      lastActive: number;
    }
  >;
  locks: Map<
    string,
    { userId: string; blockId: string; acquiredAt: string; expiresAt: string }
  >;
  pendingChanges: any[];
}

interface LockInfo {
  userId: string;
  blockId: string;
  acquiredAt: string;
}

interface RateLimitConfig {
  maxPerMinute: number;
  userBuckets: Map<string, number[]>;
}

export class WebSocketServer {
  private kernel: SukitKernel;
  private rooms: Map<string, RoomState> = new Map();
  private handlers: Map<string, MessageHandler> = new Map();
  private userSockets: Map<string, Set<string>> = new Map();

  private rateLimits: Map<string, RateLimitConfig> = new Map();

  private presenceTimeoutSeconds: number = 0;
  private presenceTimer: ReturnType<typeof setInterval> | null = null;

  private roomHistory: Map<
    string,
    { userId: string; changes: any; timestamp: string }[]
  > = new Map();

  private persistenceKernel: SukitKernel | null = null;

  private compressionEnabled: boolean = false;

  private metrics = {
    totalConnections: 0,
    disconnectionCount: 0,
    messageTimestamps: [] as number[],
    latencyTotal: 0,
    latencyCount: 0,
  };

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers(): void {
    this.on('page:join', async (msg, userId) => {
      const pageId = msg.payload.pageId;
      if (!this.rooms.has(pageId))
        this.rooms.set(pageId, {
          users: new Map(),
          locks: new Map(),
          pendingChanges: [],
        });
      const room = this.rooms.get(pageId)!;
      room.users.set(userId, {
        userId,
        joinedAt: new Date().toISOString(),
        socketId: msg.payload.socketId || '',
        lastActive: Date.now(),
      });
      this.trackUserSocket(userId, msg.payload.socketId || '');
      this.metrics.totalConnections++;
      this.broadcast(
        pageId,
        {
          type: 'presence:joined',
          payload: { userId },
          userId,
          room: pageId,
          timestamp: new Date().toISOString(),
        },
        [userId]
      );
      this.sendToUser(userId, {
        type: 'presence:list',
        payload: { users: this.getUsersInRoom(pageId) },
        timestamp: new Date().toISOString(),
      });
    });

    this.on('page:leave', async (msg, userId) => {
      const pageId = msg.payload.pageId;
      this.removeFromRoom(pageId, userId);
      this.metrics.disconnectionCount++;
      this.broadcast(
        pageId,
        {
          type: 'presence:left',
          payload: { userId },
          timestamp: new Date().toISOString(),
        },
        [userId]
      );
    });

    this.on('cursor:move', async (msg, userId) => {
      const pageId = msg.payload.pageId;
      const room = this.rooms.get(pageId);
      if (room) {
        const user = room.users.get(userId);
        if (user) {
          user.cursor = msg.payload.position;
          user.lastActive = Date.now();
        }
      }
      this.broadcast(
        pageId,
        {
          type: 'cursor:moved',
          payload: { userId, position: msg.payload.position },
          timestamp: new Date().toISOString(),
        },
        [userId]
      );
    });

    this.on('block:select', async (msg, userId) => {
      const pageId = msg.payload.pageId;
      const blockId = msg.payload.blockId;
      const room = this.rooms.get(pageId);
      if (room) {
        const user = room.users.get(userId);
        if (user) user.selectedBlock = blockId;
      }
      this.broadcast(
        pageId,
        {
          type: 'block:selected',
          payload: { userId, blockId },
          timestamp: new Date().toISOString(),
        },
        [userId]
      );
    });

    this.on('content:change', async (msg, userId) => {
      const pageId = msg.payload.pageId;
      const room = this.rooms.get(pageId);
      if (room)
        room.pendingChanges.push({
          userId,
          changes: msg.payload.changes,
          timestamp: msg.timestamp,
        });

      const historyEntry = {
        userId,
        changes: msg.payload.changes,
        timestamp: msg.timestamp || new Date().toISOString(),
      };
      if (!this.roomHistory.has(pageId)) this.roomHistory.set(pageId, []);
      this.roomHistory.get(pageId)!.push(historyEntry);

      if (this.persistenceKernel) {
        const key = `ws:history:${pageId}:${historyEntry.timestamp}`;
        this.persistenceKernel.storage?.set?.(
          key,
          JSON.stringify(historyEntry)
        );
      }

      this.broadcast(
        pageId,
        {
          type: 'content:updated',
          payload: {
            userId,
            changes: msg.payload.changes,
            version: room?.pendingChanges.length,
          },
          timestamp: new Date().toISOString(),
        },
        [userId]
      );
    });

    this.on('lock:acquire', async (msg, userId) => {
      const pageId = msg.payload.pageId;
      const blockId = msg.payload.blockId;
      let room = this.rooms.get(pageId);
      if (!room) {
        room = { users: new Map(), locks: new Map(), pendingChanges: [] };
        this.rooms.set(pageId, room);
      }
      const existing = room.locks.get(blockId);
      if (
        existing &&
        existing.userId !== userId &&
        new Date(existing.expiresAt) > new Date()
      ) {
        this.sendToUser(userId, {
          type: 'lock:denied',
          payload: { blockId, heldBy: existing.userId },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      const lock: LockInfo = {
        userId,
        blockId,
        acquiredAt: new Date().toISOString(),
      };
      room.locks.set(blockId, {
        ...lock,
        expiresAt: new Date(Date.now() + 300000).toISOString(),
      });
      this.sendToUser(userId, {
        type: 'lock:acquired',
        payload: { blockId, lock },
        timestamp: new Date().toISOString(),
      });
      this.broadcast(
        pageId,
        {
          type: 'lock:held',
          payload: { userId, blockId },
          timestamp: new Date().toISOString(),
        },
        [userId]
      );
    });

    this.on('lock:release', async (msg, userId) => {
      const pageId = msg.payload.pageId;
      const blockId = msg.payload.blockId;
      const room = this.rooms.get(pageId);
      if (room) {
        room.locks.delete(blockId);
        this.broadcast(
          pageId,
          {
            type: 'lock:released',
            payload: { userId, blockId },
            timestamp: new Date().toISOString(),
          },
          [userId]
        );
      }
    });

    this.on('chat:message', async (msg, userId) => {
      this.broadcast(msg.payload.pageId || msg.room || '', {
        type: 'chat:message',
        payload: {
          userId,
          message: msg.payload.message,
          userName: msg.payload.userName || userId,
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  on(type: string, handler: MessageHandler): void {
    this.handlers.set(type, handler);
  }

  async handleMessage(
    socketId: string,
    userId: string,
    message: WebSocketMessage
  ): Promise<void> {
    const now = Date.now();

    if (this.isRateLimited(userId)) return;

    const user = this.findUserInRooms(userId);
    if (user) user.lastActive = now;

    this.metrics.messageTimestamps.push(now);
    if (this.metrics.messageTimestamps.length > 1000)
      this.metrics.messageTimestamps.shift();

    const startLatency = now;
    const handler = this.handlers.get(message.type);
    if (handler) {
      await handler(message, userId);
      this.metrics.latencyTotal += Date.now() - startLatency;
      this.metrics.latencyCount++;
    }
  }

  broadcast(
    room: string,
    message: WebSocketMessage,
    excludeUserIds: string[] = []
  ): void {
    // In production, this sends to all connected clients in the room
    // via Socket.IO or WebSocket connection pool
  }

  sendToUser(userId: string, message: WebSocketMessage): void {
    // In production, this sends to the specific user's socket(s)
  }

  getUsersInRoom(
    pageId: string
  ): { userId: string; status: string; currentBlock?: string }[] {
    const room = this.rooms.get(pageId);
    if (!room) return [];
    return Array.from(room.users.values()).map((u) => ({
      userId: u.userId,
      status: 'online',
      currentBlock: u.selectedBlock,
    }));
  }

  getActiveLocks(pageId: string): { blockId: string; userId: string }[] {
    const room = this.rooms.get(pageId);
    if (!room) return [];
    return Array.from(room.locks.values())
      .filter((l) => new Date(l.expiresAt) > new Date())
      .map((l) => ({ blockId: l.blockId, userId: l.userId }));
  }

  private removeFromRoom(pageId: string, userId: string): void {
    const room = this.rooms.get(pageId);
    if (!room) return;
    room.users.delete(userId);
    for (const [blockId, lock] of room.locks) {
      if (lock.userId === userId) room.locks.delete(blockId);
    }
    if (room.users.size === 0) {
      this.rooms.delete(pageId);
      this.roomHistory.delete(pageId);
    }
  }

  private trackUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
    this.userSockets.get(userId)!.add(socketId);
  }

  private findUserInRooms(userId: string): { lastActive: number } | null {
    for (const room of this.rooms.values()) {
      const user = room.users.get(userId);
      if (user) return user;
    }
    return null;
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  setConnectionRateLimit(webhookId: string, maxPerMinute: number): void {
    const existing = this.rateLimits.get(webhookId);
    if (existing) {
      existing.maxPerMinute = maxPerMinute;
    } else {
      this.rateLimits.set(webhookId, {
        maxPerMinute,
        userBuckets: new Map(),
      });
    }
  }

  private isRateLimited(userId: string): boolean {
    const now = Date.now();
    const window = 60000;

    for (const config of this.rateLimits.values()) {
      let timestamps = config.userBuckets.get(userId);
      if (!timestamps) {
        timestamps = [];
        config.userBuckets.set(userId, timestamps);
      }

      while (timestamps.length > 0 && timestamps[0] < now - window) {
        timestamps.shift();
      }

      if (timestamps.length >= config.maxPerMinute) return true;
      timestamps.push(now);
    }

    return false;
  }

  setPresenceTimeout(seconds: number): void {
    this.presenceTimeoutSeconds = seconds;
    if (this.presenceTimer) {
      clearInterval(this.presenceTimer);
      this.presenceTimer = null;
    }
    if (seconds <= 0) return;
    this.presenceTimer = setInterval(
      () => {
        this.cleanupStalePresence();
      },
      Math.min(seconds * 1000, 30000)
    );
  }

  private cleanupStalePresence(): void {
    if (this.presenceTimeoutSeconds <= 0) return;
    const cutoff = Date.now() - this.presenceTimeoutSeconds * 1000;
    for (const [pageId, room] of this.rooms) {
      const stale: string[] = [];
      for (const [userId, user] of room.users) {
        if (user.lastActive < cutoff) stale.push(userId);
      }
      for (const userId of stale) {
        this.removeFromRoom(pageId, userId);
        this.broadcast(pageId, {
          type: 'presence:timeout',
          payload: { userId },
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  getRoomHistory(
    pageId: string,
    limit: number = 50
  ): { userId: string; changes: any; timestamp: string }[] {
    const history = this.roomHistory.get(pageId);
    if (!history) return [];
    return history.slice(-limit);
  }

  clearRoomHistory(pageId: string): void {
    this.roomHistory.delete(pageId);
  }

  enablePersistence(kernel: SukitKernel): void {
    this.persistenceKernel = kernel;
  }

  handleBinary(socketId: string, userId: string, buffer: ArrayBuffer): void {
    const base64 = Buffer.from(buffer).toString('base64');
    const pageId = this.findUserPage(userId);
    if (!pageId) return;

    const user = this.rooms.get(pageId)?.users.get(userId);
    if (user) user.lastActive = Date.now();

    this.broadcast(pageId, {
      type: 'binary:data',
      payload: { userId, data: base64 },
      timestamp: new Date().toISOString(),
    });
  }

  private findUserPage(userId: string): string | null {
    for (const [pageId, room] of this.rooms) {
      if (room.users.has(userId)) return pageId;
    }
    return null;
  }

  enableCompression(): void {
    this.compressionEnabled = true;
  }

  async compress(data: string): Promise<Buffer> {
    return pDeflate(data);
  }

  async decompress(data: Buffer): Promise<Buffer> {
    return pInflate(data);
  }

  getConnectionMetrics(): {
    totalConnections: number;
    activeRooms: number;
    messagesPerSecond: number;
    avgLatency: number;
  } {
    const now = Date.now();
    const recentMessages = this.metrics.messageTimestamps.filter(
      (t) => t > now - 1000
    ).length;
    return {
      totalConnections: this.metrics.totalConnections,
      activeRooms: this.rooms.size,
      messagesPerSecond: recentMessages,
      avgLatency:
        this.metrics.latencyCount > 0
          ? Math.round(this.metrics.latencyTotal / this.metrics.latencyCount)
          : 0,
    };
  }
}
