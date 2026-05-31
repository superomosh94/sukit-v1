import { create } from 'zustand';

const MAX_HISTORY = 50;

const pushHistory = (state) => {
    const history = state.history || [];
    return {
        history: [...history.slice(-MAX_HISTORY), state.components],
        historyIndex: (state.historyIndex ?? -1) + 1,
    };
};

export const useEditorStore = create((set, get) => ({
    components: [],
    selectedComponentId: null,
    clipboard: null,
    history: [],
    historyIndex: -1,

    addComponent: (type, defaultProps) => set(state => {
        const newComponent = typeof type === 'string'
            ? {
                id: `${type}_${Date.now()}`,
                type,
                props: { text: type, ...(defaultProps || {}) },
                position: { x: 100 + state.components.length * 20, y: 100 + state.components.length * 20 },
                size: { width: 200, height: 100 }
              }
            : { id: type.id || `${type.type}_${Date.now()}`, ...type };
        return { ...pushHistory(state), components: [...state.components, newComponent] };
    }),

    updateComponent: (id, updates) => set(state => ({
        ...pushHistory(state),
        components: state.components.map(c => c.id === id ? { ...c, ...updates } : c)
    })),

    updateComponentPosition: (id, dx, dy) => set(state => ({
        ...pushHistory(state),
        components: state.components.map(c =>
            c.id === id ? { ...c, position: { x: (c.position?.x || 0) + dx, y: (c.position?.y || 0) + dy } } : c
        )
    })),

    updateComponentSize: (id, dw, dh, newX, newY) => set(state => ({
        ...pushHistory(state),
        components: state.components.map(c => {
            if (c.id !== id) return c;
            const size = { width: Math.max(20, (c.size?.width || 200) + dw), height: Math.max(20, (c.size?.height || 100) + dh) };
            const position = { x: newX ?? c.position?.x ?? 0, y: newY ?? c.position?.y ?? 0 };
            return { ...c, size, position };
        })
    })),

    deleteComponent: (id) => set(state => ({
        ...pushHistory(state),
        components: state.components.filter(c => c.id !== id),
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
    })),

    selectComponent: (id) => set({ selectedComponentId: id }),

    duplicateComponent: (id) => set(state => {
        const source = state.components.find(c => c.id === id);
        if (!source) return state;
        const duplicate = {
            ...source,
            id: `${source.type}_${Date.now()}`,
            position: { x: (source.position?.x || 0) + 20, y: (source.position?.y || 0) + 20 }
        };
        return { ...pushHistory(state), components: [...state.components, duplicate] };
    }),

    undo: () => set(state => {
        if ((state.historyIndex ?? -1) < 0) return state;
        const targetIndex = Math.max(0, (state.historyIndex ?? 0) - 1);
        const prevComponents = state.history[targetIndex] || [];
        return {
            components: prevComponents,
            historyIndex: targetIndex,
            selectedComponentId: null,
        };
    }),

    redo: () => set(state => {
        const nextIndex = (state.historyIndex ?? 0) + 1;
        if (nextIndex >= state.history.length) return state;
        const nextComponents = state.history[nextIndex] || state.components;
        return {
            components: nextComponents,
            historyIndex: nextIndex,
            selectedComponentId: null,
        };
    }),

    canUndo: () => (get().historyIndex ?? -1) > 0,
    canRedo: () => (get().historyIndex ?? -1) < get().history.length - 1,

    groupComponents: (ids) => set(state => {
        const groupId = `group_${Date.now()}`;
        const children = state.components.filter(c => ids.includes(c.id));
        const group = {
            id: groupId,
            type: 'group',
            position: { x: Math.min(...children.map(c => c.position?.x || 0)), y: Math.min(...children.map(c => c.position?.y || 0)) },
            size: { width: 200, height: 100 },
            children: ids,
            props: { text: 'Group' }
        };
        return {
            ...pushHistory(state),
            components: [...state.components.filter(c => !ids.includes(c.id)), group]
        };
    }),

    ungroupComponent: (id) => set(state => {
        const group = state.components.find(c => c.id === id);
        if (!group || group.type !== 'group') return state;
        return state;
    }),

    getComponentChildren: (parentId) => {
        return get().components.filter(c => c.parentId === parentId);
    },

    setClipboard: (data) => set({ clipboard: data }),
}));
