import React from 'react';
import { cn } from '../../../utils/cn';

export const Divider = ({ 
    orientation = 'horizontal',
    thickness = 1,
    color = 'border',
    spacing = 4,
    className 
}) => {
    const thicknessClass = {
        1: 'border',
        2: 'border-2',
        3: 'border-3',
        4: 'border-4'
    };

    const colorClasses = {
        border: 'border-border',
        primary: 'border-primary-500',
        secondary: 'border-secondary-500',
        text: 'border-text-primary',
        textSecondary: 'border-text-secondary'
    };

    const spacingClasses = {
        0: 'my-0 mx-0',
        2: orientation === 'horizontal' ? 'my-2' : 'mx-2',
        4: orientation === 'horizontal' ? 'my-4' : 'mx-4',
        6: orientation === 'horizontal' ? 'my-6' : 'mx-6',
        8: orientation === 'horizontal' ? 'my-8' : 'mx-8'
    };

    return (
        <hr 
            className={cn(
                orientation === 'horizontal' ? 'w-full' : 'h-full',
                thicknessClass[thickness] || 'border',
                colorClasses[color],
                spacingClasses[spacing],
                className
            )}
        />
    );
};

Divider.displayName = 'Divider';
export default Divider;
