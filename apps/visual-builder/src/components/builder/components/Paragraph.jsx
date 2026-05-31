import React from 'react';
import { cn } from '../../../utils/cn';

export const Paragraph = ({
    text = 'Paragraph text goes here.',
    fontSize,
    lineHeight = 1.6,
    color,
    align = 'left',
    maxWidth,
    className
}) => {
    return (
        <p
            className={cn(
                {
                    'text-left': align === 'left',
                    'text-center': align === 'center',
                    'text-right': align === 'right',
                },
                className
            )}
            style={{
                fontSize: fontSize ? `${fontSize}px` : undefined,
                lineHeight,
                color: color || undefined,
                maxWidth: maxWidth ? `${maxWidth}px` : undefined,
            }}
        >
            {text}
        </p>
    );
};

Paragraph.displayName = 'Paragraph';
export default Paragraph;
