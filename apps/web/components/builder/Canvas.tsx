"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { useBuilderStore } from "@/lib/builder/store";
import type { Section, Column, Block } from "@/lib/builder/types";
import { SectionRenderer } from "@/lib/builder/renderer";
import { blockRegistry } from "@/lib/builder/block-registry";
import { cn } from "@/lib/utils/cn";

interface DroppableColumnProps {
  column: Column;
  sectionId: string;
  children: React.ReactNode;
}

function DroppableColumn({ column, sectionId, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${column.id}`,
    data: { type: "column", columnId: column.id, sectionId },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "builder-column col-span-12 min-h-[60px] rounded-md border-2 border-dashed p-2 transition-colors",
        isOver
          ? "border-builder-drop bg-builder-drop/10"
          : "border-muted-foreground/20",
      )}
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
}: {
  block: Block;
  columnId: string;
  sectionId: string;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { type: "block", blockId: block.id, columnId, sectionId },
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.3 : 1,
    }),
    [transform, transition, isDragging],
  );

  const registration = blockRegistry.getBlockType(block.blockType);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "builder-block group relative mb-1 rounded border bg-card px-2 py-1.5 text-sm",
        isSelected && "ring-2 ring-builder-selected",
      )}
      onClick={onSelect}
    >
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
          section={{
            ...({
              id: "preview",
              pageId: "",
              sectionType: "",
              sortKey: "",
              settings: {},
              responsive: {},
              columns: [{
                id: "preview-col",
                sectionId: "preview",
                gridRow: 1,
                gridCol: 1,
                span: 12,
                sortKey: "",
                settings: {},
                blocks: [block],
              }],
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
  selectedBlocks,
  onSelect,
  onBlockSelect,
  onBlockDelete,
  onBlockDuplicate,
  onAddBlockToColumn,
}: {
  section: Section;
  isSelected: boolean;
  selectedBlocks: string[];
  onSelect: () => void;
  onBlockSelect: (blockId: string, e: React.MouseEvent) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockDuplicate: (blockId: string) => void;
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
    data: { type: "section", sectionId: section.id },
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      marginLeft: (section.settings.marginLeft as number) ?? 0,
      marginRight: (section.settings.marginRight as number) ?? 0,
    }),
    [transform, transition, isDragging, section.settings],
  );

  const sortedColumns = useMemo(
    () => sortByKeyFn(section.columns),
    [section.columns],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border-2 transition-colors",
        isSelected
          ? "border-builder-selected"
          : "border-transparent hover:border-builder-hover",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className={cn(
          "absolute -left-3 top-1/2 z-10 -translate-y-1/2 cursor-grab rounded-md border bg-background p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100",
          isDragging && "cursor-grabbing",
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-12 gap-2 p-3">
        {sortedColumns.map((col) => {
          const sortedBlocks = sortByKeyFn(col.blocks);
          return (
            <DroppableColumn
              key={col.id}
              column={col}
              sectionId={section.id}
            >
              <SortableContext
                items={sortedBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedBlocks.length === 0 && (
                  <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                    Drop blocks here
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

function EmptyCanvas() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 text-center">
      <div className="mb-4 text-4xl text-muted-foreground/40">+</div>
      <p className="text-lg font-medium text-muted-foreground">
        Drag blocks here or click + to add a section
      </p>
    </div>
  );
}

interface CanvasProps {
  siteId: string;
  pageId: string;
}

function sortByKeyFn<T extends { sortKey: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0,
  );
}

export function Canvas({ siteId, pageId }: CanvasProps) {
  const sections = useBuilderStore((s) => s.sections);
  const selection = useBuilderStore((s) => s.selection);
  const selectedIds = useBuilderStore((s) => s.selectedIds);
  const viewport = useBuilderStore((s) => s.viewport);
  const zoom = useBuilderStore((s) => s.zoom);
  const showGrid = useBuilderStore((s) => s.showGrid);
  const gridSize = useBuilderStore((s) => s.gridSize);
  const isPanning = useBuilderStore((s) => s.isPanning);
  const panOffset = useBuilderStore((s) => s.panOffset);
  const reorderSections = useBuilderStore((s) => s.reorderSections);
  const select = useBuilderStore((s) => s.select);
  const toggleSelection = useBuilderStore((s) => s.toggleSelection);
  const clearSelection = useBuilderStore((s) => s.clearSelection);
  const addBlock = useBuilderStore((s) => s.addBlock);
  const deleteBlock = useBuilderStore((s) => s.deleteBlock);
  const duplicateBlock = useBuilderStore((s) => s.duplicateBlock);
  const moveBlock = useBuilderStore((s) => s.moveBlock);
  const setPanOffset = useBuilderStore((s) => s.setPanOffset);
  const setIsPanning = useBuilderStore((s) => s.setIsPanning);
  const addSection = useBuilderStore((s) => s.addSection);
  const nudgeBlock = useBuilderStore((s) => s.nudgeBlock);

  const [activeId, setActiveId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const spaceHeldRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedSections = useMemo(
    () => sortByKeyFn(sections),
    [sections],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over || active.id === over.id) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      if (activeData?.type === "section" && overData?.type === "section") {
        const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
        const newIndex = sortedSections.findIndex((s) => s.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderSections(oldIndex, newIndex);
        }
      } else if (activeData?.type === "block") {
        const fromSectionId = activeData.sectionId;
        const fromColumnId = activeData.columnId;
        let toSectionId = fromSectionId;
        let toColumnId = fromColumnId;
        let newIndex = 0;

        if (overData?.type === "column") {
          toSectionId = overData.sectionId;
          toColumnId = overData.columnId;
          const targetSection = sections.find((s) => s.id === toSectionId);
          const targetColumn = targetSection?.columns.find((c) => c.id === toColumnId);
          newIndex = targetColumn ? targetColumn.blocks.length : 0;
        } else if (overData?.type === "block") {
          toSectionId = overData.sectionId;
          toColumnId = overData.columnId;
          const targetSection = sections.find((s) => s.id === toSectionId);
          const targetColumn = targetSection?.columns.find((c) => c.id === toColumnId);
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
            newIndex,
          );
        }
      }
    },
    [sortedSections, reorderSections, moveBlock, sections],
  );

  const handleDragStart = useCallback((event: DragEndEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleCanvasClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleBlockSelect = useCallback(
    (blockId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey) {
        toggleSelection(blockId, "block");
      } else {
        select(blockId, "block");
      }
    },
    [select, toggleSelection],
  );

  const handleAddBlockToColumn = useCallback(
    (columnId: string) => {
      const lastSection = sortedSections[sortedSections.length - 1];
      if (!lastSection) {
        addSection("container");
        return;
      }
      const col = lastSection.columns.find((c) => c.id === columnId);
      if (col) {
        addBlock(lastSection.id, columnId, "text");
      }
    },
    [sortedSections, addSection, addBlock],
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const state = useBuilderStore.getState();
      const sel = state.selection;
      if (!sel) return;

      // Arrow key nudge
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && sel.type === "block") {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;
        for (const s of state.sections) {
          for (const c of s.columns) {
            const block = c.blocks.find((b) => b.id === sel.id);
            if (block) {
              nudgeBlock(s.id, c.id, sel.id, dx, dy);
              return;
            }
          }
        }
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (sel.type === "section") {
          state.deleteSection(sel.id);
        } else if (sel.type === "block") {
          for (const s of state.sections) {
            for (const c of s.columns) {
              if (c.blocks.find((b) => b.id === sel.id)) {
                state.deleteBlock(s.id, c.id, sel.id);
                return;
              }
            }
          }
        }
      }

      // Escape
      if (e.key === "Escape") {
        clearSelection();
      }

      // Duplicate on Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (sel.type === "section") {
          state.duplicateSection(sel.id);
        } else if (sel.type === "block") {
          for (const s of state.sections) {
            for (const c of s.columns) {
              if (c.blocks.find((b) => b.id === sel.id)) {
                duplicateBlock(s.id, c.id, sel.id);
                return;
              }
            }
          }
        }
      }

      // Space for pan mode
      if (e.key === " " && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        spaceHeldRef.current = true;
        document.body.style.cursor = "grab";
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === " ") {
        spaceHeldRef.current = false;
        document.body.style.cursor = "";
        setIsPanning(false);
      }
    }

    function handleMouseDown(e: MouseEvent) {
      if (spaceHeldRef.current) {
        setIsPanning(true);
        document.body.style.cursor = "grabbing";
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
        document.body.style.cursor = "";
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [clearSelection, nudgeBlock, duplicateBlock, setPanOffset, setIsPanning]);

  const sectionIds = useMemo(
    () => sortedSections.map((s) => s.id),
    [sortedSections],
  );

  return (
    <div
      ref={canvasRef}
      className={cn(
        "builder-canvas flex-1 overflow-hidden",
        isPanning && "cursor-grabbing",
      )}
      onClick={handleCanvasClick}
    >
      <div
        className="mx-auto min-h-full origin-top transition-transform"
        style={{
          maxWidth:
            viewport === "desktop"
              ? "100%"
              : viewport === "tablet"
                ? "810px"
                : "390px",
          transform: `scale(${zoom / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          padding: viewport === "desktop" ? "0" : "0 0 40px",
          backgroundImage: showGrid
            ? `radial-gradient(circle, hsl(var(--builder-grid)) 1px, transparent 1px)`
            : undefined,
          backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : undefined,
        }}
      >
        {sortedSections.length === 0 ? (
          <EmptyCanvas />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sectionIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="mx-auto space-y-4 p-6" style={{ maxWidth: 1200 }}>
                {sortedSections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    isSelected={
                      selection?.type === "section" &&
                      selection.id === section.id
                    }
                    selectedBlocks={selectedIds}
                    onSelect={() => select(section.id, "section")}
                    onBlockSelect={handleBlockSelect}
                    onBlockDelete={(blockId) => {
                      for (const c of section.columns) {
                        if (c.blocks.find((b) => b.id === blockId)) {
                          deleteBlock(section.id, c.id, blockId);
                          return;
                        }
                      }
                    }}
                    onBlockDuplicate={(blockId) => {
                      for (const c of section.columns) {
                        if (c.blocks.find((b) => b.id === blockId)) {
                          duplicateBlock(section.id, c.id, blockId);
                          return;
                        }
                      }
                    }}
                    onAddBlockToColumn={(columnId) =>
                      handleAddBlockToColumn(columnId)
                    }
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId && (
                <div className="rounded-lg border bg-card p-3 shadow-lg opacity-90 rotate-2">
                  <span className="text-sm">Moving...</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
