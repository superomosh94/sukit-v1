'use client';

import { useRef, useState } from 'react';
import {
  useBuilderStore,
  useBuilderActions,
  registerAllBlocks,
} from '@sukit/visual-builder';
import {
  BuilderToolbar,
  BuilderCanvas,
  BlockPalette,
  LayerPanel,
  PropertyPanel,
} from '@sukit/visual-builder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { useHotkeys } from '@/hooks/useHotkeys';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
  Image,
} from 'lucide-react';

const SiteTreeComponent = dynamic(
  () => import('@sukit/site-manager').then((m) => ({ default: m.SiteTree })),
  { ssr: false }
);
const MediaLibraryComponent = dynamic(
  () =>
    import('@sukit/media-library').then((m) => ({ default: m.MediaLibrary })),
  { ssr: false }
);

export function BuilderEditor({
  siteId,
  pageId,
}: {
  siteId: string;
  pageId: string;
}) {
  const fullscreen = useBuilderStore((s) => s.fullscreen);
  const leftSidebarOpen = useBuilderStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useBuilderStore((s) => s.rightSidebarOpen);
  const setLeftSidebarOpen = useBuilderStore((s) => s.setLeftSidebarOpen);
  const setRightSidebarOpen = useBuilderStore((s) => s.setRightSidebarOpen);
  const actions = useBuilderActions();
  const [leftTab, setLeftTab] = useState('blocks');

  // Wire up global hotkeys
  useHotkeys(
    {
      'mod+z': () => actions.undo(),
      'mod+shift+z': () => actions.redo(),
      'mod+y': () => actions.redo(),
      'mod+c': () => actions.copySelection(),
      'mod+v': () => actions.pasteClipboard(),
    },
    true
  );

  // Initialize store with IDs and lazy-load block registration on mount
  const initialized = useRef<boolean | null>(null);
  if (initialized.current == null) {
    useBuilderStore.setState({
      siteId,
      pageId,
      pageTitle: 'Untitled Page',
    });
    registerAllBlocks();
    initialized.current = true;
  }

  // Fullscreen mode: canvas only
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <BuilderCanvas siteId={siteId} pageId={pageId} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <BuilderToolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Blocks & Layers */}
        {leftSidebarOpen ? (
          <aside className="w-64 shrink-0 border-r bg-card flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 pt-2">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                Components
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => setLeftSidebarOpen(false)}
                title="Close sidebar"
              >
                <PanelLeftClose className="size-3.5" />
              </Button>
            </div>
            <Tabs
              value={leftTab}
              onValueChange={setLeftTab}
              className="flex flex-col flex-1"
            >
              <TabsList className="mx-3 mt-1 grid w-auto grid-cols-4">
                <TabsTrigger value="blocks" className="text-xs">
                  Blocks
                </TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">
                  Layers
                </TabsTrigger>
                <TabsTrigger value="pages" className="text-xs">
                  <Globe className="size-3 mr-1" />
                  Pages
                </TabsTrigger>
                <TabsTrigger value="media" className="text-xs">
                  <Image className="size-3 mr-1" />
                  Media
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="blocks"
                className="flex-1 overflow-hidden mt-0 pt-2"
              >
                <BlockPalette />
              </TabsContent>
              <TabsContent
                value="layers"
                className="flex-1 overflow-hidden mt-0 pt-2"
              >
                <LayerPanel />
              </TabsContent>
              <TabsContent
                value="pages"
                className="flex-1 overflow-hidden mt-0 pt-0"
              >
                <SiteTreeComponent />
              </TabsContent>
              <TabsContent
                value="media"
                className="flex-1 overflow-hidden mt-0 pt-0"
              >
                <MediaLibraryComponent />
              </TabsContent>
            </Tabs>
          </aside>
        ) : (
          <div className="flex shrink-0 items-start border-r bg-card pt-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 mx-1"
              onClick={() => setLeftSidebarOpen(true)}
              title="Open sidebar"
            >
              <PanelLeftOpen className="size-3.5" />
            </Button>
          </div>
        )}

        {/* Center - Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden bg-builder-canvas">
          <BuilderCanvas siteId={siteId} pageId={pageId} />
        </main>

        {/* Right Sidebar - Properties */}
        {rightSidebarOpen ? (
          <aside className="w-72 shrink-0 border-l bg-card flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 pt-2">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                Properties
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => setRightSidebarOpen(false)}
                title="Close sidebar"
              >
                <PanelRightClose className="size-3.5" />
              </Button>
            </div>
            <PropertyPanel />
          </aside>
        ) : (
          <div className="flex shrink-0 items-start border-l bg-card pt-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 mx-1"
              onClick={() => setRightSidebarOpen(true)}
              title="Open sidebar"
            >
              <PanelRightOpen className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
