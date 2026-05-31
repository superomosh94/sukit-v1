import React from 'react';
import { cn } from '../../../utils/cn';

export const Flexbox = ({ 
    direction = 'row',
    justify = 'start',
    align = 'stretch',
    wrap = 'nowrap',
    gap = 4,
    children,
    className 
}) => {
    const directionClasses = {
        row: 'flex-row',
        column: 'flex-col',
        'row-reverse': 'flex-row-reverse',
        'column-reverse': 'flex-col-reverse'
    };

    const justifyClasses = {
        start: 'justify-start',
        end: 'justify-end',
        center: 'justify-center',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly'
    };

    const alignClasses = {
        start: 'items-start',
        end: 'items-end',
        center: 'items-center',
        baseline: 'items-baseline',
        stretch: 'items-stretch'
    };

    const wrapClasses = {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse'
    };

    const gapClasses = {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8'
    };

    return (
        <div className={cn(
            'flex',
            directionClasses[direction],
            justifyClasses[justify],
            alignClasses[align],
            wrapClasses[wrap],
            gapClasses[gap],
            className
        )}>
            {children}
        </div>
    );
};

Flexbox.displayName = 'Flexbox';
export default Flexbox;
