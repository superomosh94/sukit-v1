import React from 'react';

export const ResizeHandles = ({ componentId, component, onResizeStart, zoom }) => {
    if (!component) return null;

    const size = component.size || { width: 200, height: 100 };
    const hs = Math.max(6, 8 / (zoom / 100));

    const positions = [
        { direction: 'nw', cursor: 'nw-resize', top: -hs/2, left: -hs/2 },
        { direction: 'n', cursor: 'n-resize', top: -hs/2, left: '50%' },
        { direction: 'ne', cursor: 'ne-resize', top: -hs/2, right: -hs/2 },
        { direction: 'e', cursor: 'e-resize', right: -hs/2, top: '50%' },
        { direction: 'se', cursor: 'se-resize', bottom: -hs/2, right: -hs/2 },
        { direction: 's', cursor: 's-resize', bottom: -hs/2, left: '50%' },
        { direction: 'sw', cursor: 'sw-resize', bottom: -hs/2, left: -hs/2 },
        { direction: 'w', cursor: 'w-resize', left: -hs/2, top: '50%' },
    ];

    return (
        <>
            {positions.map(({ direction, cursor, ...style }) => (
                <div
                    key={direction}
                    className="absolute bg-white border-2 border-primary-500 rounded-full pointer-events-auto hover:scale-110 transition-transform z-50"
                    style={{
                        width: hs,
                        height: hs,
                        cursor,
                        ...(style.top !== undefined ? { top: style.top } : {}),
                        ...(style.left !== undefined ? { left: style.left } : {}),
                        ...(style.right !== undefined ? { right: style.right } : {}),
                        ...(style.bottom !== undefined ? { bottom: style.bottom } : {}),
                        ...(direction === 'n' || direction === 's' ? { transform: 'translateX(-50%)' } : {}),
                        ...(direction === 'e' || direction === 'w' ? { transform: 'translateY(-50%)' } : {}),
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onResizeStart(e, componentId, direction, component.position, size);
                    }}
                />
            ))}

            <div
                className="absolute bg-primary-500 rounded-full cursor-grab pointer-events-auto z-50 flex items-center justify-center"
                style={{
                    top: -(20 / (zoom / 100)),
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: hs * 1.5,
                    height: hs * 1.5,
                }}
            >
                <svg width="8" height="8" viewBox="0 0 8 8" style={{ transform: `scale(${100/zoom})` }}>
                    <path d="M4 0v8M0 4h8" stroke="white" strokeWidth="1.5" />
                </svg>
            </div>
        </>
    );
};

export default ResizeHandles;