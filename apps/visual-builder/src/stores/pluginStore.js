import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePluginStore = create(
    persist(
        (set, get) => ({
            installedPlugins: [],
            availablePlugins: [],
            loading: false,
            error: null,

            fetchPlugins: async () => {
                set({ loading: true, error: null });
                try {
                    const plugins = await window.api.getPlugins();
                    set({ availablePlugins: plugins, loading: false });
                } catch (err) {
                    set({ loading: false, error: err.message });
                }
            },

            installPlugin: (plugin, settings = {}) => set((state) => ({
                installedPlugins: [...state.installedPlugins, {
                    ...plugin,
                    settings,
                    installedAt: new Date().toISOString(),
                    hasUpdate: false
                }]
            })),

            uninstallPlugin: (id) => set((state) => ({
                installedPlugins: state.installedPlugins.filter(p => p.id !== id)
            })),

            updatePlugin: (id) => set((state) => ({
                installedPlugins: state.installedPlugins.map(p =>
                    p.id === id ? { ...p, version: (parseFloat(p.version) + 0.1).toFixed(1), hasUpdate: false } : p
                )
            })),

            getPluginById: (id) => {
                const { availablePlugins, installedPlugins } = get();
                return availablePlugins.find(p => p.id === id) || installedPlugins.find(p => p.id === id);
            }
        }),
        {
            name: 'sukit-plugins',
            partialize: (state) => ({ installedPlugins: state.installedPlugins })
        }
    )
);
