import React, { useState, useEffect } from 'react';

export const SpacingIndicator = ({ component, onSpacingChange }) => {
    const [margin, setMargin] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
    const [padding, setPadding] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

    useEffect(() => {
        if (component?.styles) {
            setMargin({
                top: parseInt(component.styles.marginTop) || 0,
                right: parseInt(component.styles.marginRight) || 0,
                bottom: parseInt(component.styles.marginBottom) || 0,
                left: parseInt(component.styles.marginLeft) || 0
            });
            setPadding({
                top: parseInt(component.styles.paddingTop) || 0,
                right: parseInt(component.styles.paddingRight) || 0,
                bottom: parseInt(component.styles.paddingBottom) || 0,
                left: parseInt(component.styles.paddingLeft) || 0
            });
        }
    }, [component]);

    const handleMarginChange = (side, value) => {
        const newMargin = { ...margin, [side]: value };
        setMargin(newMargin);
        onSpacingChange?.('margin', newMargin);
    };

    const handlePaddingChange = (side, value) => {
        const newPadding = { ...padding, [side]: value };
        setPadding(newPadding);
        onSpacingChange?.('padding', newPadding);
    };

    return (
        <div className="spacing-indicator absolute inset-0 pointer-events-none">
            {/* Margin indicators (outer) */}
            {margin.top > 0 && (
                <div className="absolute left-0 right-0 bg-blue-500/20 border-t-2 border-blue-500 pointer-events-auto" style={{ top: -margin.top, height: margin.top }}>
                    <span className="absolute left-1/2 -translate-x-1/2 text-xs text-blue-500">{margin.top}px</span>
                </div>
            )}
            {margin.bottom > 0 && (
                <div className="absolute left-0 right-0 bg-blue-500/20 border-b-2 border-blue-500 pointer-events-auto" style={{ bottom: -margin.bottom, height: margin.bottom }}>
                    <span className="absolute left-1/2 -translate-x-1/2 text-xs text-blue-500">{margin.bottom}px</span>
                </div>
            )}
            {margin.left > 0 && (
                <div className="absolute top-0 bottom-0 bg-blue-500/20 border-l-2 border-blue-500 pointer-events-auto" style={{ left: -margin.left, width: margin.left }}>
                    <span className="absolute top-1/2 -translate-y-1/2 text-xs text-blue-500 whitespace-nowrap">{margin.left}px</span>
                </div>
            )}
            {margin.right > 0 && (
                <div className="absolute top-0 bottom-0 bg-blue-500/20 border-r-2 border-blue-500 pointer-events-auto" style={{ right: -margin.right, width: margin.right }}>
                    <span className="absolute top-1/2 -translate-y-1/2 text-xs text-blue-500 whitespace-nowrap">{margin.right}px</span>
                </div>
            )}
            
            {/* Padding indicators (inner) */}
            {padding.top > 0 && (
                <div className="absolute left-0 right-0 bg-green-500/20 border-t-2 border-green-500" style={{ top: 0, height: padding.top }}>
                    <span className="absolute left-1/2 -translate-x-1/2 text-xs text-green-500">{padding.top}px</span>
                </div>
            )}
            {padding.bottom > 0 && (
                <div className="absolute left-0 right-0 bg-green-500/20 border-b-2 border-green-500" style={{ bottom: 0, height: padding.bottom }}>
                    <span className="absolute left-1/2 -translate-x-1/2 text-xs text-green-500">{padding.bottom}px</span>
                </div>
            )}
            {padding.left > 0 && (
                <div className="absolute top-0 bottom-0 bg-green-500/20 border-l-2 border-green-500" style={{ left: 0, width: padding.left }}>
                    <span className="absolute top-1/2 -translate-y-1/2 text-xs text-green-500 whitespace-nowrap">{padding.left}px</span>
                </div>
            )}
            {padding.right > 0 && (
                <div className="absolute top-0 bottom-0 bg-green-500/20 border-r-2 border-green-500" style={{ right: 0, width: padding.right }}>
                    <span className="absolute top-1/2 -translate-y-1/2 text-xs text-green-500 whitespace-nowrap">{padding.right}px</span>
                </div>
            )}
        </div>
    );
};
