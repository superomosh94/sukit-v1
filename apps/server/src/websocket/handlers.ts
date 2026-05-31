import { Socket, Namespace } from 'socket.io';
import { roomManager } from './rooms';

interface BuilderEvent {
  type: string;
  roomId: string;
  payload: Record<string, unknown>;
  userId: string;
  timestamp: number;
}

const VALID_EVENT_TYPES = new Set([
  'BLOCK_UPDATE',
  'BLOCK_MOVE',
  'BLOCK_DELETE',
  'SECTION_ADD',
  'SECTION_REORDER',
  'SECTION_DELETE',
  'CURSOR_MOVE',
  'SELECT_CHANGE',
  'SCENE_SYNC',
  'IDLE_CHANGE',
  'USER_JOIN',
  'USER_LEAVE',
]);

function validateEvent(data: unknown): data is BuilderEvent {
  if (!data || typeof data !== 'object') return false;
  const ev = data as Record<string, unknown>;
  return (
    typeof ev.type === 'string' &&
    VALID_EVENT_TYPES.has(ev.type) &&
    typeof ev.roomId === 'string' &&
    typeof ev.payload === 'object' &&
    ev.payload !== null &&
    typeof ev.userId === 'string'
  );
}

export function registerHandlers(socket: Socket, namespace: Namespace): void {
  const userId = (socket as any).userId;
  const username = (socket as any).username || 'Anonymous';

  socket.on('server', (roomId: string, data: unknown) => {
    if (!validateEvent(data)) return;
    const event = data as BuilderEvent;

    event.userId = userId;
    event.timestamp = Date.now();

    if (event.type === 'CURSOR_MOVE') {
      const { x, y, elementId } = event.payload as { x: number; y: number; elementId?: string };
      roomManager.updateCursor(userId, roomId, { x, y, elementId });
      socket.to(roomId).emit('broadcast', event);
      return;
    }

    if (event.type === 'SELECT_CHANGE') {
      const { elementId, elementType } = event.payload as { elementId: string | null; elementType: string | null };
      roomManager.updateSelection(userId, roomId, elementId, elementType);
      socket.to(roomId).emit('broadcast', event);
      return;
    }

    if (event.type === 'IDLE_CHANGE') {
      const { isIdle } = event.payload as { isIdle: boolean };
      roomManager.setIdle(userId, roomId, isIdle);
      socket.to(roomId).emit('broadcast', event);
      return;
    }

    if (event.type === 'SCENE_SYNC') {
      const { sections, pageSettings } = event.payload as { sections: any[]; pageSettings: any };
      roomManager.setRoomState(roomId, { sections: sections || [], pageSettings: pageSettings || {}, sceneVersion: roomManager.updateSceneVersion(roomId) });
      namespace.to(roomId).emit('broadcast', event);
      return;
    }

    socket.to(roomId).emit('broadcast', event);
  });

  socket.on('server-volatile', (roomId: string, data: unknown) => {
    if (!validateEvent(data)) return;
    const event = data as BuilderEvent;
    event.userId = userId;
    event.timestamp = Date.now();
    socket.volatile.to(roomId).emit('broadcast', event);
  });

  socket.on('request-full-sync', (roomId: string) => {
    const state = roomManager.getRoomState(roomId);
    if (state) {
      socket.emit('broadcast', {
        type: 'SCENE_INIT',
        roomId,
        payload: {
          sections: state.sections,
          pageSettings: state.pageSettings,
          sceneVersion: state.sceneVersion,
        },
        userId: 'system',
        timestamp: Date.now(),
      });
    }
  });

  socket.on('join-room', (roomId: string) => {
    const color = (socket as any).color;
    const user = roomManager.joinRoom(userId, roomId, username, color);
    socket.join(roomId);

    const joinEvent = {
      type: 'USER_JOIN',
      roomId,
      payload: { username: user.username, color: user.color },
      userId,
      timestamp: Date.now(),
    };
    socket.to(roomId).emit('broadcast', joinEvent);

    const state = roomManager.getRoomState(roomId);
    if (state) {
      socket.emit('broadcast', {
        type: 'SCENE_INIT',
        roomId,
        payload: {
          sections: state.sections,
          pageSettings: state.pageSettings,
          sceneVersion: state.sceneVersion,
        },
        userId: 'system',
        timestamp: Date.now(),
      });
    }

    const presence = {
      type: 'ROOM_PRESENCE',
      roomId,
      payload: { users: roomManager.getRoomPresence(roomId) },
      userId: 'system',
      timestamp: Date.now(),
    };
    namespace.to(roomId).emit('broadcast', presence);
  });

  socket.on('leave-room', (roomId: string) => {
    roomManager.leaveRoom(userId, roomId);
    socket.leave(roomId);

    const leaveEvent = {
      type: 'USER_LEAVE',
      roomId,
      payload: {},
      userId,
      timestamp: Date.now(),
    };
    socket.to(roomId).emit('broadcast', leaveEvent);

    const presence = {
      type: 'ROOM_PRESENCE',
      roomId,
      payload: { users: roomManager.getRoomPresence(roomId) },
      userId: 'system',
      timestamp: Date.now(),
    };
    namespace.to(roomId).emit('broadcast', presence);
  });
}
