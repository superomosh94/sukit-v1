import React, { useState, useCallback } from 'react';
import { Focus, X } from 'lucide-react';

export const FocusMode = ({ components, selectedId, onExit, children }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [focusedComponentId, setFocusedComponentId] = useState(null);

    const enterFocusMode = useCallback((componentId) => {
        setFocusedComponentId(componentId);
        setIsFocused(true);
    }, []);

    const exitFocusMode = useCallback(() => {
        setIsFocused(false);
        setFocusedComponentId(null);
        onExit?.();
    }, [onExit]);

    const focusedComponent = components.find(c => c.id === focusedComponentId);

    if (isFocused && focusedComponent) {
        return (
            <div className="fixed inset-0 z-50 bg-background">
                {/* Focus Mode Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border">
                    <div className="flex items-center gap-2">
                        <Focus className="w-4 h-4 text-primary-500" />
                        <span className="text-sm text-text-primary">Focus Mode: {focusedComponent.type}</span>
                    </div>
                    <button
                        onClick={exitFocusMode}
                        className="p-1.5 rounded-lg hover:bg-surface-light transition-colors"
                    >
                        <X className="w-4 h-4 text-text-secondary" />
                    </button>
                </div>
                
                {/* Isolated Component */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="relative">
                        {React.cloneElement(children, { component: focusedComponent, isFocused: true })}
                    </div>
                </div>
                
                {/* Focus Mode Hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface text-text-secondary text-xs px-3 py-1 rounded-full">
                    Press ESC to exit focus mode
                </div>
            </div>
        );
    }

    // Wrap children with focus mode trigger
    return (
        <div className="focus-mode-container">
            {React.Children.map(children, child => {
                if (child?.props?.component?.id === selectedId) {
                    return React.cloneElement(child, {
                        onDoubleClick: () => enterFocusMode(selectedId)
                    });
                }
                return child;
            })}
        </div>
    );
};
