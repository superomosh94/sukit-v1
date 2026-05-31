import React, { useState, useRef } from 'react';

export const Rulers = ({ zoom, pan, onGuideCreate }) => {
    const [showGuides, setShowGuides] = useState(true);
    const [draggingGuide, setDraggingGuide] = useState(null);
    const rulerRef = useRef(null);

    const getMarkers = () => {
        const markers = [];
        const step = 100;
        const start = -pan.x / zoom;
        const end = start + (rulerRef.current?.clientWidth || 0) / zoom;
        
        for (let i = Math.floor(start / step) * step; i <= end; i += step) {
            markers.push(i);
        }
        return markers;
    };

    const handleMouseDown = (e, orientation) => {
        const position = orientation === 'horizontal' ? e.clientX : e.clientY;
        setDraggingGuide({ orientation, position });
        
        const handleMouseMove = (moveEvent) => {
            const newPosition = orientation === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
            // Update guide position
        };
        
        const handleMouseUp = () => {
            if (draggingGuide) {
                onGuideCreate?.(draggingGuide.orientation, draggingGuide.position);
            }
            setDraggingGuide(null);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="rulers absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-20">
            {/* Top Ruler */}
            <div 
                ref={rulerRef}
                className="absolute top-0 left-8 right-0 h-6 bg-surface border-b border-border pointer-events-auto cursor-crosshair"
                onMouseDown={(e) => handleMouseDown(e, 'horizontal')}
            >
                {getMarkers().map(marker => (
                    <div key={marker} className="absolute top-0 h-full" style={{ left: (marker - pan.x) * zoom }}>
                        <div className="absolute top-0 w-px h-2 bg-text-secondary" />
                        <div className="absolute top-3 text-[8px] text-text-secondary whitespace-nowrap">
                            {Math.round(marker)}px
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Left Ruler */}
            <div 
                className="absolute left-0 top-6 bottom-0 w-6 bg-surface border-r border-border pointer-events-auto cursor-crosshair"
                onMouseDown={(e) => handleMouseDown(e, 'vertical')}
            >
                {getMarkers().map(marker => (
                    <div key={marker} className="absolute left-0 w-full" style={{ top: (marker - pan.y) * zoom }}>
                        <div className="absolute left-0 w-2 h-px bg-text-secondary" />
                        <div className="absolute left-3 text-[8px] text-text-secondary whitespace-nowrap">
                            {Math.round(marker)}px
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Corner */}
            <div className="absolute top-0 left-0 w-8 h-6 bg-surface border-r border-b border-border z-10" />
            
            {/* Dragging Guide Preview */}
            {draggingGuide && (
                <div 
                    className={`absolute bg-primary-500 pointer-events-none ${draggingGuide.orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full'}`}
                    style={draggingGuide.orientation === 'horizontal' 
                        ? { top: draggingGuide.position }
                        : { left: draggingGuide.position }
                    }
                />
            )}
        </div>
    );
};
