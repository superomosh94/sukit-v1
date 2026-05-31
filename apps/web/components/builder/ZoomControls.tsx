"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/lib/builder/store";

export function ZoomControls() {
  const zoom = useBuilderStore((s) => s.zoom);
  const setZoom = useBuilderStore((s) => s.setZoom);

  return (
    <div className="flex items-center gap-1 rounded-md border bg-background p-0.5 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => setZoom(zoom - 10)}
        disabled={zoom <= 25}
        title="Zoom Out"
      >
        <ZoomOut className="size-3.5" />
      </Button>
      <span className="flex w-12 items-center justify-center text-xs tabular-nums">
        {zoom}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => setZoom(zoom + 10)}
        disabled={zoom >= 200}
        title="Zoom In"
      >
        <ZoomIn className="size-3.5" />
      </Button>
      <div className="mx-0.5 h-5 w-px bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => setZoom(100)}
        title="Fit to Screen"
      >
        <Maximize2 className="size-3.5" />
      </Button>
    </div>
  );
}
