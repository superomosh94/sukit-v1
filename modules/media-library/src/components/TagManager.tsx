'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  Tag,
  Search,
  Hash,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import type { MediaTag } from '../types';

const TAG_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Red', value: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Blue', value: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Green', value: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Yellow', value: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'Purple', value: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Pink', value: 'bg-pink-100 text-pink-700 border-pink-200' },
  { label: 'Orange', value: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Teal', value: 'bg-teal-100 text-teal-700 border-teal-200' },
  { label: 'Gray', value: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const TAG_COLOR_MAP = new Map(TAG_COLORS.map((c) => [c.label, c.value]));

interface TagManagerProps {
  onClose: () => void;
  selectedTag?: string | null;
  onTagSelect?: (tagName: string | null) => void;
}

export function TagManager({
  onClose,
  selectedTag,
  onTagSelect,
}: TagManagerProps) {
  const { tags, createTag, deleteTag } = useMediaStore();
  const assets = useMediaStore((s) => s.assets);

  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cloud'>('list');

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (editingTagId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTagId]);

  const tagCounts = new Map<string, number>();
  assets.forEach((a) => {
    a.tags.forEach((t) => {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    });
  });

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxTagCount = Math.max(...Array.from(tagCounts.values()), 1);

  const handleCreateTag = useCallback(async () => {
    if (newTagName.trim()) {
      const tag = await createTag(newTagName.trim());
      setNewTagName('');
      setShowColorPicker(false);
      if (tag && onTagSelect) {
        onTagSelect(tag.name);
      }
    }
  }, [newTagName, createTag, onTagSelect]);

  const handleDeleteTag = useCallback(
    async (id: string) => {
      await deleteTag(id);
      setDeleteConfirmId(null);
    },
    [deleteTag]
  );

  const handleRenameTag = useCallback(
    async (id: string) => {
      if (editingName.trim()) {
        // Rename via updateAsset approach - we use the store which doesn't have renameTag
        // So we'll use the existing mechanisms
        const tag = tags.find((t) => t.id === id);
        if (tag && tag.name !== editingName.trim()) {
          // Update all assets with this tag
          const taggedAssets = assets.filter((a) => a.tags.includes(tag.name));
          for (const asset of taggedAssets) {
            const newTags = asset.tags.map((t) =>
              t === tag.name ? editingName.trim() : t
            );
            await useMediaStore
              .getState()
              .updateAsset(asset.id, { tags: newTags });
          }
          await createTag(editingName.trim());
          await deleteTag(id);
        }
      }
      setEditingTagId(null);
    },
    [editingName, tags, assets, createTag, deleteTag]
  );

  const getTagStyle = (tagName: string) => {
    const colorClass = TAG_COLOR_MAP.get(tagName) ?? '';
    return colorClass;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-[70vh] w-[440px] flex-col rounded-lg border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">Manage Tags</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X className="size-4" />
          </button>
        </div>

        {/* Search & create */}
        <div className="border-b px-6 py-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                placeholder="New tag name..."
                className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-none"
              />
            </div>
            <button
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              <Plus className="size-3.5" />
              Add
            </button>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded px-2 py-0.5',
                viewMode === 'list' ? 'bg-accent text-foreground' : ''
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('cloud')}
              className={cn(
                'rounded px-2 py-0.5',
                viewMode === 'cloud' ? 'bg-accent text-foreground' : ''
              )}
            >
              Cloud
            </button>
          </div>
        </div>

        {/* Tag list / cloud */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTags.length === 0 && !searchQuery && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Tag className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No tags yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Create tags to organize your media
              </p>
            </div>
          )}

          {filteredTags.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No tags match "{searchQuery}"
              </p>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-1">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className={cn(
                    'group flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors',
                    selectedTag === tag.name
                      ? 'bg-primary/5 ring-1 ring-primary/30'
                      : 'hover:bg-accent'
                  )}
                >
                  {editingTagId === tag.id ? (
                    <input
                      ref={editInputRef}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleRenameTag(tag.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameTag(tag.id);
                        if (e.key === 'Escape') setEditingTagId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-6 flex-1 rounded border px-2 text-xs outline-none"
                    />
                  ) : (
                    <button
                      onClick={() =>
                        onTagSelect?.(
                          selectedTag === tag.name ? null : tag.name
                        )
                      }
                      className="flex flex-1 items-center gap-2 min-w-0"
                    >
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-medium',
                          getTagStyle(tag.name) ||
                            'bg-muted text-muted-foreground'
                        )}
                      >
                        {tag.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {tag.assetCount}
                      </span>
                    </button>
                  )}

                  <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingTagId(tag.id);
                        setEditingName(tag.name);
                      }}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-2.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(tag.id)}
                      className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'cloud' && (
            <div className="flex flex-wrap items-center gap-2 p-4">
              {filteredTags
                .sort(
                  (a, b) =>
                    (tagCounts.get(b.name) ?? 0) - (tagCounts.get(a.name) ?? 0)
                )
                .map((tag) => {
                  const count = tagCounts.get(tag.name) ?? 0;
                  const ratio = count / maxTagCount;
                  const size = 0.7 + ratio * 1.3;
                  return (
                    <button
                      key={tag.id}
                      onClick={() =>
                        onTagSelect?.(
                          selectedTag === tag.name ? null : tag.name
                        )
                      }
                      className={cn(
                        'rounded-full px-3 py-1 font-medium transition-colors',
                        selectedTag === tag.name
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                      style={{ fontSize: `${size * 0.875}rem` }}
                    >
                      {tag.name}
                      <span className="ml-1 opacity-60">{count}</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <span className="text-[11px] text-muted-foreground">
            {tags.length} tag{tags.length !== 1 ? 's' : ''} total
          </span>
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Done
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-72 rounded-lg border bg-card p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium">Delete tag?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This will remove the tag from all assets.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-md border px-3 py-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTag(deleteConfirmId)}
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
