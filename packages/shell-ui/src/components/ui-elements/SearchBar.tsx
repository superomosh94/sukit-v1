'use client';

import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  onClear,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setQuery('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center ${className || ''}`}>
      <Search size={16} className="absolute left-3 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 p-0.5 rounded hover:bg-accent"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
