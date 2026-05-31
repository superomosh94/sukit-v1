interface RoomUser {
  userId: string;
  username: string;
  color: string;
  joinedAt: number;
  isIdle: boolean;
  cursor?: { x: number; y: number; elementId?: string };
  selectedElement?: { elementId: string | null; elementType: string | null };
}

interface RoomPresence {
  userId: string;
  username: string;
  color: string;
  cursor?: { x: number; y: number; elementId?: string };
  isEditing: boolean;
}

interface RoomState {
  sections: any[];
  pageSettings: any;
  sceneVersion: number;
}

class RoomManager {
  private rooms: Map<string, Map<string, RoomUser>> = new Map();
  private roomStates: Map<string, RoomState> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();
  private cleanupTimers: Map<string, NodeJS.Timeout> = new Map();

  joinRoom(userId: string, pageId: string, username?: string, color?: string): RoomUser {
    if (!this.rooms.has(pageId)) {
      this.rooms.set(pageId, new Map());
    }
    const room = this.rooms.get(pageId)!;
    if (!room.has(userId)) {
      const assignedColor = color || this.assignColor(room);
      room.set(userId, {
        userId,
        username: username || 'Anonymous',
        color: assignedColor,
        joinedAt: Date.now(),
        isIdle: false,
      });
    }

    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(pageId);

    const timer = this.cleanupTimers.get(pageId);
    if (timer) {
      clearTimeout(timer);
      this.cleanupTimers.delete(pageId);
    }

    return room.get(userId)!;
  }

  leaveRoom(userId: string, pageId: string): void {
    const room = this.rooms.get(pageId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) {
        const timer = setTimeout(() => {
          this.rooms.delete(pageId);
          this.roomStates.delete(pageId);
          this.cleanupTimers.delete(pageId);
        }, 300000);
        this.cleanupTimers.set(pageId, timer);
      }
    }

    const userSet = this.userRooms.get(userId);
    if (userSet) {
      userSet.delete(pageId);
      if (userSet.size === 0) {
        this.userRooms.delete(userId);
      }
    }
  }

  getRoomUsers(pageId: string): RoomUser[] {
    const room = this.rooms.get(pageId);
    if (!room) return [];
    return Array.from(room.values());
  }

  getRoomPresence(pageId: string): RoomPresence[] {
    const room = this.rooms.get(pageId);
    if (!room) return [];
    return Array.from(room.values()).map((u) => ({
      userId: u.userId,
      username: u.username,
      color: u.color,
      cursor: u.cursor,
      isEditing: !u.isIdle && !!u.selectedElement?.elementId,
    }));
  }

  getUserRooms(userId: string): string[] {
    const userSet = this.userRooms.get(userId);
    if (!userSet) return [];
    return Array.from(userSet);
  }

  getRoomState(pageId: string): RoomState | null {
    return this.roomStates.get(pageId) || null;
  }

  setRoomState(pageId: string, state: RoomState): void {
    this.roomStates.set(pageId, state);
  }

  updateSceneVersion(pageId: string): number {
    const state = this.roomStates.get(pageId);
    if (state) {
      state.sceneVersion++;
      return state.sceneVersion;
    }
    this.roomStates.set(pageId, { sections: [], pageSettings: {}, sceneVersion: 1 });
    return 1;
  }

  updateCursor(userId: string, pageId: string, cursor: { x: number; y: number; elementId?: string }): void {
    const room = this.rooms.get(pageId);
    if (room) {
      const user = room.get(userId);
      if (user) {
        user.cursor = cursor;
      }
    }
  }

  updateSelection(userId: string, pageId: string, elementId: string | null, elementType: string | null): void {
    const room = this.rooms.get(pageId);
    if (room) {
      const user = room.get(userId);
      if (user) {
        user.selectedElement = { elementId, elementType };
      }
    }
  }

  setIdle(userId: string, pageId: string, isIdle: boolean): void {
    const room = this.rooms.get(pageId);
    if (room) {
      const user = room.get(userId);
      if (user) {
        user.isIdle = isIdle;
      }
    }
  }

  private assignColor(room: Map<string, RoomUser>): string {
    const usedColors = new Set(Array.from(room.values()).map((u) => u.color));
    const palette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    for (const c of palette) {
      if (!usedColors.has(c)) return c;
    }
    return palette[room.size % palette.length];
  }
}

export const roomManager = new RoomManager();
