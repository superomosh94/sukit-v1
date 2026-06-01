'use client';

import React, { type ReactNode } from 'react';

export interface SidebarTabsProps {
  tabs: Array<{ id: string; label: string; icon?: ReactNode }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SidebarTabs({
  tabs,
  activeTab,
  onTabChange,
}: SidebarTabsProps) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-1.5 flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
