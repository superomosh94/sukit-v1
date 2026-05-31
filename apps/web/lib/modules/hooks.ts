type HookCallback = (...args: unknown[]) => unknown;

class HookSystem {
  private actions: Map<string, HookCallback[]> = new Map();
  private filters: Map<string, HookCallback[]> = new Map();

  addAction(hook: string, callback: HookCallback, priority: number = 10): void {
    this.addToMap(this.actions, hook, callback, priority);
  }

  addFilter(hook: string, callback: HookCallback, priority: number = 10): void {
    this.addToMap(this.filters, hook, callback, priority);
  }

  doAction(hook: string, ...args: unknown[]): void {
    const callbacks = this.actions.get(hook);
    if (!callbacks) return;
    for (const cb of callbacks) {
      cb(...args);
    }
  }

  applyFilters(hook: string, value: unknown, ...args: unknown[]): unknown {
    const callbacks = this.filters.get(hook);
    if (!callbacks) return value;
    let result = value;
    for (const cb of callbacks) {
      result = cb(result, ...args);
    }
    return result;
  }

  removeAction(hook: string, callback: HookCallback): void {
    this.removeFromMap(this.actions, hook, callback);
  }

  removeFilter(hook: string, callback: HookCallback): void {
    this.removeFromMap(this.filters, hook, callback);
  }

  private addToMap(
    map: Map<string, HookCallback[]>,
    hook: string,
    callback: HookCallback,
    _priority: number,
  ): void {
    if (!map.has(hook)) map.set(hook, []);
    map.get(hook)!.push(callback);
  }

  private removeFromMap(
    map: Map<string, HookCallback[]>,
    hook: string,
    callback: HookCallback,
  ): void {
    const callbacks = map.get(hook);
    if (!callbacks) return;
    const idx = callbacks.indexOf(callback);
    if (idx >= 0) callbacks.splice(idx, 1);
  }

  hasAction(hook: string): boolean {
    return (this.actions.get(hook)?.length ?? 0) > 0;
  }

  hasFilter(hook: string): boolean {
    return (this.filters.get(hook)?.length ?? 0) > 0;
  }
}

export const hooks = new HookSystem();

export function addAction(
  hook: string,
  callback: HookCallback,
  priority?: number,
): void {
  hooks.addAction(hook, callback, priority);
}

export function addFilter(
  hook: string,
  callback: HookCallback,
  priority?: number,
): void {
  hooks.addFilter(hook, callback, priority);
}

export function doAction(hook: string, ...args: unknown[]): void {
  hooks.doAction(hook, ...args);
}

export function applyFilters(
  hook: string,
  value: unknown,
  ...args: unknown[]
): unknown {
  return hooks.applyFilters(hook, value, ...args);
}
