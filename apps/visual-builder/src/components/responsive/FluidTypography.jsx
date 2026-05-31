import React from 'react';
import { cn } from '../../utils/cn';

export const FluidTypography = ({ 
    children,
    as: Component = 'p',
    minSize = 14,
    maxSize = 18,
    minScreen = 320,
    maxScreen = 1920,
    className,
    ...props 
}) => {
    const fluidSize = `clamp(${minSize}px, ${minSize}px + (${maxSize - minSize}) * ((100vw - ${minScreen}px) / (${maxScreen} - ${minScreen})), ${maxSize}px)`;
    
    return (
        <Component 
            className={className}
            style={{ fontSize: fluidSize }}
            {...props}
        >
            {children}
        </Component>
    );
};

export const FluidHeading = ({ 
    level = 'h1',
    children,
    className,
    ...props 
}) => {
    const sizes = {
        h1: { min: 32, max: 64 },
        h2: { min: 28, max: 48 },
        h3: { min: 24, max: 36 },
        h4: { min: 20, max: 28 },
        h5: { min: 18, max: 24 },
        h6: { min: 16, max: 20 },
    };
    
    const { min, max } = sizes[level];
    const fluidSize = `clamp(${min}px, ${min}px + (${max - min}) * ((100vw - 320px) / (1920 - 320)), ${max}px)`;
    
    const Component = level;
    
    return (
        <Component 
            className={cn('font-bold', className)}
            style={{ fontSize: fluidSize }}
            {...props}
        >
            {children}
        </Component>
    );
};

export default FluidTypography;