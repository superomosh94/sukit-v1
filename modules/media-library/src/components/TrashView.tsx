'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  FileText,
  FolderOpen,
  Check,
  X,
  Download,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import { formatFileSize, formatDimensions } from '../utils/fileUtils';
import type { MediaAsset } from '../types';

const TRASH_RETENTION_DAYS = 30;

export function TrashView() {
  const {
    trash,
    isLoading,
    loadTrash,
    restoreAsset,
    permanentlyDeleteAsset,
    emptyTrash,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
  } = useMediaStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [restoreToFolder, setRestoreToFolder] = useState<string | null>(null);
  const [showRestoreFolderPicker, setShowRestoreFolderPicker] = useState<
    string | null
  >(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { folders } = useMediaStore();

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const filteredTrash = trash
    .filter((a) =>
      searchQuery
        ? a.filename.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'name':
          return a.filename.localeCompare(b.filename) * dir;
        case 'size':
          return (a.size - b.size) * dir;
        default:
          return (
            (new Date(a.trashedAt ?? a.updatedAt).getTime() -
              new Date(b.trashedAt ?? b.updatedAt).getTime()) *
            dir
          );
      }
    });

  const allSelected =
    selectedIds.length === filteredTrash.length && filteredTrash.length > 0;
  const trashTotalSize = trash.reduce((sum, a) => sum + a.size, 0);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleRestoreWithFolder = useCallback(
    async (assetId: string) => {
      if (restoreToFolder) {
        await useMediaStore.getState().bulkMove([assetId], restoreToFolder);
      }
      await restoreAsset(assetId);
      setRestoreToFolder(null);
    },
    [restoreToFolder, restoreAsset]
  );

  const handleBulkRestore = useCallback(async () => {
    for (const id of selectedIds) {
      await restoreAsset(id);
    }
    clearSelection();
  }, [selectedIds, restoreAsset, clearSelection]);

  const handleBulkPermanentDelete = useCallback(async () => {
    for (const id of selectedIds) {
      await permanentlyDeleteAsset(id);
    }
    clearSelection();
  }, [selectedIds, permanentlyDeleteAsset, clearSelection]);

  const getDaysUntilDelete = (asset: MediaAsset) => {
    if (!asset.trashedAt) return TRASH_RETENTION_DAYS;
    const trashed = new Date(asset.trashedAt).getTime();
    const elapsed = (Date.now() - trashed) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.round(TRASH_RETENTION_DAYS - elapsed));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold">Trash</h2>
          <span className="text-[11px] text-muted-foreground">
            {trash.length} item{trash.length !== 1 ? 's' : ''} ·{' '}
            {formatFileSize(trashTotalSize)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {trash.length > 0 && (
            <button
              onClick={() => setShowEmptyConfirm(true)}
              className="flex items-center gap-1 rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="size-3.5" />
              Empty Trash
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="border-b px-4 py-2">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trash..."
            className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-none"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-1.5">
          <span className="text-[10px] text-muted-foreground">
            {selectedIds.length} selected
          </span>
          <button
            onClick={clearSelection}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
          <span className="text-[10px] text-muted-foreground">|</span>
          <button
            onClick={handleBulkRestore}
            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] hover:bg-accent"
          >
            <RotateCcw className="size-3" /> Restore all
          </button>
          <button
            onClick={handleBulkPermanentDelete}
            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3" /> Delete permanently
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredTrash.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Trash2 className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              {searchQuery ? 'No results in trash' : 'Trash is empty'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {searchQuery
                ? 'Try a different search term'
                : 'Deleted items will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {/* Column headers */}
            <div className="flex items-center gap-3 px-4 py-2 text-[10px] font-medium uppercase text-muted-foreground">
              <div className="w-6 shrink-0">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    allSelected ? clearSelection() : selectAll()
                  }
                  className="size-3"
                />
              </div>
              <div
                className="flex flex-1 min-w-0 cursor-pointer items-center gap-0.5 hover:text-foreground"
                onClick={() => handleSort('name')}
              >
                Name
                {sortField === 'name' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div
                className="w-20 shrink-0 cursor-pointer text-right hover:text-foreground"
                onClick={() => handleSort('size')}
              >
                Size
                {sortField === 'size' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div
                className="w-24 shrink-0 cursor-pointer text-right hover:text-foreground"
                onClick={() => handleSort('date')}
              >
                Trashed
                {sortField === 'date' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div className="w-28 shrink-0 text-right">Expires</div>
              <div className="w-28 shrink-0 text-right">Original folder</div>
              <div className="w-32 shrink-0 text-right">Actions</div>
            </div>

            {filteredTrash.map((asset) => {
              const isImage = asset.mimeType.startsWith('image/');
              const isVideo = asset.mimeType.startsWith('video/');
              const daysLeft = getDaysUntilDelete(asset);

              return (
                <div
                  key={asset.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-xs transition-colors hover:bg-accent/30',
                    selectedIds.includes(asset.id) && 'bg-accent/40'
                  )}
                >
                  <div className="w-6 shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(asset.id)}
                      onChange={() => toggleSelection(asset.id)}
                      className="size-3"
                    />
                  </div>

                  <div className="flex flex-1 min-w-0 items-center gap-2.5">
                    <div className="size-9 shrink-0 overflow-hidden rounded bg-muted">
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
                    <div className="min-w-0">
                      <p className="truncate font-medium">{asset.filename}</p>
                      {asset.width && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatDimensions(asset.width, asset.height)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="w-20 shrink-0 text-right tabular-nums text-muted-foreground">
                    {formatFileSize(asset.size)}
                  </div>

                  <div className="w-24 shrink-0 text-right tabular-nums text-muted-foreground">
                    {asset.trashedAt
                      ? new Date(asset.trashedAt).toLocaleDateString()
                      : '-'}
                  </div>

                  <div className="w-28 shrink-0 text-right">
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        daysLeft <= 3
                          ? 'text-destructive'
                          : daysLeft <= 7
                            ? 'text-amber-500'
                            : 'text-muted-foreground'
                      )}
                    >
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                    </span>
                  </div>

                  <div className="w-28 shrink-0 text-right">
                    {asset.folderId ? (
                      <span className="text-[10px] text-muted-foreground">
                        {folders.find((f) => f.id === asset.folderId)?.name ??
                          'Unknown'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        Root
                      </span>
                    )}
                  </div>

                  <div className="flex w-32 shrink-0 items-center justify-end gap-1">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowRestoreFolderPicker(
                            showRestoreFolderPicker === asset.id
                              ? null
                              : asset.id
                          )
                        }
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                        title="Restore to folder..."
                      >
                        <FolderOpen className="size-3.5" />
                      </button>

                      {showRestoreFolderPicker === asset.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded border bg-card p-1 shadow-lg">
                          <button
                            onClick={async () => {
                              await restoreAsset(asset.id);
                              setShowRestoreFolderPicker(null);
                            }}
                            className="flex w-full items-center gap-2 rounded px-2 py-1 text-[11px] hover:bg-accent"
                          >
                            <RotateCcw className="size-3" />
                            Restore to original
                          </button>
                          {folders.map((f) => (
                            <button
                              key={f.id}
                              onClick={async () => {
                                setRestoreToFolder(f.id);
                                await handleRestoreWithFolder(asset.id);
                                setShowRestoreFolderPicker(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1 text-[11px] hover:bg-accent"
                            >
                              <FolderOpen className="size-3" />
                              {f.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        handleRestoreWithFolder(asset.id);
                      }}
                      className="rounded p-1 text-green-600 hover:bg-green-500/10"
                      title="Restore"
                    >
                      <RotateCcw className="size-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(asset.id)}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                      title="Delete permanently"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty trash confirmation */}
      {showEmptyConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setShowEmptyConfirm(false)}
        >
          <div
            className="w-80 rounded-lg border bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <p className="text-sm font-medium">Empty Trash?</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Permanently delete all {trash.length} item
              {trash.length !== 1 ? 's' : ''} in trash. This action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowEmptyConfirm(false)}
                className="rounded-md border px-4 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await emptyTrash();
                  setShowEmptyConfirm(false);
                }}
                className="rounded-md bg-destructive px-4 py-1.5 text-xs font-medium text-destructive-foreground"
              >
                Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent delete confirmation */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-72 rounded-lg border bg-card p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium">Delete permanently?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This action cannot be undone.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-md border px-3 py-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await permanentlyDeleteAsset(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="rounded-md bg-destructive px-3 py-1 text-xs text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
