'use client';

import React, { type ReactNode } from 'react';

export interface ToolbarTabsProps {
  tabs: Array<{ id: string; label: string; icon?: ReactNode }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ToolbarTabs({
  tabs,
  activeTab,
  onTabChange,
}: ToolbarTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
            activeTab === tab.id
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
