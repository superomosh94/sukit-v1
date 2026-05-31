import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
    persist(
        (set, get) => ({
            settings: {},
            updateSettings: (category, newSettings) => set((state) => ({
                settings: {
                    ...state.settings,
                    [category]: {
                        ...state.settings[category],
                        ...newSettings
                    }
                }
            })),
            saveSettings: async () => {
                // Mock API call to save settings
                return new Promise(resolve => setTimeout(resolve, 500));
            },
            resetSettings: () => set({ settings: {} })
        }),
        {
            name: 'sukit-settings',
        }
    )
);
