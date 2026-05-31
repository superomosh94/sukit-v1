import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Rnd } from 'react-rnd';
import React from 'react';

export const SortableComponent = ({ id, component, isSelected, onSelect, onDelete, onResize, onMove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: component.position || 'relative',
        left: component.position?.x || 0,
        top: component.position?.y || 0,
        ...component.styles
    };

    const renderComponent = () => {
        switch (component.type) {
            case 'Button':
                return (
                    <button className={`btn btn-${component.props.variant || 'primary'}`}>
                        {component.props.text || 'Button'}
                    </button>
                );
            case 'Container':
                return (
                    <div className="container">
                        {component.props.text || 'Container'}
                    </div>
                );
            case 'Heading':
                return (
                    <h1 className="heading">
                        {component.props.text || 'Heading'}
                    </h1>
                );
            default:
                return (
                    <div className="component-placeholder">
                        {component.type}
                    </div>
                );
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(id);
    };

    const handleResizeStop = (e, direction, ref, delta, position) => {
        onResize(id, { width: ref.style.width, height: ref.style.height });
        onMove(id, { x: position.x, y: position.y });
    };

    const handleDragStop = (e, data) => {
        onMove(id, { x: data.x, y: data.y });
    };

    return (
        <Rnd
            ref={setNodeRef}
            size={{ width: component.styles?.width || 'auto', height: component.styles?.height || 'auto' }}
            position={{ x: component.position?.x || 0, y: component.position?.y || 0 }}
            onResizeStop={handleResizeStop}
            onDragStop={handleDragStop}
            disableDragging={isDragging}
            enableResizing={isSelected}
            className={`canvas-component ${isSelected ? 'selected' : ''}`}
            style={style}
            onClick={(e) => onSelect(e, id)}
        >
            <div className="component-drag-handle" {...attributes} {...listeners}>
                ⋮⋮
            </div>
            {isSelected && (
                <button className="component-delete" onClick={handleDelete}>
                    ×
                </button>
            )}
            <div className="component-content">
                {renderComponent()}
            </div>
        </Rnd>
    );
};
