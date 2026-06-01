import type { SettingsPanel } from '../types';
export interface SettingsAdapter {
  get<T>(key: string, defaultValue?: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
}
export declare function setSettingsAdapter(adapter: SettingsAdapter): void;
export declare function createSettingsAPI(
  prefix: string,
  adapter?: SettingsAdapter
): {
  get<T>(key: string, defaultValue?: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  registerPanel(panel: SettingsPanel): void;
  getPanel(id: string): SettingsPanel | undefined;
  getAllPanels(): SettingsPanel[];
};
export type SettingsAPI = ReturnType<typeof createSettingsAPI>;
