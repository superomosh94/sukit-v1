import React from 'react';
import { cn } from '../../../utils/cn';

export const List = ({ 
    type = 'unordered',
    items = [],
    spacing = 2,
    className 
}) => {
    const spacingClasses = {
        1: 'space-y-1',
        2: 'space-y-2',
        3: 'space-y-3',
        4: 'space-y-4'
    };

    const ListTag = type === 'unordered' ? 'ul' : 'ol';
    const listStyles = type === 'unordered' ? 'list-disc' : 'list-decimal';

    return (
        <ListTag className={cn('pl-5', listStyles, spacingClasses[spacing], className)}>
            {items.map((item, idx) => (
                <li key={idx} className="text-text-primary">
                    {typeof item === 'string' ? item : item.content}
                    {item.children && <List type={type} items={item.children} spacing={spacing} className="mt-2" />}
                </li>
            ))}
        </ListTag>
    );
};

List.displayName = 'List';
export default List;
