'use client';

import { useState, useCallback } from 'react';
import {
  Star,
  Video,
  FileText,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  File,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import {
  formatFileSize,
  formatDimensions,
  getFileTypeLabel,
} from '../utils/fileUtils';
import type { MediaAsset, SortField } from '../types';

interface MediaListProps {
  assets: MediaAsset[];
}

const columns: {
  key: string;
  label: string;
  sortable: boolean;
  sortField?: SortField;
  align?: string;
}[] = [
  { key: 'checkbox', label: '', sortable: false },
  { key: 'filename', label: 'Name', sortable: true, sortField: 'name' },
  {
    key: 'size',
    label: 'Size',
    sortable: true,
    sortField: 'size',
    align: 'right',
  },
  { key: 'dimensions', label: 'Dimensions', sortable: false, align: 'right' },
  { key: 'type', label: 'Type', sortable: false, align: 'center' },
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    sortField: 'date',
    align: 'right',
  },
  { key: 'tags', label: 'Tags', sortable: false },
  { key: 'favorite', label: '', sortable: false, align: 'center' },
];

export function MediaList({ assets }: MediaListProps) {
  const {
    selectedIds,
    toggleSelection,
    setCurrentAsset,
    toggleFavorite,
    sortBy,
    sortOrder,
    setSortBy,
    toggleSortOrder,
  } = useMediaStore();

  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const handleRowClick = useCallback(
    (asset: MediaAsset, index: number, e: React.MouseEvent) => {
      if (e.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, index);
        const end = Math.max(lastClickedIndex, index);
        for (let i = start; i <= end; i++) {
          if (!selectedIds.includes(assets[i].id)) {
            toggleSelection(assets[i].id);
          }
        }
      } else {
        setCurrentAsset(asset.id);
      }
      setLastClickedIndex(index);
    },
    [lastClickedIndex, selectedIds, assets, toggleSelection, setCurrentAsset]
  );

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortBy === field) {
        toggleSortOrder();
      } else {
        setSortBy(field);
      }
    },
    [sortBy, setSortBy, toggleSortOrder]
  );

  const renderSortIcon = (field?: SortField) => {
    if (!field || sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="size-3" />
    ) : (
      <ChevronDown className="size-3" />
    );
  };

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">
          No media found
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Upload your first file to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="flex items-center gap-2 border-b pb-2 text-[10px] font-medium uppercase text-muted-foreground">
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn(
                'flex items-center gap-0.5',
                col.key === 'checkbox' && 'w-6 shrink-0 justify-center',
                col.key === 'filename' && 'flex-1 min-w-0',
                col.key === 'size' && 'w-20 shrink-0 justify-end',
                col.key === 'dimensions' && 'w-24 shrink-0 justify-end',
                col.key === 'type' && 'w-16 shrink-0 justify-center',
                col.key === 'date' && 'w-20 shrink-0 justify-end',
                col.key === 'tags' && 'w-32 shrink-0',
                col.key === 'favorite' && 'w-8 shrink-0 justify-center',
                col.sortable && 'cursor-pointer hover:text-foreground'
              )}
              onClick={() => col.sortField && handleSort(col.sortField)}
            >
              {col.label}
              {renderSortIcon(col.sortField)}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y">
          {assets.map((asset, index) => {
            const isSelected = selectedIds.includes(asset.id);
            const isImage = asset.mimeType.startsWith('image/');
            const isVideo = asset.mimeType.startsWith('video/');

            return (
              <div
                key={asset.id}
                onClick={(e) => handleRowClick(asset, index, e)}
                onDoubleClick={() => setCurrentAsset(asset.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md px-0 py-1.5 text-xs transition-colors hover:bg-accent',
                  isSelected && 'bg-accent/50'
                )}
              >
                <div className="flex w-6 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(asset.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="size-3.5"
                  />
                </div>

                <div className="flex flex-1 min-w-0 items-center gap-2">
                  <div className="size-8 shrink-0 overflow-hidden rounded bg-muted">
                    {isImage ? (
                      <img
                        src={asset.thumbnailUrl ?? '/placeholder.svg'}
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    ) : isVideo ? (
                      <div className="flex size-full items-center justify-center">
                        <Video className="size-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="truncate font-medium">{asset.filename}</span>
                </div>

                <div className="w-20 shrink-0 text-right text-muted-foreground tabular-nums">
                  {formatFileSize(asset.size)}
                </div>

                <div className="w-24 shrink-0 text-right text-muted-foreground tabular-nums">
                  {asset.width
                    ? formatDimensions(asset.width, asset.height)
                    : '-'}
                </div>

                <div className="flex w-16 shrink-0 items-center justify-center">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                    {getFileTypeLabel(asset.mimeType)}
                  </span>
                </div>

                <div className="w-20 shrink-0 text-right text-muted-foreground tabular-nums">
                  {new Date(asset.uploadedAt).toLocaleDateString()}
                </div>

                <div className="flex w-32 shrink-0 items-center gap-1 overflow-hidden">
                  {asset.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="truncate rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {asset.tags.length > 3 && (
                    <span className="text-[9px] text-muted-foreground">
                      +{asset.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex w-8 shrink-0 items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(asset.id);
                    }}
                  >
                    <Star
                      className={cn(
                        'size-3',
                        asset.isFavorited
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground hover:text-amber-400'
                      )}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
