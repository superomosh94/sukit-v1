import React from 'react';
import { cn } from '../../../utils/cn';

export const Stack = ({ 
    direction = 'vertical',
    spacing = 4,
    children,
    className 
}) => {
    const spacingClasses = {
        0: 'space-y-0 space-x-0',
        1: direction === 'vertical' ? 'space-y-1' : 'space-x-1',
        2: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
        3: direction === 'vertical' ? 'space-y-3' : 'space-x-3',
        4: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
        5: direction === 'vertical' ? 'space-y-5' : 'space-x-5',
        6: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
        8: direction === 'vertical' ? 'space-y-8' : 'space-x-8',
        10: direction === 'vertical' ? 'space-y-10' : 'space-x-10'
    };

    const directionClass = direction === 'vertical' ? 'flex flex-col' : 'flex flex-row';

    return (
        <div className={cn(directionClass, spacingClasses[spacing], className)}>
            {children}
        </div>
    );
};

Stack.displayName = 'Stack';
export default Stack;
