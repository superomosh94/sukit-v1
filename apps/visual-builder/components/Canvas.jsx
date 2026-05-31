import React, { useState, useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableComponent } from './SortableComponent';

export const Canvas = () => {
    const { components, selectedComponentId, selectComponent, deleteComponent, updateComponent } = useEditorStore();
    const [activeId, setActiveId] = useState(null);
    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
    
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };
    
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (active.id !== over?.id) {
            const oldIndex = components.findIndex(c => c.id === active.id);
            const newIndex = components.findIndex(c => c.id === over?.id);
            const newComponents = arrayMove(components, oldIndex, newIndex);
            useEditorStore.setState({ components: newComponents });
        }
    };
    
    const handleComponentClick = (e, id) => {
        e.stopPropagation();
        selectComponent(id);
    };
    
    const handleCanvasClick = () => {
        selectComponent(null);
    };
    
    const handleDelete = (id) => {
        deleteComponent(id);
    };
    
    const handleResize = (id, size) => {
        updateComponent(id, { styles: { width: size.width, height: size.height } });
    };
    
    const handleMove = (id, position) => {
        updateComponent(id, { position });
    };
    
    if (!components || components.length === 0) {
        return (
            <div className="canvas-empty" onClick={handleCanvasClick}>
                <div className="empty-message"><p>Drag components here to build your page</p></div>
            </div>
        );
    }
    
    return (
        <div className="canvas-container" onClick={handleCanvasClick}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="canvas">
                        {components.map(component => (
                            <SortableComponent
                                key={component.id}
                                id={component.id}
                                component={component}
                                isSelected={selectedComponentId === component.id}
                                onSelect={handleComponentClick}
                                onDelete={handleDelete}
                                onResize={handleResize}
                                onMove={handleMove}
                            />
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay>
                    {activeId ? (
                        <div className="dragging-overlay">{components.find(c => c.id === activeId)?.type}</div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};
