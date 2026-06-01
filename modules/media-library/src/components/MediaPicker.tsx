'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Image,
  Video,
  FileText,
  FolderClosed,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Loader2,
  Check,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import { formatFileSize, formatDimensions } from '../utils/fileUtils';
import type { MediaAsset, FileTypeFilter, MediaFolder } from '../types';

interface MediaPickerProps {
  open: boolean;
  multiple?: boolean;
  fileTypes?: ('image' | 'video' | 'document')[];
  onSelect: (assets: MediaAsset | MediaAsset[]) => void;
  onCancel: () => void;
}

type PickerTab = FileTypeFilter;

const TAB_ICONS: Record<PickerTab, typeof Image> = {
  all: Image,
  image: Image,
  video: Video,
  document: FileText,
};

const TAB_LABELS: Record<PickerTab, string> = {
  all: 'All',
  image: 'Images',
  video: 'Videos',
  document: 'Documents',
};

function FolderNode({
  folder,
  depth,
  selectedId,
  onSelect,
}: {
  folder: MediaFolder;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onSelect(folder.id);
        }}
        className={cn(
          'flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-xs transition-colors',
          isSelected
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-accent text-foreground'
        )}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="size-3 shrink-0" />
          ) : (
            <ChevronRight className="size-3 shrink-0" />
          )
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {isSelected ? (
          <FolderOpen className="size-3.5 shrink-0" />
        ) : (
          <FolderClosed className="size-3.5 shrink-0" />
        )}
        <span className="truncate">{folder.name}</span>
      </button>
      {expanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/3] rounded-md bg-muted" />
          <div className="mt-1.5 h-3 w-3/4 rounded bg-muted" />
          <div className="mt-1 h-2 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function MediaPicker({
  open,
  multiple = false,
  fileTypes,
  onSelect,
  onCancel,
}: MediaPickerProps) {
  const {
    assets,
    isLoading,
    folders,
    loadAssets,
    loadFolders,
    setCurrentFolder,
    currentFolder,
  } = useMediaStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<PickerTab>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadAssets(folderFilter ?? undefined);
      loadFolders();
      setSelectedIds(new Set());
      setSearchQuery('');
      setActiveTab('all');
      setLoadedImages(new Set());
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  const filteredAssets = useMemo(() => {
    let result = assets;

    const typeFilter = fileTypes?.[0] ?? activeTab;
    if (typeFilter !== 'all') {
      result = result.filter((a) => {
        if (typeFilter === 'image') return a.mimeType.startsWith('image/');
        if (typeFilter === 'video') return a.mimeType.startsWith('video/');
        if (typeFilter === 'document')
          return (
            a.mimeType.includes('pdf') ||
            a.mimeType.includes('document') ||
            a.mimeType.includes('sheet')
          );
        return true;
      });
    }

    if (fileTypes && fileTypes.length > 0) {
      result = result.filter((a) => {
        const isImage = a.mimeType.startsWith('image/');
        const isVideo = a.mimeType.startsWith('video/');
        const isDocument =
          a.mimeType.includes('pdf') ||
          a.mimeType.includes('document') ||
          a.mimeType.includes('sheet');
        return (
          (fileTypes.includes('image') && isImage) ||
          (fileTypes.includes('video') && isVideo) ||
          (fileTypes.includes('document') && isDocument)
        );
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.filename.toLowerCase().includes(q) ||
          a.alt?.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (folderFilter) {
      result = result.filter((a) => a.folderId === folderFilter);
    }

    return result;
  }, [assets, activeTab, searchQuery, folderFilter, fileTypes]);

  const recentUploads = useMemo(() => {
    return [...assets]
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
      .slice(0, 10);
  }, [assets]);

  const handleToggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!multiple) {
            next.clear();
          }
          next.add(id);
        }
        return next;
      });
    },
    [multiple]
  );

  const handleInsert = useCallback(() => {
    const ids = Array.from(selectedIds);
    const selected = assets.filter((a) => ids.includes(a.id));
    if (multiple) {
      onSelect(selected);
    } else {
      onSelect(selected[0]);
    }
  }, [selectedIds, assets, multiple, onSelect]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, asset: MediaAsset) => {
      e.dataTransfer.setData('text/plain', JSON.stringify(asset));
      e.dataTransfer.effectAllowed = 'copy';
      const store = useMediaStore.getState();
      store.onDragStart(asset);
    },
    []
  );

  const handleFolderSelect = useCallback(
    (id: string | null) => {
      setFolderFilter(id);
      setCurrentFolder(id);
    },
    [setCurrentFolder]
  );

  if (!open) return null;

  const hasSelection = selectedIds.size > 0;
  const showRecentUploads =
    recentUploads.length > 0 &&
    !searchQuery &&
    activeTab === 'all' &&
    !folderFilter;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="flex h-[600px] w-[720px] flex-col rounded-lg border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Select Media</h2>
          <button
            onClick={onCancel}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search + Folder sidebar toggle */}
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media..."
              className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* File type tabs */}
        <div className="flex gap-0.5 border-b px-4 py-1.5">
          {(['all', 'image', 'video', 'document'] as const).map((tab) => {
            const Icon = TAB_ICONS[tab];
            const isDisabled =
              fileTypes &&
              fileTypes.length > 0 &&
              tab !== 'all' &&
              !(fileTypes as readonly string[]).includes(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={isDisabled}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                  isDisabled && 'opacity-30 cursor-not-allowed'
                )}
              >
                <Icon className="size-3.5" />
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </div>

        {/* Body: folder sidebar + grid */}
        <div className="flex flex-1 overflow-hidden">
          {/* Folder sidebar */}
          <div className="w-44 shrink-0 overflow-y-auto border-r p-2">
            <button
              onClick={() => handleFolderSelect(null)}
              className={cn(
                'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors',
                !folderFilter
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent text-foreground'
              )}
            >
              <Image className="size-3.5 shrink-0" />
              <span className="truncate">All Media</span>
            </button>
            {folders
              .filter((f) => !f.parentId)
              .map((folder) => (
                <FolderNode
                  key={folder.id}
                  folder={folder}
                  depth={0}
                  selectedId={folderFilter}
                  onSelect={handleFolderSelect}
                />
              ))}
            {folders.length === 0 && (
              <p className="px-2 pt-3 text-[10px] text-muted-foreground">
                No folders
              </p>
            )}
          </div>

          {/* Grid area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {isLoading ? (
              <div className="flex-1 overflow-y-auto p-4">
                <SkeletonGrid />
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <Image className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No media found
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Upload media to get started'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                {/* Recent uploads */}
                {showRecentUploads && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Recent Uploads
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {recentUploads.map((asset) => {
                        const isImage = asset.mimeType.startsWith('image/');
                        return (
                          <button
                            key={asset.id}
                            onClick={() => handleToggle(asset.id)}
                            className={cn(
                              'group relative overflow-hidden rounded-md border transition-all',
                              selectedIds.has(asset.id)
                                ? 'ring-2 ring-primary ring-offset-1'
                                : 'hover:ring-1 hover:ring-primary/50'
                            )}
                          >
                            <div className="aspect-[4/3] bg-muted">
                              {isImage ? (
                                <img
                                  src={
                                    asset.thumbnailUrl ??
                                    asset.url ??
                                    '/placeholder.svg'
                                  }
                                  alt={asset.alt ?? asset.filename}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <FileText className="size-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            {selectedIds.has(asset.id) && (
                              <div className="absolute right-1 top-1 rounded-full bg-primary p-0.5">
                                <Check className="size-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All results */}
                <div>
                  {showRecentUploads && filteredAssets.length > 0 && (
                    <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      All Media
                    </h3>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    {filteredAssets.map((asset) => {
                      const isImage = asset.mimeType.startsWith('image/');
                      const isVideo = asset.mimeType.startsWith('video/');
                      const isSelected = selectedIds.has(asset.id);
                      const isLoaded = loadedImages.has(asset.id);

                      return (
                        <div
                          key={asset.id}
                          onClick={() => handleToggle(asset.id)}
                          onDragStart={(e) => handleDragStart(e, asset)}
                          draggable
                          className={cn(
                            'group relative cursor-pointer overflow-hidden rounded-md border bg-card transition-all',
                            isSelected
                              ? 'ring-2 ring-primary ring-offset-1'
                              : 'hover:shadow-md'
                          )}
                        >
                          <div className="aspect-[4/3] bg-muted">
                            {isImage ? (
                              <>
                                {!isLoaded && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-4 animate-pulse rounded bg-muted-foreground/10" />
                                  </div>
                                )}
                                <img
                                  src={
                                    asset.thumbnailUrl ??
                                    asset.url ??
                                    '/placeholder.svg'
                                  }
                                  alt={asset.alt ?? asset.filename}
                                  className={cn(
                                    'h-full w-full object-cover transition-opacity',
                                    isLoaded ? 'opacity-100' : 'opacity-0'
                                  )}
                                  loading="lazy"
                                  onLoad={() =>
                                    setLoadedImages((prev) =>
                                      new Set(prev).add(asset.id)
                                    )
                                  }
                                />
                              </>
                            ) : isVideo ? (
                              <div className="flex h-full items-center justify-center">
                                <Video className="size-6 text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <FileText className="size-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-5">
                            <p className="truncate text-[10px] font-medium text-white">
                              {asset.filename}
                            </p>
                            <p className="text-[8px] text-white/70">
                              {formatFileSize(asset.size)}
                              {asset.width &&
                                ` · ${formatDimensions(asset.width, asset.height)}`}
                            </p>
                          </div>

                          {multiple && (
                            <div className="absolute left-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="size-3.5 rounded border-white/50"
                              />
                            </div>
                          )}

                          {isSelected && !multiple && (
                            <div className="absolute right-1.5 top-1.5 rounded-full bg-primary p-0.5">
                              <Check className="size-2.5 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2.5">
          <span className="text-xs text-muted-foreground">
            {hasSelection
              ? `${selectedIds.size} file${selectedIds.size > 1 ? 's' : ''} selected`
              : 'Select media to insert'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!hasSelection}
              className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
