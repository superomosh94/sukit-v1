import React from 'react';
import { cn } from '../../../utils/cn';

const headingStyles = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium',
};

export const Heading = ({
    level = 'h1',
    text = 'Heading',
    fontSize,
    fontWeight,
    color,
    align = 'left',
    fontFamily,
    className
}) => {
    const Tag = level;
    return (
        <Tag
            className={cn(
                headingStyles[level],
                {
                    'text-left': align === 'left',
                    'text-center': align === 'center',
                    'text-right': align === 'right',
                },
                className
            )}
            style={{
                fontSize: fontSize ? `${fontSize}px` : undefined,
                fontWeight,
                color: color || undefined,
                fontFamily,
            }}
        >
            {text}
        </Tag>
    );
};

Heading.displayName = 'Heading';
export default Heading;
