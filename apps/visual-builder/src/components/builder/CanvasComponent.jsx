import React from 'react';
import { cn } from '../../utils/cn';

export const CanvasComponent = ({ component, isSelected, isHovered, onMouseDown, onMouseEnter, onMouseLeave, children, zoom }) => {
    if (!component) return null;

    const position = component.position || { x: 0, y: 0 };
    const size = component.size || { width: 200, height: 100 };

    const renderContent = () => {
        const type = component.type || 'div';
        const props = component.props || {};

        switch (type) {
            case 'heading':
                return React.createElement('h1', { className: 'text-2xl font-bold' }, props.text || 'Heading');
            case 'paragraph':
                return React.createElement('p', { className: 'text-base' }, props.text || 'Paragraph');
            case 'button':
                return React.createElement('button', { className: 'px-4 py-2 bg-primary-500 text-white rounded' }, props.text || 'Button');
            case 'image':
                return React.createElement('img', { src: props.src || '', alt: props.alt || '', className: 'w-full h-full object-cover' });
            case 'group':
                return React.createElement('div', { className: 'p-2' }, 'Group');
            default:
                return React.createElement('div', { className: 'p-2' }, props.text || type);
        }
    };

    return (
        <div
            id={`component-${component.id}`}
            className={cn(
                'absolute select-none',
                isSelected && 'ring-2 ring-primary-500 ring-offset-1',
                isHovered && !isSelected && 'ring-1 ring-primary-300',
            )}
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                minHeight: size.height,
                cursor: 'move',
            }}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="w-full h-full bg-surface rounded border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {renderContent()}
            </div>
            {children && children.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CanvasComponent;