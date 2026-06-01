import React, { useState, useCallback } from 'react';
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Trash,
  Pencil,
} from 'lucide-react';

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  language?: string;
}

export interface FileTreeProps {
  files: FileNode[];
  selectedFile?: string;
  onFileSelect: (path: string) => void;
  onFileCreate?: (
    parentPath: string,
    name: string,
    type: 'file' | 'folder'
  ) => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (path: string, newName: string) => void;
}

function TreeNode({
  node,
  depth,
  selectedFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
}: {
  node: FileNode;
  depth: number;
  selectedFile?: string;
  onFileSelect: (path: string) => void;
  onFileCreate?: (
    parentPath: string,
    name: string,
    type: 'file' | 'folder'
  ) => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (path: string, newName: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const isFolder = node.type === 'folder';
  const isSelected = selectedFile === node.path;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 text-sm cursor-pointer rounded group hover:bg-accent/30 ${isSelected ? 'bg-accent/50 text-accent-foreground' : 'text-foreground/80'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isFolder) setExpanded(!expanded);
          else onFileSelect(node.path);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowActions(true);
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {isFolder ? (
          expanded ? (
            <ChevronDown size={14} className="shrink-0" />
          ) : (
            <ChevronRight size={14} className="shrink-0" />
          )
        ) : (
          <span className="w-[14px]" />
        )}
        {isFolder ? (
          <Folder size={14} className="shrink-0 text-blue-400" />
        ) : (
          <File size={14} className="shrink-0 text-gray-400" />
        )}
        {isRenaming ? (
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => {
              onFileRename?.(node.path, renameValue);
              setIsRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onFileRename?.(node.path, renameValue);
                setIsRenaming(false);
              }
            }}
            className="flex-1 bg-background border border-border rounded px-1 text-sm outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}
        {showActions && !isRenaming && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onFileCreate && isFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileCreate(node.path, 'new-file', 'file');
                }}
                className="p-0.5 rounded hover:bg-accent"
                title="New File"
              >
                <Plus size={12} />
              </button>
            )}
            {onFileRename && !isFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                  setRenameValue(node.name);
                }}
                className="p-0.5 rounded hover:bg-accent"
                title="Rename"
              >
                <Pencil size={12} />
              </button>
            )}
            {onFileDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(node.path);
                }}
                className="p-0.5 rounded hover:bg-accent text-red-400"
                title="Delete"
              >
                <Trash size={12} />
              </button>
            )}
          </div>
        )}
      </div>
      {isFolder &&
        expanded &&
        node.children?.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            onFileCreate={onFileCreate}
            onFileDelete={onFileDelete}
            onFileRename={onFileRename}
          />
        ))}
    </div>
  );
}

export function FileTree({
  files,
  selectedFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
}: FileTreeProps) {
  return (
    <div className="h-full bg-[#252526] border-r border-[#3c3c3c] overflow-auto p-2">
      <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-[#888] uppercase">
        <span>Explorer</span>
        {onFileCreate && (
          <button
            onClick={() => onFileCreate('/', 'untitled', 'file')}
            className="p-0.5 rounded hover:bg-accent/30"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      {files.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          onFileCreate={onFileCreate}
          onFileDelete={onFileDelete}
          onFileRename={onFileRename}
        />
      ))}
    </div>
  );
}
