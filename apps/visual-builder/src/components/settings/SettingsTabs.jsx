// src/components/settings/SettingsTabs.jsx
import React from 'react';
import { Globe, Sliders, Search, Gauge, Users, Plug, Shield } from 'lucide-react';
import Button from '../shared/Button';

export const SettingsTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'editor', label: 'Editor', icon: Sliders },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'performance', label: 'Performance', icon: Gauge },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'security', label: 'Security', icon: Shield },
  ];
  return (
    <div className="flex gap-1 p-1 bg-surface border border-border rounded-lg overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary-500 text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'}`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default SettingsTabs;
