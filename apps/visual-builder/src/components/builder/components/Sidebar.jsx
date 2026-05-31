import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Sidebar = ({ 
    position = 'left',
    width = 80,
    collapsible = true,
    defaultCollapsed = false,
    children,
    className 
}) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    const widthClasses = {
        64: 'w-64',
        80: 'w-80',
        96: 'w-96'
    };

    return (
        <div className={cn(
            'relative bg-surface border-r border-border transition-all duration-300',
            collapsed ? 'w-16' : widthClasses[width] || 'w-80',
            position === 'right' && 'border-l border-r-0',
            className
        )}>
            {/* Sidebar Content */}
            <div className={cn('h-full overflow-y-auto', collapsed ? 'p-2' : 'p-4')}>
                {collapsed ? (
                    <div className="flex flex-col items-center space-y-4">
                        {React.Children.map(children, (child) => (
                            <div className="transform scale-75">{child}</div>
                        ))}
                    </div>
                ) : (
                    children
                )}
            </div>

            {/* Collapse Button */}
            {collapsible && (
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        'absolute top-1/2 -translate-y-1/2 p-1 bg-surface border border-border rounded-full hover:bg-surface-light transition-colors',
                        position === 'left' ? '-right-3' : '-left-3'
                    )}
                >
                    {position === 'left' ? (
                        collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
                    ) : (
                        collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    )}
                </button>
            )}
        </div>
    );
};

Sidebar.displayName = 'Sidebar';
export default Sidebar;
