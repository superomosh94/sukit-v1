import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useComponentVersionStore = create(
    persist(
        (set, get) => ({
            versions: {},

            saveVersion: (componentId, componentData) => set((state) => {
                const componentVersions = state.versions[componentId] || [];
                const newVersion = {
                    id: `v${componentVersions.length + 1}_${Date.now()}`,
                    componentId,
                    data: JSON.parse(JSON.stringify(componentData)),
                    timestamp: new Date().toISOString(),
                    label: `Version ${componentVersions.length + 1}`,
                };
                return {
                    versions: {
                        ...state.versions,
                        [componentId]: [...componentVersions, newVersion],
                    },
                };
            }),

            restoreVersion: (componentId, versionId) => {
                const componentVersions = get().versions[componentId];
                if (!componentVersions) return null;
                const version = componentVersions.find(v => v.id === versionId);
                return version ? JSON.parse(JSON.stringify(version.data)) : null;
            },

            listVersions: (componentId) => {
                return get().versions[componentId] || [];
            },

            deleteVersion: (componentId, versionId) => set((state) => {
                const componentVersions = state.versions[componentId] || [];
                return {
                    versions: {
                        ...state.versions,
                        [componentId]: componentVersions.filter(v => v.id !== versionId),
                    },
                };
            }),

            deleteAllVersions: (componentId) => set((state) => {
                const { [componentId]: _, ...rest } = state.versions;
                return { versions: rest };
            }),
        }),
        {
            name: 'sukit-component-versions',
        }
    )
);

export default useComponentVersionStore;
