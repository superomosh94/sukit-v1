"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { blockRegistry } from "@/lib/builder/block-registry";
import type { BlockRegistration } from "@/lib/builder/types";
import { cn } from "@/lib/utils/cn";

const CATEGORIES = ["All", "Layout", "Content", "Media", "Forms", "Advanced"];

function DraggableBlockCard({ block }: { block: BlockRegistration }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `block-${block.type}`,
      data: { type: block.type },
    });

  const style = useMemo(
    () =>
      transform
        ? {
            transform: `translate(${transform.x}px, ${transform.y}px)`,
            zIndex: 999,
          }
        : undefined,
    [transform],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex cursor-grab flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-center text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        isDragging && "opacity-50 shadow-lg",
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <span className="text-lg">{block.icon}</span>
      </div>
      <span className="text-xs font-medium">{block.label}</span>
    </div>
  );
}

export function BlockPalette() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const blocks = useMemo(() => {
    const all = blockRegistry.getAllBlockTypes();
    return all.filter((b) => {
      const matchesCategory =
        category === "All" || b.category === category;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        b.label.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-1 border-b px-3 py-2 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              category === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {blocks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No blocks found
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {blocks.map((block) => (
              <DraggableBlockCard key={block.type} block={block} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
