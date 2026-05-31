import React, { createContext, useContext, useRef, useCallback } from 'react';

const ClipboardContext = createContext();

export const ClipboardProvider = ({ children }) => {
    const clipboardRef = useRef(null);

    const copy = useCallback((components) => {
        clipboardRef.current = JSON.parse(JSON.stringify(components));
        return true;
    }, []);

    const cut = useCallback((components, deleteOriginal) => {
        clipboardRef.current = JSON.parse(JSON.stringify(components));
        if (deleteOriginal) {
            return true;
        }
        return true;
    }, []);

    const paste = useCallback((position) => {
        if (!clipboardRef.current) return null;
        
        const pastedComponents = clipboardRef.current.map(comp => ({
            ...comp,
            id: `${comp.type}-${Date.now()}-${Math.random()}`,
            position: position || { x: (comp.position?.x || 100) + 20, y: (comp.position?.y || 100) + 20 }
        }));
        
        return pastedComponents;
    }, []);

    const hasClipboard = useCallback(() => clipboardRef.current !== null, []);

    return (
        <ClipboardContext.Provider value={{ copy, cut, paste, hasClipboard }}>
            {children}
        </ClipboardContext.Provider>
    );
};

export const useClipboard = () => {
    const context = useContext(ClipboardContext);
    if (!context) throw new Error('useClipboard must be used within ClipboardProvider');
    return context;
};
