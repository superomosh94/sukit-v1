import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  MoreHorizontal,
  Trash,
  Copy,
  Archive,
} from 'lucide-react';

export interface BulkSelectProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  onBulkAction: (action: string, selectedIds: string[]) => void;
  children: (props: {
    selectedIds: Set<string>;
    isSelected: (item: T) => boolean;
    toggle: (item: T) => void;
    selectAll: () => void;
    deselectAll: () => void;
    isAllSelected: boolean;
  }) => React.ReactNode;
}

export function BulkSelect<T>({
  items,
  keyExtractor,
  onBulkAction,
  children,
}: BulkSelectProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (item: T) => {
    const id = keyExtractor(item);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(items.map(keyExtractor)));
  const deselectAll = () => setSelectedIds(new Set());
  const isAllSelected = items.length > 0 && selectedIds.size === items.length;

  return (
    <div>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-border">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => {
                onBulkAction('delete', Array.from(selectedIds));
                deselectAll();
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md hover:bg-red-500/10 text-red-500"
            >
              <Trash size={12} /> Delete
            </button>
            <button
              onClick={() => {
                onBulkAction('duplicate', Array.from(selectedIds));
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md hover:bg-accent"
            >
              <Copy size={12} /> Duplicate
            </button>
            <button
              onClick={() => {
                onBulkAction('archive', Array.from(selectedIds));
                deselectAll();
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md hover:bg-accent"
            >
              <Archive size={12} /> Archive
            </button>
            <button
              onClick={deselectAll}
              className="px-2 py-1 text-xs rounded-md hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {children({
        selectedIds,
        isSelected: (item) => selectedIds.has(keyExtractor(item)),
        toggle,
        selectAll,
        deselectAll,
        isAllSelected,
      })}
    </div>
  );
}
