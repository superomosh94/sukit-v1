import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useCanvasStore } from '../../stores/canvasStore';
import { useThemeStore } from '../../stores/themeStore';
import { cn } from '../../utils/cn';
import { CanvasComponent } from './CanvasComponent';
import { ResizeHandles } from './ResizeHandles';
import { AlignmentGuides } from './AlignmentGuides';

export const Canvas = ({
    components: propComponents,
    onSelectComponent,
    selectedId: propSelectedId,
    onUpdateComponent,
    onDeleteComponent: propDeleteComponent,
    zoom: propZoom,
    device: propDevice,
    showGrid: propShowGrid,
    snapToGrid: propSnapToGrid,
}) => {
    const store = useEditorStore();
    const canvasStore = useCanvasStore();
    const { colors } = useThemeStore();

    const components = propComponents ?? store.components;
    const selectedComponentId = propSelectedId ?? store.selectedComponentId;
    const selectComponent = onSelectComponent ?? store.selectComponent;
    const zoom = propZoom ?? canvasStore.zoom;
    const gridSize = canvasStore.gridSize;
    const snapToGrid = propSnapToGrid ?? canvasStore.snapToGrid;
    const showGrid = propShowGrid ?? canvasStore.showGrid;
    const device = propDevice ?? canvasStore.device;
    const panOffset = canvasStore.panOffset;
    const setPanOffset = canvasStore.setPanOffset;

    const [isDragging, setIsDragging] = useState(false);
    const [draggedComponent, setDraggedComponent] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [componentDragStartPos, setComponentDragStartPos] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState(null);
    const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
    const [selectionBox, setSelectionBox] = useState(null);
    const [selectedComponents, setSelectedComponents] = useState([]);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [hoveredComponent, setHoveredComponent] = useState(null);

    const canvasRef = useRef(null);
    const scale = zoom / 100;

    const deleteComponent = propDeleteComponent ?? store.deleteComponent;

    useEffect(() => {
        if (selectedComponentId) {
            setSelectedComponents([selectedComponentId]);
        } else {
            setSelectedComponents([]);
        }
    }, [selectedComponentId]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
                deleteComponent(selectedComponentId);
                e.preventDefault();
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedComponentId) {
                const component = components.find(c => c.id === selectedComponentId);
                if (component) store.setClipboard?.(JSON.parse(JSON.stringify(component)));
                e.preventDefault();
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                const clip = useEditorStore.getState().clipboard;
                if (clip) {
                    store.addComponent({
                        ...clip,
                        id: `${clip.type}_${Date.now()}`,
                        position: { x: (clip.position?.x || 0) + 20, y: (clip.position?.y || 0) + 20 },
                    });
                }
                e.preventDefault();
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedComponentId) {
                store.duplicateComponent?.(selectedComponentId);
                if (onUpdateComponent && selectedComponentId) {
                    const comp = components.find(c => c.id === selectedComponentId);
                    if (comp) store.addComponent?.({ ...comp, id: `${comp.type}_${Date.now()}`, position: { x: (comp.position?.x || 0) + 20, y: (comp.position?.y || 0) + 20 } });
                }
                e.preventDefault();
                return;
            }

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedComponentId) {
                const delta = e.shiftKey ? 10 : 1;
                const deltas = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] };
                const [dx, dy] = deltas[e.key];
                store.updateComponentPosition?.(selectedComponentId, dx, dy);
                if (onUpdateComponent && selectedComponentId) {
                    const comp = components.find(c => c.id === selectedComponentId);
                    if (comp) onUpdateComponent(selectedComponentId, { position: { x: (comp.position?.x || 0) + dx, y: (comp.position?.y || 0) + dy } });
                }
                e.preventDefault();
                return;
            }

            if (e.key === 'Escape') {
                selectComponent(null);
                setSelectedComponents([]);
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedComponentId, selectedComponents, components, deleteComponent, selectComponent, onUpdateComponent, store]);

    const handleCanvasMouseDown = useCallback((e) => {
        if (e.button === 1) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
            e.preventDefault();
            return;
        }

        if (e.target === canvasRef.current || e.target.closest('.canvas-viewport') === e.target) {
            selectComponent(null);
            setSelectedComponents([]);

            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / scale - panOffset.x;
            const y = (e.clientY - rect.top) / scale - panOffset.y;

            setSelectionBox({ x, y, width: 0, height: 0 });
        }
    }, [scale, panOffset, selectComponent]);

    const handleMouseMove = useCallback((e) => {
        if (isPanning) {
            setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
            return;
        }

        if (isDragging && draggedComponent) {
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / scale - panOffset.x;
            const mouseY = (e.clientY - rect.top) / scale - panOffset.y;

            const dx = mouseX - dragStart.x;
            const dy = mouseY - dragStart.y;

            let finalDx = dx;
            let finalDy = dy;

            if (snapToGrid) {
                finalDx = Math.round((componentDragStartPos.x + dx) / gridSize) * gridSize - componentDragStartPos.x;
                finalDy = Math.round((componentDragStartPos.y + dy) / gridSize) * gridSize - componentDragStartPos.y;
            }

            store.updateComponentPosition?.(draggedComponent, finalDx, finalDy);
            if (onUpdateComponent && draggedComponent) {
                const comp = components.find(c => c.id === draggedComponent);
                if (comp) onUpdateComponent(draggedComponent, {
                    position: { x: (comp.position?.x || 0) + finalDx, y: (comp.position?.y || 0) + finalDy }
                });
            }
            return;
        }

        if (isResizing && selectedComponentId && resizeDirection) {
            const rect = canvasRef.current.getBoundingClientRect();
            const currentX = (e.clientX - rect.left) / scale - panOffset.x;
            const currentY = (e.clientY - rect.top) / scale - panOffset.y;

            const deltaX = currentX - dragStart.x;
            const deltaY = currentY - dragStart.y;

            let newWidth = resizeStartSize.width;
            let newHeight = resizeStartSize.height;

            if (resizeDirection.includes('e')) newWidth = Math.max(20, resizeStartSize.width + deltaX);
            if (resizeDirection.includes('w')) newWidth = Math.max(20, resizeStartSize.width - deltaX);
            if (resizeDirection.includes('s')) newHeight = Math.max(20, resizeStartSize.height + deltaY);
            if (resizeDirection.includes('n')) newHeight = Math.max(20, resizeStartSize.height - deltaY);

            store.updateComponentSize?.(selectedComponentId, newWidth - resizeStartSize.width, newHeight - resizeStartSize.height);
            if (onUpdateComponent) {
                const comp = components.find(c => c.id === selectedComponentId);
                if (comp) onUpdateComponent(selectedComponentId, { size: { width: newWidth, height: newHeight } });
            }
            return;
        }

        if (selectionBox) {
            const rect = canvasRef.current.getBoundingClientRect();
            const currentX = (e.clientX - rect.left) / scale - panOffset.x;
            const currentY = (e.clientY - rect.top) / scale - panOffset.y;

            setSelectionBox(prev => ({
                ...prev,
                width: currentX - prev.x,
                height: currentY - prev.y,
            }));
        }
    }, [isDragging, draggedComponent, dragStart, componentDragStartPos, snapToGrid, gridSize, scale, panOffset, isResizing, selectedComponentId, resizeDirection, resizeStartSize, selectionBox, isPanning, panStart, setPanOffset, store, onUpdateComponent, components]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setDraggedComponent(null);
        setIsResizing(false);
        setResizeDirection(null);
        setIsPanning(false);

        if (selectionBox && Math.abs(selectionBox.width) > 5 && Math.abs(selectionBox.height) > 5) {
            const boxLeft = Math.min(selectionBox.x, selectionBox.x + selectionBox.width);
            const boxTop = Math.min(selectionBox.y, selectionBox.y + selectionBox.height);
            const boxRight = Math.max(selectionBox.x, selectionBox.x + selectionBox.width);
            const boxBottom = Math.max(selectionBox.y, selectionBox.y + selectionBox.height);

            const selected = components.filter(comp => {
                const pos = comp.position || { x: 0, y: 0 };
                const sz = comp.size || { width: 100, height: 100 };
                return pos.x < boxRight && (pos.x + sz.width) > boxLeft &&
                       pos.y < boxBottom && (pos.y + sz.height) > boxTop;
            });

            const selectedIds = selected.map(c => c.id);
            setSelectedComponents(selectedIds);
            if (selectedIds.length === 1) selectComponent(selectedIds[0]);
            else if (selectedIds.length > 1) selectComponent(null);
        }

        setSelectionBox(null);
    }, [selectionBox, components, selectComponent]);

    const handleComponentMouseDown = useCallback((e, componentId) => {
        e.stopPropagation();

        if (e.ctrlKey || e.metaKey) {
            setSelectedComponents(prev =>
                prev.includes(componentId)
                    ? prev.filter(id => id !== componentId)
                    : [...prev, componentId]
            );
            if (selectedComponents.length === 1 && selectedComponents[0] !== componentId) {
                selectComponent(null);
            }
        } else {
            selectComponent(componentId);
            setSelectedComponents([componentId]);
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / scale - panOffset.x;
        const mouseY = (e.clientY - rect.top) / scale - panOffset.y;

        const comp = components.find(c => c.id === componentId);
        const pos = comp?.position || { x: 0, y: 0 };

        setIsDragging(true);
        setDraggedComponent(componentId);
        setDragStart({ x: mouseX, y: mouseY });
        setComponentDragStartPos({ x: pos.x, y: pos.y });
    }, [scale, panOffset, selectComponent, selectedComponents, components]);

    const handleResizeStart = useCallback((e, componentId, direction, componentPosition, componentSize) => {
        e.stopPropagation();

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / scale - panOffset.x;
        const mouseY = (e.clientY - rect.top) / scale - panOffset.y;

        setIsResizing(true);
        selectComponent(componentId);
        setResizeDirection(direction);
        setDragStart({ x: mouseX, y: mouseY });
        setComponentDragStartPos({ x: componentPosition.x, y: componentPosition.y });
        setResizeStartSize({ width: componentSize.width, height: componentSize.height });
    }, [scale, panOffset, selectComponent]);

    const getDeviceStyle = () => {
        switch (device) {
            case 'mobile': return { width: 375, minHeight: 667 };
            case 'tablet': return { width: 768, minHeight: 1024 };
            default: return { width: '100%', minHeight: 600 };
        }
    };

    const deviceStyle = getDeviceStyle();
    const gridBgSize = `${gridSize * scale}px ${gridSize * scale}px`;

    return (
        <div
            ref={canvasRef}
            className={cn(
                "relative flex-1 overflow-auto bg-background",
                isPanning && "cursor-grabbing"
            )}
            style={{
                cursor: isPanning ? 'grabbing' : (isResizing ? `${resizeDirection}-resize` : 'default'),
                backgroundImage: showGrid ? `
                    linear-gradient(to right, ${colors?.border || '#334155'} 1px, transparent 1px),
                    linear-gradient(to bottom, ${colors?.border || '#334155'} 1px, transparent 1px)
                ` : 'none',
                backgroundSize: gridBgSize,
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                className="canvas-viewport relative mx-auto"
                style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    ...deviceStyle,
                    backgroundColor: colors?.surface || '#1E293B',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                    borderRadius: device === 'mobile' ? '20px' : device === 'tablet' ? '12px' : '0',
                    overflow: 'hidden',
                }}
            >
                {components.map(component => {
                    const isSelected = selectedComponents.includes(component.id);
                    const isHovered = hoveredComponent === component.id;
                    const children = (component.children || [])
                        .map(childId => components.find(c => c.id === childId))
                        .filter(Boolean);

                    return (
                        <CanvasComponent
                            key={component.id}
                            component={component}
                            isSelected={isSelected}
                            isHovered={isHovered}
                            onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
                            onMouseEnter={() => setHoveredComponent(component.id)}
                            onMouseLeave={() => setHoveredComponent(null)}
                            zoom={zoom}
                        >
                            {children.map(child => (
                                <CanvasComponent
                                    key={child.id}
                                    component={child}
                                    isSelected={selectedComponents.includes(child.id)}
                                    isHovered={hoveredComponent === child.id}
                                    onMouseDown={(e) => handleComponentMouseDown(e, child.id)}
                                    zoom={zoom}
                                />
                            ))}
                        </CanvasComponent>
                    );
                })}

                {selectedComponentId && (
                    <ResizeHandles
                        componentId={selectedComponentId}
                        component={components.find(c => c.id === selectedComponentId)}
                        onResizeStart={handleResizeStart}
                        zoom={zoom}
                    />
                )}

                {selectionBox && Math.abs(selectionBox.width) > 0 && (
                    <div
                        className="absolute border-2 border-primary-500 bg-primary-500/20 pointer-events-none z-40"
                        style={{
                            left: Math.min(selectionBox.x, selectionBox.x + selectionBox.width),
                            top: Math.min(selectionBox.y, selectionBox.y + selectionBox.height),
                            width: Math.abs(selectionBox.width),
                            height: Math.abs(selectionBox.height),
                        }}
                    />
                )}

                <AlignmentGuides
                    components={components}
                    selectedId={selectedComponentId}
                    canvasRef={canvasRef}
                />
            </div>
        </div>
    );
};

export default Canvas;