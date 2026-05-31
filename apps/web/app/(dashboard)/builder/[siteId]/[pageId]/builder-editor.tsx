"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/lib/builder/store";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useBuilderActions } from "@/hooks/useBuilder";
import { CanvasHeader } from "@/components/builder/CanvasHeader";
import { Canvas } from "@/components/builder/Canvas";
import { BlockPalette } from "@/components/builder/BlockPalette";
import { LayerPanel } from "@/components/builder/LayerPanel";
import { PropertyPanel } from "@/components/builder/PropertyPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export function BuilderEditor({
  siteId,
  pageId,
}: {
  siteId: string;
  pageId: string;
}) {
  const fullscreen = useBuilderStore((s) => s.fullscreen);
  const actions = useBuilderActions();
  const [leftTab, setLeftTab] = useState("blocks");

  // Wire up global hotkeys
  useHotkeys(
    {
      "mod+z": () => actions.undo(),
      "mod+shift+z": () => actions.redo(),
      "mod+y": () => actions.redo(),
      "mod+c": () => actions.copySelection(),
      "mod+v": () => actions.pasteClipboard(),
    },
    true,
  );

  // Initialize store with IDs on mount
  useEffect(() => {
    useBuilderStore.setState({
      siteId,
      pageId,
      pageTitle: "Untitled Page",
    });
  }, [siteId, pageId]);

  // Fullscreen mode: canvas only
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <Canvas siteId={siteId} pageId={pageId} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <CanvasHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Blocks & Layers */}
        <aside className="w-64 shrink-0 border-r bg-card flex flex-col overflow-hidden">
          <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col flex-1">
            <TabsList className="mx-3 mt-2 grid w-auto grid-cols-2">
              <TabsTrigger value="blocks" className="text-xs">Blocks</TabsTrigger>
              <TabsTrigger value="layers" className="text-xs">Layers</TabsTrigger>
            </TabsList>
            <TabsContent value="blocks" className="flex-1 overflow-hidden mt-0 pt-2">
              <BlockPalette />
            </TabsContent>
            <TabsContent value="layers" className="flex-1 overflow-hidden mt-0 pt-2">
              <LayerPanel />
            </TabsContent>
          </Tabs>
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden bg-builder-canvas">
          <Canvas siteId={siteId} pageId={pageId} />
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-72 shrink-0 border-l bg-card flex flex-col overflow-hidden">
          <PropertyPanel />
        </aside>
      </div>
    </div>
  );
}
