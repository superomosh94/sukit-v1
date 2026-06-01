import type { SukitKernel } from '@sukit/core';
import type { WebSocketMessage, PresenceInfo } from '../../types';

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

export class WebSocketServer {
  private kernel: SukitKernel;
  private rooms: Map<string, RoomState> = new Map();
  private handlers: Map<string, MessageHandler> = new Map();
  private userSockets: Map<string, Set<string>> = new Map();

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
      });
      this.trackUserSocket(userId, msg.payload.socketId || '');
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
        if (user) user.cursor = msg.payload.position;
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
    const handler = this.handlers.get(message.type);
    if (handler) await handler(message, userId);
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
    if (room.users.size === 0) this.rooms.delete(pageId);
  }

  private trackUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
    this.userSockets.get(userId)!.add(socketId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getRoomCount(): number {
    return this.rooms.size;
  }
}
