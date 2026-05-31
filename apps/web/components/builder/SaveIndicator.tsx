"use client";

import { useBuilderStore } from "@/lib/builder/store";

export function SaveIndicator() {
  const isDirty = useBuilderStore((s) => s.isDirty);
  const lastSaved = useBuilderStore((s) => (s as any).lastSaved) as
    | string
    | null;

  if (!lastSaved && !isDirty) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="size-2 rounded-full bg-green-500" />
        <span className="text-green-600 dark:text-green-400">Saved</span>
      </div>
    );
  }

  if (isDirty) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="size-2 rounded-full bg-red-500" />
        <span className="text-red-600 dark:text-red-400">
          Unsaved changes
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="size-2 rounded-full bg-green-500" />
      <span className="text-green-600 dark:text-green-400">Saved</span>
      {lastSaved && (
        <span className="text-muted-foreground">
          {new Date(lastSaved).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
