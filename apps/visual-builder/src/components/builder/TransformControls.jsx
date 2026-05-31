import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Move, Maximize2 } from 'lucide-react';

export const TransformControls = ({ 
    component, 
    onResize, 
    onRotate, 
    onMove,
    isSelected 
}) => {
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [startSize, setStartSize] = useState({ width: 0, height: 0 });
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [startRotation, setStartRotation] = useState(0);
    const [startAngle, setStartAngle] = useState(0);
    
    const componentRef = useRef(null);
    const centerRef = useRef({ x: 0, y: 0 });

    const handleResizeStart = (direction, e) => {
        e.stopPropagation();
        setIsResizing(true);
        const rect = componentRef.current?.getBoundingClientRect();
        setStartSize({ width: rect?.width || 0, height: rect?.height || 0 });
        setStartPosition({ x: e.clientX, y: e.clientY });
        
        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startPosition.x;
            const deltaY = moveEvent.clientY - startPosition.y;
            
            let newWidth = startSize.width;
            let newHeight = startSize.height;
            
            if (direction.includes('e')) newWidth = startSize.width + deltaX;
            if (direction.includes('w')) newWidth = startSize.width - deltaX;
            if (direction.includes('s')) newHeight = startSize.height + deltaY;
            if (direction.includes('n')) newHeight = startSize.height - deltaY;
            
            onResize({ width: Math.max(50, newWidth), height: Math.max(50, newHeight) });
        };
        
        const handleMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleRotateStart = (e) => {
        e.stopPropagation();
        setIsRotating(true);
        
        const rect = componentRef.current?.getBoundingClientRect();
        centerRef.current = { x: rect?.left + rect?.width / 2, y: rect?.top + rect?.height / 2 };
        const startAngle = Math.atan2(e.clientY - centerRef.current.y, e.clientX - centerRef.current.x);
        setStartRotation(component.rotation || 0);
        setStartAngle(startAngle);
        
        const handleMouseMove = (moveEvent) => {
            const currentAngle = Math.atan2(moveEvent.clientY - centerRef.current.y, moveEvent.clientX - centerRef.current.x);
            let deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
            let newRotation = startRotation + deltaAngle;
            onRotate(newRotation);
        };
        
        const handleMouseUp = () => {
            setIsRotating(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    if (!isSelected) return null;

    return (
        <div className="transform-controls absolute inset-0 pointer-events-none">
            {/* Resize Handles */}
            <div className="pointer-events-auto absolute -top-1 -left-1 w-3 h-3 bg-primary-500 border-2 border-white rounded-full cursor-nw-resize" onMouseDown={(e) => handleResizeStart('nw', e)} />
            <div className="pointer-events-auto absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary-500 border-2 border-white rounded-full cursor-n-resize" onMouseDown={(e) => handleResizeStart('n', e)} />
            <div className="pointer-events-auto absolute -top-1 -right-1 w-3 h-3 bg-primary-500 border-2 border-white rounded-full cursor-ne-resize" onMouseDown={(e) => handleResizeStart('ne', e)} />
            <div className="pointer-events-auto absolute left-1/2 -top-1 -translate-x-1/2 w-3 h-3 bg-primary-500 border-2 border-white rounded-full cursor-n-resize" onMouseDown={(e) => handleResizeStart('n', e)} />
            <div className="pointer-events-auto absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 border-2 border-white rounded-full cursor-e-resize" onMouseDown={(e) => handleResizeStart('e', e)} />
            <div className="pointer-events-auto absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 border-2 border-white rounded-full cursor-se-resize" onMouseDown={(e) => handleResizeStart('se', e)} />
            <div className="pointer-events-auto absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary-500 border-2 border-white rounded-full cursor-s-resize" onMouseDown={(e) => handleResizeStart('s', e)} />
            <div className="pointer-events-auto absolute -bottom-1 -left-1 w-3 h-3 bg-primary-500 border-2 border-white rounded-full cursor-sw-resize" onMouseDown={(e) => handleResizeStart('sw', e)} />
            <div className="pointer-events-auto absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 border-2 border-white rounded-full cursor-w-resize" onMouseDown={(e) => handleResizeStart('w', e)} />
            
            {/* Rotate Handle */}
            <div className="pointer-events-auto absolute -top-8 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary-500 border-2 border-white rounded-full cursor-grab flex items-center justify-center" onMouseDown={handleRotateStart}>
                <RotateCw className="w-3 h-3 text-white" />
            </div>
        </div>
    );
};
