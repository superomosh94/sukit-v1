'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragCancelEvent,
  type DragOverEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Copy,
  Trash2,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Video,
  Maximize2,
  LayoutTemplate as LayoutTemplateIcon,
} from 'lucide-react';
import { useBuilderStore } from '../stores/builderStore';
import type { Section, Column, Block } from '../types';
import { SectionRenderer } from './renderer';
import { blockRegistry } from '../block-registry';
import { getSectionPresets, buildPresetSection } from '../section-presets';
import { cn } from '../utils/cn';
import { Button } from '../components/ui/button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { showToast, ToastContainer } from '../components/Toast';
import { Ruler } from './Ruler';
import { ContextMenu, type ContextMenuItem } from '../components/ContextMenu';

interface DroppableColumnProps {
  column: Column;
  sectionId: string;
  children: React.ReactNode;
}

function DroppableColumn({
  column,
  sectionId,
  children,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${column.id}`,
    data: { type: 'column', columnId: column.id, sectionId },
  });

  return (
    <div
      ref={setNodeRef}
      // @ts-ignore
      data-section-id={sectionId}
      // @ts-ignore
      style={{ gridColumn: `span ${column.span}` }}
    >
      {children}
    </div>
  );
}

function SortableBlock({
  block,
  columnId,
  sectionId,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onCopy,
}: {
  block: Block;
  columnId: string;
  sectionId: string;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
}) {
  const handleInlineEdit = useCallback(
    (blockId: string, text: string) => {
      useBuilderStore.getState().updateBlock(sectionId, columnId, blockId, {
        props: { ...block.props, text },
      });
    },
    [sectionId, columnId, block.props]
  );
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { type: 'block', blockId: block.id, columnId, sectionId },
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.3 : 1,
    }),
    [transform, transition, isDragging]
  );

  const registration = blockRegistry.getBlockType(block.blockType);

  const handleAction = useCallback((e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'builder-block group relative mb-1 rounded border bg-card px-2 py-1.5 text-sm',
        isSelected && 'ring-2 ring-builder-selected'
      )}
      onClick={onSelect}
    >
      {/* Action toolbar - appears on hover when selected */}
      {isSelected && (
        <div className="absolute -top-7 right-0 z-20 flex items-center gap-0.5 rounded-md border bg-background p-0.5 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-5"
            onClick={(e) => handleAction(e, onCopy)}
            title="Copy block"
          >
            <Copy className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-5"
            onClick={(e) => handleAction(e, onDuplicate)}
            title="Duplicate block"
          >
            <Copy className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-5 text-destructive hover:text-destructive"
            onClick={(e) => handleAction(e, onDelete)}
            title="Delete block"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      )}

      {/* Resize handles */}
      {isSelected && (
        <>
          <div
            className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize bg-primary/30 opacity-0 transition-opacity hover:opacity-100"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const startX = e.clientX;
              const startWidth = block.styles.width
                ? parseInt(String(block.styles.width))
                : 200;
              const handleMouseMove = (ev: MouseEvent) => {
                const dx = ev.clientX - startX;
                const newWidth = Math.max(20, startWidth + dx);
                useBuilderStore
                  .getState()
                  .updateBlock(sectionId, columnId, block.id, {
                    styles: { ...block.styles, width: `${newWidth}px` },
                  });
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          <div
            className="absolute bottom-0 left-0 z-10 h-1 w-full cursor-row-resize bg-primary/30 opacity-0 transition-opacity hover:opacity-100"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const startY = e.clientY;
              const startHeight = block.styles.height
                ? parseInt(String(block.styles.height))
                : 100;
              const handleMouseMove = (ev: MouseEvent) => {
                const dy = ev.clientY - startY;
                const newHeight = Math.max(20, startHeight + dy);
                useBuilderStore
                  .getState()
                  .updateBlock(sectionId, columnId, block.id, {
                    styles: { ...block.styles, height: `${newHeight}px` },
                  });
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </>
      )}

      <div className="flex items-center gap-2">
        <div
          className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {registration?.label ?? block.blockType}
        </span>
      </div>
      <div className="pl-6">
        <SectionRenderer
          onInlineEdit={handleInlineEdit}
          section={{
            ...({
              id: 'preview',
              pageId: '',
              sectionType: '',
              sortKey: '',
              settings: {},
              responsive: {},
              columns: [
                {
                  id: 'preview-col',
                  sectionId: 'preview',
                  gridRow: 1,
                  gridCol: 1,
                  span: 12,
                  sortKey: '',
                  settings: {},
                  blocks: [block],
                },
              ],
            } as Section),
          }}
          viewport="desktop"
        />
      </div>
    </div>
  );
}

function SortableSection({
  section,
  isSelected,
  isDragOver,
  selectedBlocks,
  onSelect,
  onBlockSelect,
  onBlockDelete,
  onBlockDuplicate,
  onBlockCopy,
  onAddBlockToColumn,
}: {
  section: Section;
  isSelected: boolean;
  isDragOver?: boolean;
  selectedBlocks: string[];
  onSelect: () => void;
  onBlockSelect: (blockId: string, e: React.MouseEvent) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockDuplicate: (blockId: string) => void;
  onBlockCopy: (blockId: string) => void;
  onAddBlockToColumn: (columnId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { type: 'section', sectionId: section.id },
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      marginLeft: (section.settings.marginLeft as number) ?? 0,
      marginRight: (section.settings.marginRight as number) ?? 0,
    }),
    [transform, transition, isDragging, section.settings]
  );

  const sortedColumns = useMemo(
    () => sortByKeyFn(section.columns),
    [section.columns]
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border-2 transition-colors',
        isSelected
          ? 'border-builder-selected'
          : isDragOver
            ? 'border-builder-drop bg-builder-drop/10'
            : 'border-transparent hover:border-builder-hover'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className={cn(
          'absolute -left-3 top-1/2 z-10 -translate-y-1/2 cursor-grab rounded-md border bg-background p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100',
          isDragging && 'cursor-grabbing'
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5 text-muted-foreground" />
      </div>
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {(section.settings as any).backgroundVideoUrl ? (
          <span className="flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-600">
            <Video className="size-3" />
            Video
          </span>
        ) : null}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const sections = useBuilderStore.getState().sections;
            const updated = sections.map((s) =>
              s.id === section.id
                ? {
                    ...s,
                    settings: {
                      ...s.settings,
                      collapsed: !(s.settings as any).collapsed,
                    },
                  }
                : s
            );
            useBuilderStore.getState().setSections(updated);
          }}
          className="rounded border bg-background p-1 text-muted-foreground hover:text-foreground"
          title={
            (section.settings as any).collapsed
              ? 'Expand section'
              : 'Collapse section'
          }
        >
          {(section.settings as any).collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </button>
      </div>
      <div className="grid grid-cols-12 gap-2 p-3">
        {sortedColumns.map((col) => {
          const sortedBlocks = sortByKeyFn(col.blocks);
          return (
            <DroppableColumn key={col.id} column={col} sectionId={section.id}>
              <SortableContext
                items={sortedBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedBlocks.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                    <span>Empty column</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddBlockToColumn(col.id);
                      }}
                      className="rounded-md border border-dashed px-3 py-1 text-[10px] hover:border-primary hover:text-primary"
                    >
                      + Add Block
                    </button>
                  </div>
                )}
                {sortedBlocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    columnId={col.id}
                    sectionId={section.id}
                    isSelected={selectedBlocks.includes(block.id)}
                    onSelect={(e) => onBlockSelect(block.id, e)}
                    onDelete={() => onBlockDelete(block.id)}
                    onDuplicate={() => onBlockDuplicate(block.id)}
                    onCopy={() => onBlockCopy(block.id)}
                  />
                ))}
              </SortableContext>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddBlockToColumn(col.id);
                }}
                className="mt-1 w-full rounded py-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
              >
                <Plus className="mx-auto size-3.5" />
              </button>
            </DroppableColumn>
          );
        })}
      </div>
      {isSelected && (
        <div className="absolute inset-0 rounded-md ring-2 ring-builder-selected ring-offset-1 pointer-events-none" />
      )}
    </div>
  );
}

const ICON_MAP: Record<string, typeof LayoutTemplateIcon> = {
  Monitor: Plus,
  LayoutGrid,
  DollarSign: Plus,
  Mail: Plus,
  Copyright: Plus,
  Images: Plus,
  User: Plus,
  LayoutTemplate: LayoutTemplateIcon,
};

function EmptyCanvasFallback() {
  const addSection = useBuilderStore((s) => s.addSection);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
      <div className="rounded-full bg-muted p-4 mb-4">
        <LayoutTemplateIcon className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No sections yet</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Start building your page by adding a section.
      </p>
      <button
        onClick={() => addSection('default')}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
      >
        Add Section
      </button>
    </div>
  );
}

function sortByKeyFn(items: any[]) {
  return [...items].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  );
}

export function Canvas({ siteId, pageId }: { siteId: string; pageId: string }) {
  const addSection = useBuilderStore((s) => s.addSection);
  const sections = useBuilderStore((s) => s.sections);
  const setSections = useBuilderStore((s) => s.setSections);
  const reorderSections = useBuilderStore((s) => s.reorderSections);
  const moveBlock = useBuilderStore((s) => s.moveBlock);
  const clearSelection = useBuilderStore((s) => s.clearSelection);
  const toggleSelection = useBuilderStore((s) => s.toggleSelection);
  const select = useBuilderStore((s) => s.select);
  const copySelection = useBuilderStore((s) => s.copySelection);
  const nudgeBlock = useBuilderStore((s) => s.nudgeBlock);
  const duplicateBlock = useBuilderStore((s) => s.duplicateBlock);
  const addBlock = useBuilderStore((s) => s.addBlock);
  const isPanning = useBuilderStore((s) => s.isPanning);
  const selectedIds = useBuilderStore((s) => s.selectedIds);
  const showGrid = useBuilderStore((s) => s.showGrid);
  const setIsPanning = useBuilderStore((s) => s.setIsPanning);
  const viewport = useBuilderStore((s) => s.viewport);
  const zoom = useBuilderStore((s) => s.zoom);
  const panOffset = useBuilderStore((s) => s.panOffset);
  const gridSize = useBuilderStore((s) => s.gridSize);
  const showOutlines = useBuilderStore((s) => s.showOutlines);
  const deleteBlock = useBuilderStore((s) => s.deleteBlock);
  const selection = useBuilderStore((s) => s.selection);
  const setPanOffset = useBuilderStore((s) => s.setPanOffset);
  const [showPicker, setShowPicker] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    type: 'section' | 'block';
  } | null>(null);
  const [marquee, setMarquee] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const spaceHeldRef = useRef(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedSections = useMemo(() => sortByKeyFn(sections), [sections]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<Array<{
    orientation: 'horizontal' | 'vertical';
    position: number;
    length: number;
  }> | null>(null);

  const handleDragCancel = useCallback((_event: DragCancelEvent) => {
    setActiveId(null);
    setDragOverSection(null);
    setAlignmentGuides(null);
  }, []);

  const handleDragMove = useCallback((event: DragOverEvent) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const guides: Array<{
      orientation: 'horizontal' | 'vertical';
      position: number;
      length: number;
    }> = [];
    const threshold = 8;

    const dragOverlay = document.querySelector('[data-drag-overlay]');
    if (!dragOverlay) {
      setAlignmentGuides(null);
      return;
    }
    const activeRect = dragOverlay.getBoundingClientRect();
    const active = {
      left: activeRect.left - canvasRect.left,
      top: activeRect.top - canvasRect.top,
      right: activeRect.right - canvasRect.left,
      bottom: activeRect.bottom - canvasRect.top,
      centerX: (activeRect.left + activeRect.right) / 2 - canvasRect.left,
      centerY: (activeRect.top + activeRect.bottom) / 2 - canvasRect.top,
    };

    const sectionElements =
      canvasRef.current.querySelectorAll('[data-section-id]');
    sectionElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const target = {
        left: rect.left - canvasRect.left,
        top: rect.top - canvasRect.top,
        right: rect.right - canvasRect.left,
        bottom: rect.bottom - canvasRect.top,
        centerX: (rect.left + rect.right) / 2 - canvasRect.left,
        centerY: (rect.top + rect.bottom) / 2 - canvasRect.top,
      };

      if (Math.abs(active.left - target.left) < threshold) {
        guides.push({
          orientation: 'vertical',
          position: target.left,
          length: canvasRect.height,
        });
      }
      if (Math.abs(active.right - target.right) < threshold) {
        guides.push({
          orientation: 'vertical',
          position: target.right,
          length: canvasRect.height,
        });
      }
      if (Math.abs(active.centerX - target.centerX) < threshold) {
        guides.push({
          orientation: 'vertical',
          position: target.centerX,
          length: canvasRect.height,
        });
      }
      if (Math.abs(active.top - target.top) < threshold) {
        guides.push({
          orientation: 'horizontal',
          position: target.top,
          length: canvasRect.width,
        });
      }
      if (Math.abs(active.bottom - target.bottom) < threshold) {
        guides.push({
          orientation: 'horizontal',
          position: target.bottom,
          length: canvasRect.width,
        });
      }
      if (Math.abs(active.centerY - target.centerY) < threshold) {
        guides.push({
          orientation: 'horizontal',
          position: target.centerY,
          length: canvasRect.width,
        });
      }
    });

    setAlignmentGuides(guides.length > 0 ? guides : null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over ? String(event.over.id) : null;
    setDragOverSection(overId);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setDragOverSection(null);
      setAlignmentGuides(null);
      if (!over || active.id === over.id) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      if (activeData?.type === 'section' && overData?.type === 'section') {
        const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
        const newIndex = sortedSections.findIndex((s) => s.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderSections(oldIndex, newIndex);
        }
      } else if (activeData?.type === 'block') {
        const fromSectionId = activeData.sectionId;
        const fromColumnId = activeData.columnId;
        let toSectionId = fromSectionId;
        let toColumnId = fromColumnId;
        let newIndex = 0;

        if (overData?.type === 'column') {
          toSectionId = overData.sectionId;
          toColumnId = overData.columnId;
          const targetSection = sections.find((s) => s.id === toSectionId);
          const targetColumn = targetSection?.columns.find(
            (c) => c.id === toColumnId
          );
          newIndex = targetColumn ? targetColumn.blocks.length : 0;
        } else if (overData?.type === 'block') {
          toSectionId = overData.sectionId;
          toColumnId = overData.columnId;
          const targetSection = sections.find((s) => s.id === toSectionId);
          const targetColumn = targetSection?.columns.find(
            (c) => c.id === toColumnId
          );
          if (targetColumn) {
            const sorted = sortByKeyFn(targetColumn.blocks);
            newIndex = sorted.findIndex((b) => b.id === over.id);
            if (newIndex < 0) newIndex = 0;
          }
        }

        if (active.id !== over.id) {
          moveBlock(
            String(active.id),
            { sectionId: fromSectionId, columnId: fromColumnId },
            { sectionId: toSectionId, columnId: toColumnId },
            newIndex
          );
        }
      }
    },
    [sortedSections, reorderSections, moveBlock, sections]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, items: ContextMenuItem[]) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, items });
    },
    []
  );

  const handleCanvasClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleBlockSelect = useCallback(
    (blockId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey) {
        toggleSelection(blockId, 'block');
      } else {
        select(blockId, 'block');
      }
    },
    [select, toggleSelection]
  );

  const handleAddBlockToColumn = useCallback(
    (columnId: string) => {
      const lastSection = sortedSections[sortedSections.length - 1];
      if (!lastSection) {
        addSection('container');
        return;
      }
      const col = lastSection.columns.find((c: any) => c.id === columnId);
      if (col) {
        addBlock(lastSection.id, columnId, 'text');
      }
    },
    [sortedSections, addSection, addBlock]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!confirmDelete) return;
    const state = useBuilderStore.getState();
    if (confirmDelete.type === 'section') {
      state.deleteSection(confirmDelete.id);
      showToast('Section deleted', 'info');
    } else {
      for (const s of state.sections) {
        for (const c of s.columns) {
          if (c.blocks.find((b: any) => b.id === confirmDelete.id)) {
            state.deleteBlock(s.id, c.id, confirmDelete.id);
            showToast('Block deleted', 'info');
            return;
          }
        }
      }
    }
    setConfirmDelete(null);
  }, [confirmDelete]);

  const handleBlockCopy = useCallback(
    (blockId: string) => {
      select(blockId, 'block');
      copySelection();
    },
    [select, copySelection]
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const state = useBuilderStore.getState();

      // Select All (Ctrl+A)
      if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        state.selectAll();
        return;
      }

      const sel = state.selection;
      if (!sel) return;

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Arrow key nudge
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        sel.type === 'block'
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        for (const s of state.sections) {
          for (const c of s.columns) {
            const block = c.blocks.find((b: any) => b.id === sel.id);
            if (block) {
              nudgeBlock(s.id, c.id, sel.id, dx, dy);
              return;
            }
          }
        }
      }

      // Delete (with confirmation)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        setConfirmDelete({ id: sel.id, type: sel.type as 'section' | 'block' });
      }

      // Escape
      if (e.key === 'Escape') {
        clearSelection();
      }

      // Duplicate on Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (sel.type === 'section') {
          state.duplicateSection(sel.id);
        } else if (sel.type === 'block') {
          for (const s of state.sections) {
            for (const c of s.columns) {
              if (c.blocks.find((b: any) => b.id === sel.id)) {
                duplicateBlock(s.id, c.id, sel.id);
                return;
              }
            }
          }
        }
      }

      // Copy on Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        state.copySelection();
      }

      // Cut on Ctrl+X
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        state.copySelection();
        if (sel.type === 'section') {
          state.deleteSection(sel.id);
        } else if (sel.type === 'block') {
          for (const s of state.sections) {
            for (const c of s.columns) {
              if (c.blocks.find((b: any) => b.id === sel.id)) {
                state.deleteBlock(s.id, c.id, sel.id);
                return;
              }
            }
          }
        }
      }

      // Viewport shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        state.setViewport('desktop');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        state.setViewport('tablet');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        state.setViewport('phone');
      }

      // Toggle outlines
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        state.setShowOutlines(!state.showOutlines);
      }

      // Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        state.setSections(state.sections);
      }

      // Space for pan mode
      if (e.key === ' ') {
        e.preventDefault();
        spaceHeldRef.current = true;
        document.body.style.cursor = 'grab';
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === ' ') {
        spaceHeldRef.current = false;
        document.body.style.cursor = '';
        setIsPanning(false);
      }
    }

    function handleMouseDown(e: MouseEvent) {
      if (spaceHeldRef.current) {
        setIsPanning(true);
        document.body.style.cursor = 'grabbing';
      }
    }

    function handleMouseMove(e: MouseEvent) {
      if (useBuilderStore.getState().isPanning && canvasRef.current) {
        setPanOffset({
          x: useBuilderStore.getState().panOffset.x + e.movementX,
          y: useBuilderStore.getState().panOffset.y + e.movementY,
        });
      }
    }

    function handleMouseUp() {
      setIsPanning(false);
      if (!spaceHeldRef.current) {
        document.body.style.cursor = '';
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    clearSelection,
    nudgeBlock,
    duplicateBlock,
    setPanOffset,
    setIsPanning,
    copySelection,
  ]);

  const sectionIds = useMemo(
    () => sortedSections.map((s) => s.id),
    [sortedSections]
  );

  const debugMode = useBuilderStore((s) => s.debugMode);
  const showPadding = useBuilderStore((s) => s.showPadding);
  const showMargin = useBuilderStore((s) => s.showMargin);
  const showBorderRadius = useBuilderStore((s) => s.showBorderRadius);
  const snapToGrid = useBuilderStore((s) => s.snapToGrid);

  return (
    <ErrorBoundary>
      {/* Screen reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" />

      {showPadding && (
        <style>{`
          .p-overlay { outline: 2px dashed rgba(59,130,246,0.5) !important; outline-offset: 0 !important; }
          .p-overlay::before { content: ''; position: absolute; inset: 0; background: rgba(59,130,246,0.08); pointer-events: none; z-index: 1; }
        `}</style>
      )}
      {showMargin && (
        <style>{`
          .m-overlay { outline: 2px dashed rgba(34,197,94,0.5) !important; outline-offset: 0 !important; }
          .m-overlay::before { content: ''; position: absolute; inset: 0; background: rgba(34,197,94,0.08); pointer-events: none; z-index: 1; }
        `}</style>
      )}
      {showBorderRadius && (
        <style>{`
          .br-overlay { outline: 2px dashed rgba(168,85,247,0.5) !important; outline-offset: 0 !important; }
          .br-overlay [style*="border-radius"], .br-overlay [class*="rounded"] { outline: 2px solid rgba(168,85,247,0.6); border-radius: 0 !important; }
        `}</style>
      )}
      {snapToGrid && (
        <style>{`
          .snap-grid section, .snap-grid [data-block-id] {
            transition: margin-left 0.15s ease, margin-top 0.15s ease, width 0.15s ease, height 0.15s ease, transform 0.15s ease;
          }
        `}</style>
      )}
      <div
        ref={canvasRef}
        className={cn(
          'builder-canvas flex-1 overflow-hidden',
          isPanning && 'cursor-grabbing',
          showPadding && 'show-padding-overlay',
          showMargin && 'show-margin-overlay',
          showBorderRadius && 'show-border-radius-overlay',
          snapToGrid && 'snap-grid'
        )}
        onClick={handleCanvasClick}
        onContextMenu={(e) => {
          if (contextMenu) {
            setContextMenu(null);
          } else {
            const state = useBuilderStore.getState();
            const sel = state.selection;
            if (sel) {
              e.preventDefault();
              const items: ContextMenuItem[] = [
                {
                  label: 'Edit',
                  icon: <LayoutGrid className="size-3.5" />,
                  onClick: () => {},
                },
                {
                  label: 'Duplicate',
                  icon: <Copy className="size-3.5" />,
                  onClick: () => {
                    if (sel.type === 'section') {
                      state.duplicateSection?.(sel.id);
                    }
                  },
                },
                {
                  label: 'Delete',
                  icon: <Trash2 className="size-3.5" />,
                  variant: 'destructive',
                  onClick: () =>
                    setConfirmDelete({
                      id: sel.id,
                      type: sel.type as 'section' | 'block',
                    }),
                },
                ...(sel.type === 'block' && selectedIds.length > 1
                  ? [
                      {
                        label: 'Group Blocks',
                        icon: <LayoutGrid className="size-3.5" />,
                        onClick: () =>
                          (state as any).groupBlocks?.(selectedIds),
                      } as ContextMenuItem,
                      {
                        label: 'Align Left',
                        icon: <LayoutGrid className="size-3.5" />,
                        onClick: () =>
                          (state as any).alignBlocks?.(selectedIds, 'left'),
                      } as ContextMenuItem,
                      {
                        label: 'Align Center',
                        icon: <LayoutGrid className="size-3.5" />,
                        onClick: () =>
                          (state as any).alignBlocks?.(selectedIds, 'center'),
                      } as ContextMenuItem,
                      {
                        label: 'Align Right',
                        icon: <LayoutGrid className="size-3.5" />,
                        onClick: () =>
                          (state as any).alignBlocks?.(selectedIds, 'right'),
                      } as ContextMenuItem,
                      {
                        label: 'Distribute Horizontal',
                        icon: <LayoutGrid className="size-3.5" />,
                        onClick: () =>
                          (state as any).distributeBlocks?.(
                            selectedIds,
                            'horizontal'
                          ),
                      } as ContextMenuItem,
                      {
                        label: 'Distribute Vertical',
                        icon: <LayoutGrid className="size-3.5" />,
                        onClick: () =>
                          (state as any).distributeBlocks?.(
                            selectedIds,
                            'vertical'
                          ),
                      } as ContextMenuItem,
                    ]
                  : []),
              ];
              setContextMenu({ x: e.clientX, y: e.clientY, items });
            }
          }
        }}
      >
        {/* Rulers */}
        {showGrid && (
          <div className="sticky top-0 z-30 flex" style={{ paddingLeft: 20 }}>
            <div className="w-5 shrink-0" />
            <Ruler
              orientation="horizontal"
              length={
                viewport === 'desktop'
                  ? 1200
                  : viewport === 'tablet'
                    ? 810
                    : 390
              }
            />
          </div>
        )}

        <div className="flex">
          {showGrid && (
            <div className="sticky left-0 z-30 shrink-0">
              <Ruler orientation="vertical" length={800} />
            </div>
          )}
          <div
            className="mx-auto min-h-full origin-top transition-transform"
            style={{
              maxWidth:
                viewport === 'desktop'
                  ? '100%'
                  : viewport === 'tablet'
                    ? '810px'
                    : '390px',
              transform: `scale(${zoom / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              padding: viewport === 'desktop' ? '0' : '0 0 40px',
              backgroundImage: showGrid
                ? `radial-gradient(circle, hsl(var(--builder-grid)) 1px, transparent 1px)`
                : undefined,
              backgroundSize: showGrid
                ? `${gridSize}px ${gridSize}px`
                : undefined,
              outline: showOutlines
                ? '1px solid hsl(var(--builder-grid))'
                : undefined,
              outlineOffset: showOutlines ? '-1px' : undefined,
            }}
          >
            {sortedSections.length === 0 ? (
              <EmptyCanvasFallback />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                onDragOver={handleDragOver}
                onDragMove={handleDragMove}
              >
                <SortableContext
                  items={sectionIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className="mx-auto space-y-4 p-6"
                    style={{ maxWidth: 1200 }}
                  >
                    {sortedSections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        isSelected={
                          selection?.type === 'section' &&
                          selection.id === section.id
                        }
                        isDragOver={dragOverSection === section.id}
                        selectedBlocks={selectedIds}
                        onSelect={() => select(section.id, 'section')}
                        onBlockSelect={handleBlockSelect}
                        onBlockDelete={(blockId) => {
                          for (const c of section.columns) {
                            if (c.blocks.find((b: any) => b.id === blockId)) {
                              deleteBlock(section.id, c.id, blockId);
                              return;
                            }
                          }
                        }}
                        onBlockDuplicate={(blockId) => {
                          for (const c of section.columns) {
                            if (c.blocks.find((b: any) => b.id === blockId)) {
                              duplicateBlock(section.id, c.id, blockId);
                              return;
                            }
                          }
                        }}
                        onBlockCopy={(blockId) => handleBlockCopy(blockId)}
                        onAddBlockToColumn={(columnId) =>
                          handleAddBlockToColumn(columnId)
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeId && (
                    <div
                      data-drag-overlay
                      className="rounded-lg border bg-card p-3 shadow-lg opacity-90 rotate-2"
                    >
                      <span className="text-sm font-medium">
                        {blockRegistry.getBlockType(
                          sections
                            .flatMap((s) => s.columns.flatMap((c) => c.blocks))
                            .find((b: any) => b.id === activeId)?.blockType ??
                            ''
                        )?.label ?? 'Moving...'}
                      </span>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}

            {/* Permanent guide lines */}
            {showGrid && (
              <svg
                className="pointer-events-none absolute inset-0 z-0"
                style={{ width: '100%', height: '100%' }}
              >
                {(() => {
                  const lines = [];
                  const spacing = gridSize || 20;
                  for (let x = 0; x < 2000; x += spacing) {
                    lines.push(
                      <line
                        key={`gv${x}`}
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={2000}
                        stroke="hsl(var(--border))"
                        strokeWidth={0.5}
                        opacity={0.3}
                      />
                    );
                  }
                  for (let y = 0; y < 2000; y += spacing) {
                    lines.push(
                      <line
                        key={`gh${y}`}
                        x1={0}
                        y1={y}
                        x2={2000}
                        y2={y}
                        stroke="hsl(var(--border))"
                        strokeWidth={0.5}
                        opacity={0.3}
                      />
                    );
                  }
                  return lines;
                })()}
              </svg>
            )}

            {/* Marquee selection rectangle */}
            {marquee?.active && (
              <div
                ref={marqueeRef}
                className="pointer-events-none absolute z-50 rounded border-2 border-primary/50 bg-primary/10"
                style={{
                  left: Math.min(marquee.startX, marquee.currentX),
                  top: Math.min(marquee.startY, marquee.currentY),
                  width: Math.abs(marquee.currentX - marquee.startX),
                  height: Math.abs(marquee.currentY - marquee.startY),
                }}
              />
            )}

            {/* Debug overlay */}
            {debugMode && (
              <div className="fixed bottom-2 left-2 z-50 rounded-md border bg-background/90 p-2 text-[10px] text-muted-foreground shadow-lg backdrop-blur">
                <p>Sections: {sections.length}</p>
                <p>
                  Blocks:{' '}
                  {sections.reduce(
                    (a, s) =>
                      a + s.columns.reduce((b, c) => b + c.blocks.length, 0),
                    0
                  )}
                </p>
                <p>Viewport: {viewport}</p>
                <p>Zoom: {zoom}%</p>
                <p>Selection: {selection?.id ?? 'none'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alignment guide lines during drag */}
      {alignmentGuides && (
        <svg
          className="pointer-events-none fixed inset-0 z-50"
          style={{ width: '100%', height: '100%' }}
        >
          {alignmentGuides.map((guide, i) => (
            <line
              key={i}
              x1={guide.orientation === 'vertical' ? guide.position : 0}
              y1={guide.orientation === 'horizontal' ? guide.position : 0}
              x2={
                guide.orientation === 'vertical' ? guide.position : guide.length
              }
              y2={
                guide.orientation === 'horizontal'
                  ? guide.position
                  : guide.length
              }
              stroke="hsl(var(--builder-selected, 217 91% 60%))"
              strokeWidth={1}
              strokeDasharray="4 2"
              opacity={0.8}
            />
          ))}
        </svg>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
        title="Delete"
        description={`Are you sure you want to delete this ${confirmDelete?.type}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      {/* Context menu */}
      <ContextMenu
        open={contextMenu !== null}
        x={contextMenu?.x ?? 0}
        y={contextMenu?.y ?? 0}
        items={contextMenu?.items ?? []}
        onClose={() => setContextMenu(null)}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </ErrorBoundary>
  );
}
