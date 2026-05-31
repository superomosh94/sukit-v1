'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FileText,
  Globe,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Lock,
  FileEdit,
} from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';
import type { Page } from '../types';

function SortablePageItem({
  page,
  depth = 0,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  page: Page;
  depth?: number;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const currentPageId = useSiteManagerStore((s) => s.currentPageId);
  const isSelected = currentPageId === page.id;
  const hasChildren = page.children && page.children.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusIcon = (status: string) => {
    if (status === 'published')
      return <Globe className="size-3 text-green-500" />;
    if (status === 'draft')
      return <FileEdit className="size-3 text-amber-500" />;
    return <Lock className="size-3 text-muted-foreground" />;
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={{ ...style, paddingLeft: `${12 + depth * 16}px` }}
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 text-xs cursor-pointer transition-colors',
          isSelected
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-accent text-foreground'
        )}
        onClick={() => onSelect(page.id)}
        {...attributes}
        {...listeners}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-accent rounded"
          >
            {expanded ? (
              <ChevronDown className="size-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        {statusIcon(page.status)}
        <span className="flex-1 truncate">{page.title}</span>
        <span className="text-[9px] text-muted-foreground hidden group-hover:inline">
          /{page.slug}
        </span>
        <div className="hidden group-hover:flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(page.id);
            }}
            className="p-0.5 hover:bg-accent rounded"
            title="Duplicate"
          >
            <Copy className="size-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(page.id);
            }}
            className="p-0.5 hover:bg-accent rounded text-destructive"
            title="Delete"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {page.children!.map((child) => (
            <SortablePageItem
              key={child.id}
              page={child}
              depth={depth + 1}
              onSelect={onSelect}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteTree() {
  const pages = useSiteManagerStore((s) => s.pages);
  const setCurrentPage = useSiteManagerStore((s) => s.setCurrentPage);
  const deletePage = useSiteManagerStore((s) => s.deletePage);
  const duplicatePage = useSiteManagerStore((s) => s.duplicatePage);
  const currentSiteId = useSiteManagerStore((s) => s.currentSiteId);
  const [showCreate, setShowCreate] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const pageIds = useMemo(() => pages.map((p) => p.id), [pages]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const store = useSiteManagerStore.getState();
    store.reorderPages(String(active.id), null, 0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Pages
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCreate(true)}
            className="rounded p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
            title="New Page"
          >
            <Plus className="size-3.5" />
          </button>
          <MoreHorizontal className="size-3.5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pageIds}
            strategy={verticalListSortingStrategy}
          >
            {pages.map((page) => (
              <SortablePageItem
                key={page.id}
                page={page}
                onSelect={setCurrentPage}
                onDelete={(id) => deletePage(id)}
                onDuplicate={(id) => duplicatePage(id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {pages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No pages yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Create your first page
            </button>
          </div>
        )}
      </div>

      {showCreate && currentSiteId && (
        <CreatePageDialog
          siteId={currentSiteId}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function CreatePageDialog({
  siteId,
  onClose,
}: {
  siteId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const createPage = useSiteManagerStore((s) => s.createPage);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createPage({
      siteId,
      title: title.trim(),
      slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, '-'),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-96 rounded-lg border bg-card p-6 shadow-xl">
        <h3 className="mb-4 text-sm font-medium">Create New Page</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug)
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs"
              placeholder="Page title"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Slug</label>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-muted-foreground">/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="h-8 flex-1 rounded-md border px-3 text-xs font-mono"
                placeholder="page-slug"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCreate}
            className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          >
            Create
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md border px-3 py-2 text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
