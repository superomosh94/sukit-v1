export interface UserPresence {
  userId: string;
  name: string;
  color: string;
  cursor: CursorPosition | null;
  lastSeen: number;
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

const PRESENCE_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

class PresenceManager {
  private users: Map<string, UserPresence> = new Map();
  private colorIndex = 0;

  join(userId: string, name: string): UserPresence {
    const color = PRESENCE_COLORS[this.colorIndex % PRESENCE_COLORS.length];
    this.colorIndex++;

    const presence: UserPresence = {
      userId,
      name,
      color,
      cursor: null,
      lastSeen: Date.now(),
    };

    this.users.set(userId, presence);
    return presence;
  }

  leave(userId: string): void {
    this.users.delete(userId);
  }

  updateCursor(userId: string, cursor: CursorPosition): void {
    const user = this.users.get(userId);
    if (user) {
      user.cursor = cursor;
      user.lastSeen = Date.now();
    }
  }

  getUsers(): UserPresence[] {
    return Array.from(this.users.values());
  }

  getUser(userId: string): UserPresence | undefined {
    return this.users.get(userId);
  }

  cleanupInactive(timeoutMs: number = 30000): string[] {
    const now = Date.now();
    const inactive: string[] = [];

    for (const [id, user] of this.users) {
      if (now - user.lastSeen > timeoutMs) {
        inactive.push(id);
      }
    }

    inactive.forEach((id) => this.users.delete(id));
    return inactive;
  }
}

export const presenceManager = new PresenceManager();
