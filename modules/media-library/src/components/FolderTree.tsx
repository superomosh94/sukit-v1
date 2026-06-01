'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  FolderClosed,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Search,
  Image,
  GripVertical,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import type { MediaFolder } from '../types';

interface FolderNodeProps {
  folder: MediaFolder;
  depth?: number;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
}

function FolderNode({
  folder,
  depth = 0,
  onSelect,
  selectedId,
  onRename,
  onDelete,
  searchQuery,
}: FolderNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSelected = selectedId === folder.id;
  const hasChildren = folder.children && folder.children.length > 0;
  const matchesSearch = searchQuery
    ? folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  useEffect(() => {
    if (editing && inputRef.current) {
      (inputRef.current as HTMLInputElement)?.focus();
      (inputRef.current as HTMLInputElement)?.select();
    }
  }, [editing]);

  useEffect(() => {
    setName(folder.name);
  }, [folder.name]);

  useEffect(() => {
    if (searchQuery) setExpanded(true);
  }, [searchQuery]);

  const handleRename = useCallback(() => {
    if (name.trim() && name !== folder.name) {
      onRename(folder.id, name.trim());
    } else {
      setName(folder.name);
    }
    setEditing(false);
  }, [name, folder.id, folder.name, onRename]);

  if (!matchesSearch) {
    return hasChildren ? (
      <div>
        {folder.children.map((child) => (
          <FolderNode
            key={child.id}
            folder={child}
            depth={depth + 1}
            onSelect={onSelect}
            selectedId={selectedId}
            onRename={onRename}
            onDelete={onDelete}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    ) : null;
  }

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-0.5 rounded-md px-1 py-0.5 text-xs transition-colors',
          isSelected
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-accent text-foreground'
        )}
        style={{ paddingLeft: `${6 + depth * 14}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="size-4 flex items-center justify-center shrink-0"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )
          ) : (
            <span className="w-3" />
          )}
        </button>

        <button
          onClick={() => onSelect(folder.id)}
          className="flex items-center gap-1 flex-1 min-w-0 py-0.5"
        >
          {isSelected ? (
            <FolderOpen className="size-3.5 shrink-0 text-primary" />
          ) : (
            <FolderClosed className="size-3.5 shrink-0" />
          )}

          {editing ? (
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName((e.target as HTMLInputElement).value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setName(folder.name);
                  setEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-5 flex-1 rounded border border-primary bg-background px-1 text-[11px] outline-none"
            />
          ) : (
            <span className="truncate">{folder.name}</span>
          )}
        </button>

        <span className="text-[9px] text-muted-foreground tabular-nums shrink-0">
          {folder.assetCount}
        </span>

        {!editing && (
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-2.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="rounded p-0.5 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-2.5" />
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-72 rounded-lg border bg-card p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium">Delete folder?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Assets will be moved to trash. This action cannot be undone.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border px-3 py-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(folder.id);
                  setShowDeleteConfirm(false);
                }}
                className="rounded-md bg-destructive px-3 py-1 text-xs text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {expanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              onRename={onRename}
              onDelete={onDelete}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree() {
  const {
    folders,
    currentFolder,
    setCurrentFolder,
    createFolder,
    renameFolder,
    deleteFolder,
    assets,
  } = useMediaStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating && inputRef.current) {
      (inputRef.current as HTMLInputElement)?.focus();
    }
  }, [creating]);

  const rootFolders = folders.filter((f) => !f.parentId);

  const handleCreateFolder = useCallback(async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim(), currentFolder ?? undefined);
      setNewFolderName('');
      setCreating(false);
    }
  }, [newFolderName, currentFolder, createFolder]);

  const totalAssetCount = assets.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Folders
        </span>
        <button
          onClick={() => setCreating(true)}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <div className="border-b px-3 py-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery((e.target as HTMLInputElement).value)
            }
            placeholder="Search folders..."
            className="h-7 w-full rounded-md border bg-background pl-6 pr-2 text-[11px] outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        <button
          onClick={() => setCurrentFolder(null)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors mb-0.5',
            !currentFolder
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-accent text-foreground'
          )}
        >
          <Image className="size-3.5 shrink-0" />
          <span className="truncate">All Media</span>
          <span className="ml-auto text-[9px] text-muted-foreground tabular-nums">
            {totalAssetCount}
          </span>
        </button>

        {rootFolders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            onSelect={setCurrentFolder}
            selectedId={currentFolder}
            onRename={renameFolder}
            onDelete={deleteFolder}
            searchQuery={searchQuery}
          />
        ))}

        {rootFolders.length === 0 && !searchQuery && (
          <div className="px-2 py-4 text-center">
            <p className="text-[10px] text-muted-foreground">No folders yet</p>
            <button
              onClick={() => setCreating(true)}
              className="mt-1 text-[10px] text-primary hover:underline"
            >
              Create one
            </button>
          </div>
        )}
      </div>

      {creating && (
        <div className="border-t px-3 py-2">
          <div className="flex gap-1">
            <input
              ref={inputRef}
              value={newFolderName}
              onChange={(e) =>
                setNewFolderName((e.target as HTMLInputElement).value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setCreating(false);
                  setNewFolderName('');
                }
              }}
              placeholder="Folder name"
              className="h-7 flex-1 rounded border px-2 text-[11px] outline-none"
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="rounded bg-primary px-2 text-[11px] text-primary-foreground disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
