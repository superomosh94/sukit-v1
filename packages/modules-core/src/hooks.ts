type ActionCallback = (...args: any[]) => void;
type FilterCallback = (value: any, ...args: any[]) => any;

const actions = new Map<string, ActionCallback[]>();
const filters = new Map<string, FilterCallback[]>();

export function addAction(name: string, callback: ActionCallback): void {
  if (!actions.has(name)) {
    actions.set(name, []);
  }
  actions.get(name)!.push(callback);
}

export function removeAction(name: string, callback: ActionCallback): void {
  const callbacks = actions.get(name);
  if (callbacks) {
    const idx = callbacks.indexOf(callback);
    if (idx !== -1) callbacks.splice(idx, 1);
  }
}

export function doAction(name: string, ...args: any[]): void {
  const callbacks = actions.get(name);
  if (callbacks) {
    for (const cb of callbacks) {
      cb(...args);
    }
  }
}

export function addFilter(name: string, callback: FilterCallback): void {
  if (!filters.has(name)) {
    filters.set(name, []);
  }
  filters.get(name)!.push(callback);
}

export function removeFilter(name: string, callback: FilterCallback): void {
  const callbacks = filters.get(name);
  if (callbacks) {
    const idx = callbacks.indexOf(callback);
    if (idx !== -1) callbacks.splice(idx, 1);
  }
}

export function applyFilters(name: string, value: any, ...args: any[]): any {
  const callbacks = filters.get(name);
  if (!callbacks) return value;

  let result = value;
  for (const cb of callbacks) {
    result = cb(result, ...args);
  }
  return result;
}
