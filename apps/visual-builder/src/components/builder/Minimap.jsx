import React, { useRef, useCallback } from 'react';
import { cn } from '../../utils/cn';

export const Minimap = ({ components = [], zoom = 100, panOffset = { x: 0, y: 0 }, onPanTo }) => {
    const containerRef = useRef(null);
    const scale = 0.05;
    const canvasWidth = 200;
    const canvasHeight = 150;

    const handleClick = useCallback((e) => {
        if (!containerRef.current || !onPanTo) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale - canvasWidth / 2;
        const y = (e.clientY - rect.top) / scale - canvasHeight / 2;
        onPanTo({ x, y });
    }, [onPanTo]);

    const viewportWidth = (canvasWidth / scale) * (zoom / 100);
    const viewportHeight = (canvasHeight / scale) * (zoom / 100);

    return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
            <p className="text-xs text-text-secondary mb-2 font-medium">Minimap</p>
            <div
                ref={containerRef}
                className="relative bg-surface-light rounded border border-border overflow-hidden cursor-pointer"
                style={{ width: canvasWidth, height: canvasHeight }}
                onClick={handleClick}
            >
                <svg width={canvasWidth} height={canvasHeight}>
                    {components.map((comp) => {
                        const pos = comp.position || { x: 0, y: 0 };
                        const size = comp.size || { width: 100, height: 50 };
                        return (
                            <rect
                                key={comp.id}
                                x={pos.x * scale}
                                y={pos.y * scale}
                                width={Math.max(2, size.width * scale)}
                                height={Math.max(2, size.height * scale)}
                                className="fill-primary-500/40 stroke-primary-500/60"
                                strokeWidth={0.5}
                                rx={1}
                            />
                        );
                    })}
                    <rect
                        x={(-panOffset.x / zoom) * 100 * scale}
                        y={(-panOffset.y / zoom) * 100 * scale}
                        width={viewportWidth}
                        height={viewportHeight}
                        className="fill-transparent stroke-text-secondary"
                        strokeWidth={1}
                        rx={2}
                        strokeDasharray="2 2"
                    />
                </svg>
            </div>
        </div>
    );
};

Minimap.displayName = 'Minimap';
export default Minimap;
