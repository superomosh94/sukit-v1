import React from 'react';
import { cn } from '../../../utils/cn';

export const Grid = ({ 
    columns = 3, 
    gap = 4, 
    children, 
    className,
    responsive = true 
}) => {
    const gapClasses = {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
        10: 'gap-10',
        12: 'gap-12'
    };

    const getColumnsClass = (cols) => {
        if (responsive) {
            return {
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
            };
        }
        return {};
    };

    return (
        <div 
            className={cn('grid', gapClasses[gap] || 'gap-4', className)}
            style={getColumnsClass(columns)}
        >
            {React.Children.map(children, (child) => (
                <div className="min-w-0">{child}</div>
            ))}
        </div>
    );
};

Grid.displayName = 'Grid';
export default Grid;
