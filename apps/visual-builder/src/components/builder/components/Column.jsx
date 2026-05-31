import React from 'react';
import { cn } from '../../../utils/cn';

export const Column = ({
    span = 12,
    offset,
    children,
    className
}) => {
    const spanMap = {
        1: 'w-1/12', 2: 'w-2/12', 3: 'w-3/12', 4: 'w-4/12',
        5: 'w-5/12', 6: 'w-6/12', 7: 'w-7/12', 8: 'w-8/12',
        9: 'w-9/12', 10: 'w-10/12', 11: 'w-11/12', 12: 'w-full'
    };

    const offsetMap = {
        1: 'ml-1/12', 2: 'ml-2/12', 3: 'ml-3/12', 4: 'ml-4/12',
        5: 'ml-5/12', 6: 'ml-6/12', 7: 'ml-7/12', 8: 'ml-8/12',
        9: 'ml-9/12', 10: 'ml-10/12', 11: 'ml-11/12'
    };

    const mobileSpan = Math.min(12, Math.max(1, Math.floor(span / 2)));

    return (
        <div className={cn(
            'px-2',
            spanMap[mobileSpan] || 'w-full',
            `md:${spanMap[span] || 'w-full'}`,
            offset && `md:${offsetMap[offset]}`,
            className
        )}>
            {children}
        </div>
    );
};

Column.displayName = 'Column';
export default Column;
