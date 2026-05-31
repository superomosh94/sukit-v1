import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * ComponentSearch provides a search input that notifies parent via onSearch.
 */
const ComponentSearch = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (onSearch) onSearch(value);
  };

  const clearSearch = () => {
    setSearchText('');
    if (onSearch) onSearch('');
  };

  return (
    <div className={cn('relative flex items-center w-full max-w-md', 'mb-4')}>
      <input
        type="text"
        placeholder="Search components..."
        value={searchText}
        onChange={handleChange}
        className={cn(
          'w-full border border-border rounded pl-10 pr-4 py-2',
          'bg-surface text-text-primary placeholder:text-text-secondary',
          'focus:outline-none focus:border-primary-500'
        )}
      />
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      {searchText && (
        <button
          type="button"
          onClick={clearSearch}
          className={cn('absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-500')}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ComponentSearch;
