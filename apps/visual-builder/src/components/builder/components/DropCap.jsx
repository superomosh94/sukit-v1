import React from 'react';
import { cn } from '../../../utils/cn';

export const DropCap = ({ 
    text, 
    size = 'lg',
    color = 'primary',
    className 
}) => {
    const sizeClasses = {
        sm: 'text-4xl',
        md: 'text-6xl',
        lg: 'text-8xl'
    };

    const colorClasses = {
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        text: 'text-text-primary',
        accent: 'text-accent-500'
    };

    const firstLetter = text?.charAt(0) || '';
    const restOfText = text?.slice(1) || '';

    return (
        <p className={cn('text-text-primary leading-relaxed', className)}>
            <span className={cn(
                'float-left mr-3 leading-none font-bold',
                sizeClasses[size],
                colorClasses[color]
            )}>
                {firstLetter}
            </span>
            {restOfText}
        </p>
    );
};

DropCap.displayName = 'DropCap';
export default DropCap;
