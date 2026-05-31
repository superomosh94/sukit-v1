import React from 'react';
import { cn } from '../../utils/cn';

export const SafeArea = ({ 
    children, 
    className,
    top = true,
    bottom = true,
    left = true,
    right = true 
}) => {
    const safeAreaClasses = [];
    
    if (top) safeAreaClasses.push('pt-safe-top');
    if (bottom) safeAreaClasses.push('pb-safe-bottom');
    if (left) safeAreaClasses.push('pl-safe-left');
    if (right) safeAreaClasses.push('pr-safe-right');
    
    return (
        <div className={cn(safeAreaClasses.join(' '), className)}>
            {children}
        </div>
    );
};

export const SafeAreaView = ({ children, className }) => {
    return (
        <div className={cn(
            'min-h-screen w-full',
            'pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right',
            className
        )}>
            {children}
        </div>
    );
};

export default SafeArea;