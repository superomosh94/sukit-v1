import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { cn } from '../../utils/cn';

export const StackOnMobile = ({ 
    children, 
    direction = 'row',
    gap = 4,
    className,
    reverseOnMobile = false 
}) => {
    const { isMobile } = useResponsive();
    
    const gapClasses = {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
    };

    return (
        <div className={cn(
            'flex',
            isMobile ? 'flex-col' : `flex-${direction}`,
            isMobile && reverseOnMobile && 'flex-col-reverse',
            gapClasses[gap],
            className
        )}>
            {children}
        </div>
    );
};

export default StackOnMobile;