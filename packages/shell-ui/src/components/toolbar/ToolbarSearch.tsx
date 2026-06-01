'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

export interface ToolbarSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  value?: string;
}

export function ToolbarSearch({
  placeholder = 'Search...',
  onSearch,
  value: externalValue,
}: ToolbarSearchProps) {
  const [internalValue, setInternalValue] = useState('');
  const value = externalValue !== undefined ? externalValue : internalValue;

  return (
    <div className="relative flex items-center">
      <Search size={14} className="absolute left-2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setInternalValue(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder={placeholder}
        className="w-40 pl-7 pr-2 py-1 text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}
