"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Copy,
  Trash2,
  FileJson,
  Columns3,
  Square,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/lib/builder/store";
import type { Section, Column, Block } from "@/lib/builder/types";
import { blockRegistry } from "@/lib/builder/block-registry";

interface TreeNode {
  id: string;
  type: "section" | "column" | "block";
  label: string;
  icon: typeof Square;
  children?: TreeNode[];
  visible?: boolean;
  locked?: boolean;
}

function sortByKeyFn<T extends { sortKey: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0,
  );
}

function buildTree(sections: Section[]): TreeNode[] {
  return sortByKeyFn(sections).map((section) => ({
    id: section.id,
    type: "section" as const,
    label:
      blockRegistry.getBlockType(section.sectionType)?.label ??
      section.sectionType,
    icon: FileJson,
    visible: true,
    locked: false,
    children: sortByKeyFn(section.columns).map((col) => ({
      id: col.id,
      type: "column" as const,
      label: `Column (${col.span}/12)`,
      icon: Columns3,
      children: sortByKeyFn(col.blocks).map((block) => {
        const reg = blockRegistry.getBlockType(block.blockType);
        return {
          id: block.id,
          type: "block" as const,
          label: reg?.label ?? block.blockType,
          icon: Square,
          children: [],
        };
      }),
    })),
  }));
}

function TreeNodeItem({
  node,
  depth,
  selection,
  selectedIds,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  selection: { id: string; type: string } | null;
  selectedIds: string[];
  onSelect: (id: string, type: "section" | "column" | "block") => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selection?.id === node.id;
  const isMultiSelected = selectedIds.includes(node.id);
  const Icon = node.icon;

  return (
    <div>
      <div
        className={cn(
          "flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent",
          (isSelected || isMultiSelected) &&
            "bg-accent font-medium text-accent-foreground",
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect(node.id, node.type)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5"
          >
            {expanded ? (
              <ChevronDown className="size-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <GripVertical className="size-3 shrink-0 text-muted-foreground/50" />
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate">{node.label}</span>
        <span className="text-[10px] text-muted-foreground/50">{node.type[0].toUpperCase()}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selection={selection}
              selectedIds={selectedIds}
              onSelect={onSelect}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LayerPanel() {
  const sections = useBuilderStore((s) => s.sections);
  const selection = useBuilderStore((s) => s.selection);
  const selectedIds = useBuilderStore((s) => s.selectedIds);
  const select = useBuilderStore((s) => s.select);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);
  const deleteSection = useBuilderStore((s) => s.deleteSection);

  const tree = useMemo(() => buildTree(sections), [sections]);

  const handleSelect = useCallback(
    (id: string, type: "section" | "column" | "block") => {
      select(id, type);
    },
    [select],
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateSection(id);
    },
    [duplicateSection],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteSection(id);
    },
    [deleteSection],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-2">
        <h3 className="text-sm font-medium">Layers</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {sections.length} section{sections.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {tree.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No sections yet
          </p>
        ) : (
          tree.map((node) => (
            <DropdownMenu key={node.id}>
              <DropdownMenuTrigger asChild>
                <div>
                  <TreeNodeItem
                    node={node}
                    depth={0}
                    selection={selection}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem
                  onClick={() => handleDuplicate(node.id)}
                  className="text-xs"
                >
                  <Copy className="mr-2 size-3.5" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(node.id)}
                  className="text-xs text-destructive"
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))
        )}
      </div>
    </div>
  );
}
