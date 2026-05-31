import React, { createContext, useContext, useReducer, useCallback } from 'react';

const SelectionContext = createContext();

const selectionReducer = (state, action) => {
    switch (action.type) {
        case 'SELECT':
            if (action.multi) {
                if (state.selected.includes(action.id)) {
                    return { ...state, selected: state.selected.filter(id => id !== action.id) };
                } else {
                    return { ...state, selected: [...state.selected, action.id] };
                }
            } else {
                return { ...state, selected: [action.id] };
            }
        case 'SELECT_ALL':
            return { ...state, selected: action.ids };
        case 'CLEAR':
            return { ...state, selected: [] };
        case 'GROUP':
            const groupId = `group-${Date.now()}`;
            const groupedComponents = action.components.map(comp => ({
                ...comp,
                parentId: groupId,
                originalPosition: comp.position
            }));
            const groupComponent = {
                id: groupId,
                type: 'Group',
                children: action.components.map(c => c.id),
                position: action.position
            };
            return {
                ...state,
                selected: [groupId],
                components: [...state.components.filter(c => !action.componentIds.includes(c.id)), groupComponent, ...groupedComponents]
            };
        case 'UNGROUP':
            const group = state.components.find(c => c.id === action.groupId);
            const childComponents = state.components.filter(c => group.children?.includes(c.id));
            const ungroupedComponents = childComponents.map(c => ({ ...c, parentId: null, position: c.originalPosition || c.position }));
            return {
                ...state,
                selected: childComponents.map(c => c.id),
                components: [...state.components.filter(c => c.id !== action.groupId && !group.children?.includes(c.id)), ...ungroupedComponents]
            };
        default:
            return state;
    }
};

export const SelectionProvider = ({ children }) => {
    const [state, dispatch] = useReducer(selectionReducer, { selected: [] });

    const select = useCallback((id, multi = false) => {
        dispatch({ type: 'SELECT', id, multi });
    }, []);

    const selectAll = useCallback((ids) => {
        dispatch({ type: 'SELECT_ALL', ids });
    }, []);

    const clearSelection = useCallback(() => {
        dispatch({ type: 'CLEAR' });
    }, []);

    const groupComponents = useCallback((componentIds, components, position) => {
        dispatch({ type: 'GROUP', componentIds, components, position });
    }, []);

    const ungroupComponents = useCallback((groupId) => {
        dispatch({ type: 'UNGROUP', groupId });
    }, []);

    return (
        <SelectionContext.Provider value={{
            selected: state.selected,
            select,
            selectAll,
            clearSelection,
            groupComponents,
            ungroupComponents
        }}>
            {children}
        </SelectionContext.Provider>
    );
};

export const useSelection = () => {
    const context = useContext(SelectionContext);
    if (!context) throw new Error('useSelection must be used within SelectionProvider');
    return context;
};
