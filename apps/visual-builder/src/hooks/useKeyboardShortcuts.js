import { useEffect, useCallback } from 'react';
import { useSelection } from '../components/builder/SelectionManager';
import { useClipboard } from '../components/builder/ClipboardManager';
import { useEditorStore } from '../stores/editorStore';

export const useKeyboardShortcuts = ({
    onUndo,
    onRedo,
    onSave,
    onPreview,
    onZoomIn,
    onZoomOut,
    onFitScreen,
    canUndo,
    canRedo
}) => {
    const { selected, clearSelection, selectAll } = useSelection();
    const { copy, cut, paste, hasClipboard } = useClipboard();
    const { components, deleteComponent, duplicateComponent, addComponent } = useEditorStore();

    const handleKeyDown = useCallback((e) => {
        const isCtrl = e.ctrlKey || e.metaKey;
        
        // Ctrl+Z = Undo
        if (isCtrl && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            onUndo?.();
        }
        
        // Ctrl+Y or Ctrl+Shift+Z = Redo
        if (isCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            onRedo?.();
        }
        
        // Ctrl+S = Save
        if (isCtrl && e.key === 's') {
            e.preventDefault();
            onSave?.();
        }
        
        // Ctrl+P = Preview
        if (isCtrl && e.key === 'p') {
            e.preventDefault();
            onPreview?.();
        }
        
        // Ctrl+C = Copy
        if (isCtrl && e.key === 'c') {
            e.preventDefault();
            const selectedComponents = components.filter(c => selected.includes(c.id));
            if (selectedComponents.length > 0) {
                copy(selectedComponents);
            }
        }
        
        // Ctrl+X = Cut
        if (isCtrl && e.key === 'x') {
            e.preventDefault();
            const selectedComponents = components.filter(c => selected.includes(c.id));
            if (selectedComponents.length > 0) {
                copy(selectedComponents);
                selectedComponents.forEach(c => deleteComponent(c.id));
                clearSelection();
            }
        }
        
        // Ctrl+V = Paste
        if (isCtrl && e.key === 'v') {
            e.preventDefault();
            if (hasClipboard()) {
                const pastedComponents = paste();
                if (pastedComponents) {
                    pastedComponents.forEach(comp => addComponent(comp.type, comp.position, comp.props, comp.styles));
                }
            }
        }
        
        // Ctrl+D = Duplicate
        if (isCtrl && e.key === 'd') {
            e.preventDefault();
            const selectedComponents = components.filter(c => selected.includes(c.id));
            selectedComponents.forEach(comp => {
                duplicateComponent(comp.id);
            });
        }
        
        // Delete = Delete
        if (e.key === 'Delete') {
            e.preventDefault();
            selected.forEach(id => deleteComponent(id));
            clearSelection();
        }
        
        // Ctrl+A = Select All
        if (isCtrl && e.key === 'a') {
            e.preventDefault();
            selectAll(components.map(c => c.id));
        }
        
        // Escape = Clear Selection
        if (e.key === 'Escape') {
            clearSelection();
        }
        
        // Arrow Keys = Nudge
        if (selected.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const delta = {
                ArrowUp: { x: 0, y: -step },
                ArrowDown: { x: 0, y: step },
                ArrowLeft: { x: -step, y: 0 },
                ArrowRight: { x: step, y: 0 }
            }[e.key];
            
            selected.forEach(id => {
                const component = components.find(c => c.id === id);
                if (component) {
                    const newPosition = {
                        x: (component.position?.x || 0) + delta.x,
                        y: (component.position?.y || 0) + delta.y
                    };
                    // Update component position via store
                    useEditorStore.getState().updateComponent(id, { position: newPosition });
                }
            });
        }
        
        // Ctrl++ = Zoom In
        if (isCtrl && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            onZoomIn?.();
        }
        
        // Ctrl+- = Zoom Out
        if (isCtrl && e.key === '-') {
            e.preventDefault();
            onZoomOut?.();
        }
        
        // Ctrl+0 = Fit to Screen
        if (isCtrl && e.key === '0') {
            e.preventDefault();
            onFitScreen?.();
        }
        
        // Space = Pan mode (handled by canvas)
        if (e.key === ' ' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            // Pan mode logic in canvas
        }
        
        // Ctrl+G = Group
        if (isCtrl && e.key === 'g') {
            e.preventDefault();
            // Group logic
        }
        
        // Ctrl+Shift+G = Ungroup
        if (isCtrl && e.shiftKey && e.key === 'G') {
            e.preventDefault();
            // Ungroup logic
        }
    }, [selected, components, copy, cut, paste, hasClipboard, deleteComponent, duplicateComponent, addComponent, clearSelection, selectAll, onUndo, onRedo, onSave, onPreview, onZoomIn, onZoomOut, onFitScreen]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};
