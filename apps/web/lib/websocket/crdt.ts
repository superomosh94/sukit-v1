export interface CRDTEntry {
  id: string;
  version: number;
  nonce: string;
  data: unknown;
  userId: string;
  timestamp: number;
}

export interface CRDTUpdate {
  id: string;
  version: number;
  nonce: string;
  data: unknown;
  userId: string;
}

export interface CRDTSyncSignal {
  type: 'delta' | 'full';
  entries: CRDTEntry[];
  requestFullSync?: boolean;
}

const FULL_SYNC_INTERVAL = 30000;

class CRDTStore {
  private entries: Map<string, CRDTEntry> = new Map();
  private editingLocks: Map<string, { userId: string; lockedAt: number }> = new Map();
  private lastFullSync = Date.now();
  private listeners: Array<(entries: CRDTEntry[]) => void> = [];

  apply(update: CRDTUpdate): boolean {
    const existing = this.entries.get(update.id);

    if (!existing) {
      this.entries.set(update.id, {
        ...update,
        timestamp: Date.now(),
      });
      this.notifyListeners();
      return true;
    }

    if (update.version > existing.version) {
      this.entries.set(update.id, {
        ...update,
        timestamp: Date.now(),
      });
      this.notifyListeners();
      return true;
    }

    if (
      update.version === existing.version &&
      update.nonce > existing.nonce
    ) {
      existing.nonce = update.nonce;
      existing.data = update.data;
      existing.userId = update.userId;
      existing.timestamp = Date.now();
      this.notifyListeners();
      return true;
    }

    return false;
  }

  reconcileFractionalIndex(
    getSortKey: (data: unknown) => string,
    setSortKey: (data: unknown, key: string) => unknown,
  ): void {
    const items = this.getAll();
    const sorted = items.sort((a, b) => {
      const ka = getSortKey(a.data);
      const kb = getSortKey(b.data);
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    let prev: string | null = null;
    for (const item of sorted) {
      const key = getSortKey(item.data);
      if (prev !== null && key <= prev) {
        item.data = setSortKey(item.data, prev + '_' + item.id.slice(0, 4));
      }
      prev = getSortKey(item.data);
    }
  }

  acquireLock(id: string, userId: string): boolean {
    const existing = this.editingLocks.get(id);
    if (existing && existing.userId !== userId) {
      const elapsed = Date.now() - existing.lockedAt;
      if (elapsed < 10000) return false;
    }
    this.editingLocks.set(id, { userId, lockedAt: Date.now() });
    return true;
  }

  releaseLock(id: string, userId: string): void {
    const lock = this.editingLocks.get(id);
    if (lock && lock.userId === userId) {
      this.editingLocks.delete(id);
    }
  }

  isLockedByOther(id: string, userId: string): boolean {
    const lock = this.editingLocks.get(id);
    return !!lock && lock.userId !== userId && (Date.now() - lock.lockedAt) < 10000;
  }

  get(id: string): CRDTEntry | undefined {
    return this.entries.get(id);
  }

  getAll(): CRDTEntry[] {
    return Array.from(this.entries.values());
  }

  getState(): Record<string, CRDTEntry> {
    return Object.fromEntries(this.entries);
  }

  mergeState(state: Record<string, CRDTEntry>): number {
    let count = 0;
    for (const [id, entry] of Object.entries(state)) {
      if (this.apply(entry)) count++;
    }
    return count;
  }

  shouldFullSync(): boolean {
    const now = Date.now();
    if (now - this.lastFullSync > FULL_SYNC_INTERVAL) {
      this.lastFullSync = now;
      return true;
    }
    return false;
  }

  buildSyncSignal(): CRDTSyncSignal {
    return {
      type: 'full',
      entries: this.getAll(),
      requestFullSync: this.shouldFullSync(),
    };
  }

  subscribe(fn: (entries: CRDTEntry[]) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notifyListeners(): void {
    const all = this.getAll();
    this.listeners.forEach((fn) => fn(all));
  }
}

export const crdtStore = new CRDTStore();
