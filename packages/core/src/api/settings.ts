import type { SettingsPanel } from "../types";

export interface SettingsAdapter {
  get<T>(key: string, defaultValue?: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
}

let _adapter: SettingsAdapter | null = null;

export function setSettingsAdapter(adapter: SettingsAdapter): void {
  _adapter = adapter;
}

export function createSettingsAPI(prefix: string, adapter?: SettingsAdapter) {
  const a = () => adapter ?? _adapter;
  const panels = new Map<string, SettingsPanel>();

  const prefixed = (key: string) => `${prefix}:${key}`;

  return {
    async get<T>(key: string, defaultValue?: T): Promise<T> {
      const val = await a()!.get<T>(prefixed(key));
      return val ?? defaultValue as T;
    },

    async set<T>(key: string, value: T): Promise<void> {
      return a()!.set(prefixed(key), value);
    },

    registerPanel(panel: SettingsPanel): void {
      panels.set(panel.id, panel);
    },

    getPanel(id: string): SettingsPanel | undefined {
      return panels.get(id);
    },

    getAllPanels(): SettingsPanel[] {
      return Array.from(panels.values());
    },
  };
}

export type SettingsAPI = ReturnType<typeof createSettingsAPI>;
