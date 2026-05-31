import React from 'react';
import { Tag } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const TagCloud = ({ 
    tags = [], 
    minSize = 12,
    maxSize = 32,
    showCount = true,
    onTagClick,
    className 
}) => {
    if (tags.length === 0) {
        return (
            <div className="text-center py-8 text-text-secondary">
                <Tag className="w-12 h-12 mx-auto mb-3" />
                <p>No tags available</p>
            </div>
        );
    }

    // Calculate font sizes based on count
    const maxCount = Math.max(...tags.map(t => t.count || 1));
    const minCount = Math.min(...tags.map(t => t.count || 1));
    
    const getFontSize = (count) => {
        if (maxCount === minCount) return (minSize + maxSize) / 2;
        const ratio = (count - minCount) / (maxCount - minCount);
        return minSize + ratio * (maxSize - minSize);
    };

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {tags.map((tag, idx) => (
                <button
                    key={idx}
                    onClick={() => onTagClick?.(tag.name)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-surface border border-border rounded-full hover:border-primary-500 hover:text-primary-500 transition-all"
                    style={{ fontSize: `${getFontSize(tag.count || 1)}px` }}
                >
                    <span>#{tag.name}</span>
                    {showCount && (
                        <span className="text-xs text-text-secondary">({tag.count || 0})</span>
                    )}
                </button>
            ))}
        </div>
    );
};

TagCloud.displayName = 'TagCloud';
export default TagCloud;