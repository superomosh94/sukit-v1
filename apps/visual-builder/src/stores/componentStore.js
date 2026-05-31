import create from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Component Store using Zustand.
 * Manages:
 *  - built‑in components (loaded from registry)
 *  - custom components added by the user
 *  - favorite component ids (persisted in localStorage)
 */
export const useComponentStore = create(persist(
  (set, get) => ({
    components: [], // all components (built‑in + custom)
    customComponents: [], // only user‑added custom components
    favorites: [],
    selectedComponent: null,

    // ----- Component management -----
    setComponents: components => set({ components }),
    addComponent: component =>
      set(state => ({ components: [...state.components, component] })),
    addCustomComponent: component =>
      set(state => ({
        components: [...state.components, component],
        customComponents: [...state.customComponents, component],
      })),

    // ----- Favorites -----
    addFavorite: id =>
      set(state => ({ favorites: [...state.favorites, id] })),
    removeFavorite: id =>
      set(state => ({ favorites: state.favorites.filter(fid => fid !== id) })),
    toggleFavorite: id =>
      set(state => {
        const isFav = state.favorites.includes(id);
        return {
          favorites: isFav
            ? state.favorites.filter(fid => fid !== id)
            : [...state.favorites, id],
        };
      }),

    // ----- Selection -----
    setSelectedComponent: component => set({ selectedComponent: component }),

    // ----- Recent Components -----
    recentComponents: [],

    addRecentComponent: id => set(state => {
      const filtered = state.recentComponents.filter(rid => rid !== id);
      return { recentComponents: [id, ...filtered].slice(0, 10) };
    }),

    getRecentComponents: () => {
      const { recentComponents, components } = get();
      return recentComponents
        .map(id => components.find(c => c.id === id))
        .filter(Boolean);
    },

    // ----- Helpers -----
    getComponentById: id => get().components.find(c => c.id === id),
    isFavorite: id => get().favorites.includes(id),
  }),
  {
    name: 'component-store', // storage key
    getStorage: () => localStorage,
  }
));
