import React from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Icon = ({ 
    name = 'Star', 
    size = 'md',
    color = 'current',
    className 
}) => {
    const IconComponent = Icons[name];
    
    if (!IconComponent) {
        return null;
    }

    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
        '2xl': 'w-10 h-10',
        '3xl': 'w-12 h-12'
    };

    const colorClasses = {
        current: 'text-current',
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        success: 'text-success-500',
        warning: 'text-warning-500',
        danger: 'text-danger-500',
        text: 'text-text-primary',
        textSecondary: 'text-text-secondary'
    };

    return (
        <IconComponent className={cn(sizeClasses[size], colorClasses[color], className)} />
    );
};

Icon.displayName = 'Icon';
export default Icon;
