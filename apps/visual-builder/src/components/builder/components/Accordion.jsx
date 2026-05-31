import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Accordion = ({ 
    items = [], 
    multiple = false,
    defaultOpen = [],
    className 
}) => {
    const [openItems, setOpenItems] = useState(defaultOpen);

    const toggleItem = (index) => {
        if (multiple) {
            setOpenItems(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            );
        } else {
            setOpenItems(openItems.includes(index) ? [] : [index]);
        }
    };

    return (
        <div className={cn('space-y-2', className)}>
            {items.map((item, idx) => (
                <div key={idx} className="bg-surface border border-border rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleItem(idx)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-light transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {item.icon && <span className="text-primary-500">{item.icon}</span>}
                            <span className="font-medium text-text-primary">{item.title}</span>
                        </div>
                        <ChevronDown className={cn(
                            'w-5 h-5 text-text-secondary transition-transform',
                            openItems.includes(idx) && 'rotate-180'
                        )} />
                    </button>
                    
                    {openItems.includes(idx) && (
                        <div className="p-4 pt-0 border-t border-border">
                            <p className="text-text-secondary">{item.content}</p>
                            {item.children && (
                                <div className="mt-3 pl-4">
                                    <Accordion items={item.children} multiple={multiple} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

Accordion.displayName = 'Accordion';
export default Accordion;