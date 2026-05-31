import React from 'react';
import { cn } from '../../../utils/cn';

export const Spacer = ({ 
    size = 4,
    direction = 'vertical',
    className 
}) => {
    const sizeClasses = {
        1: direction === 'vertical' ? 'h-1' : 'w-1',
        2: direction === 'vertical' ? 'h-2' : 'w-2',
        3: direction === 'vertical' ? 'h-3' : 'w-3',
        4: direction === 'vertical' ? 'h-4' : 'w-4',
        5: direction === 'vertical' ? 'h-5' : 'w-5',
        6: direction === 'vertical' ? 'h-6' : 'w-6',
        8: direction === 'vertical' ? 'h-8' : 'w-8',
        10: direction === 'vertical' ? 'h-10' : 'w-10',
        12: direction === 'vertical' ? 'h-12' : 'w-12',
        16: direction === 'vertical' ? 'h-16' : 'w-16',
        20: direction === 'vertical' ? 'h-20' : 'w-20',
        24: direction === 'vertical' ? 'h-24' : 'w-24'
    };

    return <div className={cn(sizeClasses[size], className)} />;
};

Spacer.displayName = 'Spacer';
export default Spacer;
