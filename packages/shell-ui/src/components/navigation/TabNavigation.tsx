'use client';

import React, { type ReactNode } from 'react';

export interface TabNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    content: ReactNode;
    icon?: ReactNode;
  }>;
  defaultTab?: string;
  onChange?: (tab: string) => void;
}

export function TabNavigation({
  tabs,
  defaultTab,
  onChange,
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              onChange?.(tab.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
