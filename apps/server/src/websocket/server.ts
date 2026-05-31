import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { roomManager } from './rooms';
import { registerHandlers } from './handlers';

const JWT_SECRET = process.env.JWT_SECRET || 'sukit-dev-secret';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export async function createSocketServer(httpServer: HttpServer): Promise<Server> {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  try {
    const pubClient = new Redis(REDIS_URL);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Redis adapter attached to Socket.IO');
  } catch (err) {
    logger.warn('Redis not available, running without multi-instance support', (err as Error).message);
  }

  const collab = io.of('/collaboration');

  collab.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token as string, JWT_SECRET) as { userId: string; email: string; username?: string };
      (socket as any).userId = decoded.userId;
      (socket as any).email = decoded.email;
      (socket as any).username = decoded.username || 'Anonymous';
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  collab.on('connection', (socket) => {
    const userId = (socket as any).userId;
    logger.info(`User connected to collaboration namespace`, { userId, socketId: socket.id });

    registerHandlers(socket, collab);

    socket.on('disconnect', () => {
      const rooms = roomManager.getUserRooms(userId);
      for (const pageId of rooms) {
        roomManager.leaveRoom(userId, pageId);
        collab.to(pageId).emit('broadcast', {
          type: 'USER_LEAVE',
          roomId: pageId,
          payload: {},
          userId,
          timestamp: Date.now(),
        });
        const presence = {
          type: 'ROOM_PRESENCE',
          roomId: pageId,
          payload: { users: roomManager.getRoomPresence(pageId) },
          userId: 'system',
          timestamp: Date.now(),
        };
        collab.to(pageId).emit('broadcast', presence);
      }
      logger.info(`User disconnected`, { userId, socketId: socket.id });
    });
  });

  return io;
}
