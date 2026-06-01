import type { SettingsPanel } from '../types';

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
  const hooks = new Map<
    string,
    Array<(key: string, oldVal: any, newVal: any) => void | Promise<void>>
  >();
  const schemas = new Map<
    string,
    { validate: (value: any) => boolean; type: string }
  >();
  const defaults = new Map<string, any>();
  const versionHistory = new Map<string, any[]>();

  const prefixed = (key: string) => `${prefix}:${key}`;

  const ensure = () => {
    const inst = a();
    if (!inst) throw new Error('Settings adapter not configured');
    return inst;
  };

  return {
    async get<T>(key: string, defaultValue?: T): Promise<T> {
      const def = defaults.has(key) ? defaults.get(key) : defaultValue;
      const val = await ensure().get<T>(prefixed(key));
      return val ?? (def as T);
    },

    async set<T>(key: string, value: T): Promise<void> {
      // Validate
      const schema = schemas.get(key);
      if (schema && !schema.validate(value)) {
        throw new Error(`Validation failed for setting "${key}"`);
      }

      // Get old value for hooks
      const oldVal = await ensure().get<T>(prefixed(key));

      await ensure().set(prefixed(key), value);

      // Run hooks
      const hks = hooks.get(key) ?? [];
      for (const hook of hks) {
        await hook(key, oldVal, value);
      }

      // Versioning
      if (!versionHistory.has(key)) versionHistory.set(key, []);
      versionHistory.get(key)!.push({
        key,
        oldValue: oldVal,
        newValue: value,
        timestamp: Date.now(),
      });
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

    /* --- Validation --- */
    registerSchema(
      key: string,
      schema: { validate: (value: any) => boolean; type: string }
    ): void {
      schemas.set(key, schema);
    },

    /* --- Defaults --- */
    setDefault<T>(key: string, value: T): void {
      defaults.set(key, value);
    },

    /* --- Hooks --- */
    addHook(
      key: string,
      hook: (key: string, oldVal: any, newVal: any) => void | Promise<void>
    ): void {
      if (!hooks.has(key)) hooks.set(key, []);
      hooks.get(key)!.push(hook);
    },

    /* --- Categories --- */
    categories: new Map<string, string[]>(),

    addToCategory(category: string, key: string): void {
      if (!this.categories.has(category)) this.categories.set(category, []);
      this.categories.get(category)!.push(key);
    },

    getByCategory(category: string): string[] {
      return this.categories.get(category) ?? [];
    },

    getCategories(): string[] {
      return Array.from(this.categories.keys());
    },

    /* --- Versioning --- */
    getVersionHistory(key: string): any[] {
      return versionHistory.get(key) ?? [];
    },

    /* --- Reset --- */
    async reset(key: string): Promise<void> {
      await ensure().set(prefixed(key), null);
    },

    async resetAll(): Promise<void> {
      for (const key of defaults.keys()) {
        await ensure().set(prefixed(key), defaults.get(key));
      }
    },

    /* --- Search --- */
    search(_query: string): string[] {
      return Array.from(panels.keys()).filter((k) => k.includes(_query));
    },
  };
}

export type SettingsAPI = ReturnType<typeof createSettingsAPI>;
