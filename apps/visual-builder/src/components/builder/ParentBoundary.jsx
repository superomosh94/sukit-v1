import React, { useState, useEffect } from 'react';

export const ParentBoundary = ({ component, components, onParentSelect }) => {
    const [parent, setParent] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (component?.parentId) {
            const parentComponent = components.find(c => c.id === component.parentId);
            setParent(parentComponent);
        } else {
            setParent(null);
        }
    }, [component, components]);

    if (!parent || !isHovered) return null;

    return (
        <div
            className="parent-boundary absolute inset-0 pointer-events-none"
            style={{
                border: '2px solid #F59E0B',
                borderRadius: '4px',
                boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)'
            }}
        >
            <div className="absolute -top-6 left-0 bg-warning-500 text-white text-xs px-2 py-0.5 rounded pointer-events-auto cursor-pointer"
                onClick={() => onParentSelect?.(parent.id)}
            >
                Parent: {parent.type}
            </div>
        </div>
    );
};
