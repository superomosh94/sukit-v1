import React from 'react';
import { cn } from '../../../utils/cn';

export const Container = ({
    maxWidth = 1200,
    padding = 16,
    centered = true,
    children,
    className
}) => {
    return (
        <div
            className={cn(
                centered && 'mx-auto',
                className
            )}
            style={{
                maxWidth: maxWidth === 'full' ? '100%' : `${maxWidth}px`,
                padding: typeof padding === 'number' ? `${padding}px` : padding,
            }}
        >
            {children}
        </div>
    );
};

Container.displayName = 'Container';
export default Container;
