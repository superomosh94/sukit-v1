import React, { useState } from 'react';
import { cn } from '../../../utils/cn';

export const Tabs = ({ 
    tabs = [], 
    defaultTab = 0,
    onChange,
    className 
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleTabChange = (index) => {
        setActiveTab(index);
        onChange?.(index);
    };

    return (
        <div className={cn('w-full', className)}>
            {/* Tab Headers */}
            <div className="flex border-b border-border">
                {tabs.map((tab, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleTabChange(idx)}
                        className={cn(
                            'px-4 py-2 text-sm font-medium transition-colors relative',
                            activeTab === idx
                                ? 'text-primary-500'
                                : 'text-text-secondary hover:text-text-primary'
                        )}
                    >
                        {tab.icon && <span className="mr-2">{tab.icon}</span>}
                        {tab.label}
                        {activeTab === idx && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                        )}
                    </button>
                ))}
            </div>
            
            {/* Tab Content */}
            <div className="pt-4">
                {tabs[activeTab]?.content}
            </div>
        </div>
    );
};

Tabs.displayName = 'Tabs';
export default Tabs;