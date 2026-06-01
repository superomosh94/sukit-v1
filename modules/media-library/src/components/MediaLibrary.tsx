'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Upload,
  Search,
  Grid3X3,
  List,
  FolderClosed,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Image,
  Video,
  FileText,
  Star,
  Trash2,
  Download,
  X,
  Check,
  ArrowUpDown,
  Filter,
  Tag,
  Sliders,
  Trash as TrashIcon,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import {
  formatFileSize,
  formatDimensions,
  getFileTypeIcon,
} from '../utils/fileUtils';
import type { MediaAsset, MediaFolder } from '../types';

import { FolderTree } from './FolderTree';
import { MediaGrid } from './MediaGrid';
import { MediaList } from './MediaList';
import { MediaDetails } from './MediaDetails';
import { UploadButton } from './UploadButton';
import { UploadDialog } from './UploadDialog';
import { ImageEditor } from './ImageEditor';
import { TagManager } from './TagManager';
import { TrashView } from './TrashView';

type ViewSection = 'library' | 'trash';

export function MediaLibrary() {
  const {
    assets,
    viewMode,
    selectedIds,
    filters,
    sortBy,
    sortOrder,
    isLoading,
    error,
    currentFolder,
    currentAsset,
    tags,
    loadAssets,
    loadFolders,
    loadTags,
    setCurrentFolder,
    setViewMode,
    setFilterType,
    setSortBy,
    toggleSortOrder,
    toggleSelection,
    selectAll,
    clearSelection,
    invertSelection,
    searchAssets,
    clearFilters,
    bulkDelete,
    bulkDownload,
    setCurrentAsset,
    clearError,
  } = useMediaStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [viewSection, setViewSection] = useState<ViewSection>('library');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadFolders();
    loadTags();
    loadAssets();
  }, [loadFolders, loadTags, loadAssets]);

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => searchAssets(q), 300);
    },
    [searchAssets]
  );

  const sortedAssets = [...assets].sort((a, b) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'name':
        return a.filename.localeCompare(b.filename) * dir;
      case 'size':
        return (a.size - b.size) * dir;
      default:
        return (
          (new Date(a.uploadedAt).getTime() -
            new Date(b.uploadedAt).getTime()) *
          dir
        );
    }
  });

  const filteredAssets = sortedAssets.filter((a) => {
    if (filters.type !== 'all') {
      if (filters.type === 'image' && !a.mimeType.startsWith('image/'))
        return false;
      if (filters.type === 'video' && !a.mimeType.startsWith('video/'))
        return false;
      if (
        filters.type === 'document' &&
        (a.mimeType.startsWith('image/') || a.mimeType.startsWith('video/'))
      )
        return false;
    }
    if (tagFilter && !a.tags.includes(tagFilter)) return false;
    return true;
  });

  const pendingUploads = useMediaStore((s) => s.uploadQueue).filter(
    (u) => u.status === 'pending' || u.status === 'uploading'
  );

  return (
    <div className="flex h-full">
      {/* Left sidebar - FolderTree */}
      <div className="w-56 shrink-0 border-r bg-muted/30 flex flex-col">
        <FolderTree />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <div className="flex items-center gap-1 rounded-md border text-xs">
            <button
              onClick={() => setViewSection('library')}
              className={cn(
                'rounded-l-md px-2.5 py-1.5 font-medium transition-colors',
                viewSection === 'library' ? 'bg-accent' : 'hover:bg-accent'
              )}
            >
              Library
            </button>
            <button
              onClick={() => {
                setViewSection('trash');
                useMediaStore.getState().loadTrash();
              }}
              className={cn(
                'rounded-r-md px-2.5 py-1.5 font-medium transition-colors',
                viewSection === 'trash' ? 'bg-accent' : 'hover:bg-accent'
              )}
            >
              <span className="flex items-center gap-1">
                <TrashIcon className="size-3" />
                Trash
              </span>
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) =>
                handleSearch((e.target as HTMLInputElement).value)
              }
              placeholder="Search media..."
              className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-none"
            />
          </div>

          <UploadButton onClick={() => setShowUpload(true)} />

          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-l-md p-1.5',
                viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent'
              )}
            >
              <Grid3X3 className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-r-md p-1.5',
                viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent'
              )}
            >
              <List className="size-3.5" />
            </button>
          </div>

          <button
            onClick={toggleSortOrder}
            className="rounded p-1.5 hover:bg-accent"
            title={`Sort by ${sortBy} ${sortOrder}`}
          >
            <ArrowUpDown className="size-3.5" />
          </button>

          <button
            onClick={() => setShowTagManager(true)}
            className="rounded p-1.5 text-muted-foreground hover:text-foreground"
            title="Manage tags"
          >
            <Tag className="size-3.5" />
          </button>
        </div>

        {/* Filter chips + sort by */}
        <div className="flex items-center gap-2 border-b px-4 py-1.5">
          <div className="flex items-center gap-1">
            {(['all', 'image', 'video', 'document'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'rounded-md px-2.5 py-0.5 text-[10px] font-medium transition-colors',
                  filters.type === type
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-muted-foreground">|</span>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  (e.target as HTMLSelectElement).value as
                    | 'name'
                    | 'date'
                    | 'size'
                )
              }
              className="h-6 rounded border bg-background px-1.5 text-[10px] outline-none"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
          </div>

          {tagFilter && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
              Tag: {tagFilter}
              <button onClick={() => setTagFilter(null)}>
                <X className="size-2.5" />
              </button>
            </span>
          )}

          <div className="ml-auto flex items-center gap-1">
            {selectedIds.length > 0 && (
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {selectedIds.length} selected
              </span>
            )}
            {(filters.type !== 'all' || searchQuery || tagFilter) && (
              <button
                onClick={() => {
                  clearFilters();
                  setTagFilter(null);
                  setSearchQuery('');
                }}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-1.5">
            <button
              onClick={clearSelection}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              Clear ({selectedIds.length})
            </button>
            <span className="text-[10px] text-muted-foreground">|</span>
            <button
              onClick={selectAll}
              className="text-[10px] hover:text-foreground"
            >
              Select All
            </button>
            <button
              onClick={invertSelection}
              className="text-[10px] hover:text-foreground"
            >
              Invert
            </button>
            <span className="flex-1" />
            <button
              onClick={() => bulkDelete(selectedIds)}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3" /> Delete
            </button>
            <button
              onClick={async () => {
                const blob = await bulkDownload(selectedIds);
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'media-bulk-download.zip';
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] hover:bg-accent"
            >
              <Download className="size-3" /> Download
            </button>
          </div>
        )}

        {/* Upload queue */}
        {pendingUploads.length > 0 && (
          <div className="border-b bg-blue-500/5 px-4 py-2">
            {pendingUploads.map((u) => (
              <div key={u.fileId} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground truncate">
                  {u.filename}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${u.percentage}%` }}
                  />
                </div>
                <span className="tabular-nums text-muted-foreground shrink-0">
                  {u.percentage}%
                </span>
                {u.status === 'uploading' && (
                  <button
                    onClick={() =>
                      useMediaStore.getState().cancelUpload(u.fileId)
                    }
                    className="text-destructive hover:underline text-[10px] shrink-0"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between border-b border-destructive/30 bg-destructive/5 px-4 py-2">
            <span className="text-xs text-destructive">{error}</span>
            <button
              onClick={clearError}
              className="rounded p-0.5 text-destructive hover:bg-destructive/10"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {viewSection === 'trash' ? (
              <TrashView />
            ) : isLoading && assets.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredAssets.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Image className="mb-3 size-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">
                  No media found
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {searchQuery || tagFilter
                    ? 'Try a different search term or filter'
                    : 'Upload your first file to get started'}
                </p>
                {!searchQuery && !tagFilter && (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    <Upload className="size-4" />
                    Upload Files
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <MediaGrid assets={filteredAssets} />
            ) : (
              <MediaList assets={filteredAssets} />
            )}

            {/* Loading overlay for paginated loads */}
            {isLoading && assets.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>

          {/* Right sidebar - MediaDetails */}
          {currentAsset && viewSection === 'library' && (
            <div className="w-72 shrink-0 border-l bg-card overflow-y-auto">
              <MediaDetails />
            </div>
          )}
        </div>
      </div>

      {/* Upload dialog */}
      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}

      {/* Image editor */}
      {editingAssetId && (
        <ImageEditor
          assetId={editingAssetId}
          onClose={() => setEditingAssetId(null)}
        />
      )}

      {/* Tag manager */}
      {showTagManager && (
        <TagManager
          onClose={() => setShowTagManager(false)}
          selectedTag={tagFilter}
          onTagSelect={(name) => setTagFilter(name)}
        />
      )}
    </div>
  );
}
