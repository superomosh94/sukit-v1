import React from 'react';
import { cn } from '../../../utils/cn';

export const Row = ({
    gap = 4,
    justify = 'start',
    align = 'stretch',
    wrap = true,
    children,
    className
}) => {
    const gapMap = {
        0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3',
        4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10'
    };

    const justifyMap = {
        start: 'justify-start', end: 'justify-end',
        center: 'justify-center', between: 'justify-between',
        around: 'justify-around', evenly: 'justify-evenly'
    };

    const alignMap = {
        start: 'items-start', end: 'items-end',
        center: 'items-center', baseline: 'items-baseline', stretch: 'items-stretch'
    };

    return (
        <div className={cn(
            'flex flex-col md:flex-row',
            gapMap[gap] || 'gap-4',
            justifyMap[justify],
            alignMap[align],
            wrap && 'flex-wrap',
            className
        )}>
            {children}
        </div>
    );
};

Row.displayName = 'Row';
export default Row;
