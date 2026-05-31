import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BuilderStore,
  Section,
  Column,
  Block,
  PageSettings,
  BuilderSnapshot,
} from './types';

const DEFAULT_PAGE_SETTINGS: PageSettings = {
  headHtml: '',
  pageSettings: {},
  seoSettings: {},
};

const BASE_62_DIGITS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = 62;

function digitToInt(c: string): number {
  return BASE_62_DIGITS.indexOf(c);
}

function intToDigit(d: number): string {
  return BASE_62_DIGITS[d] ?? '';
}

function validateKey(key: string): void {
  for (const c of key) {
    if (digitToInt(c) === -1)
      throw new Error(`Invalid sortKey character: ${c}`);
  }
}

function generateKeyBetween(a: string | null, b: string | null): string {
  if (a !== null) validateKey(a);
  if (b !== null) validateKey(b);
  if (a !== null && b !== null && a >= b) {
    throw new Error(`generateKeyBetween: ${a} >= ${b}`);
  }

  if (a === null && b === null) return 'a0';

  let result = '';
  let i = 0;

  while (true) {
    const digitA = a !== null && i < a.length ? digitToInt(a[i]) : 0;
    const digitB = b !== null && i < b.length ? digitToInt(b[i]) : BASE;

    if (digitB - digitA > 1) {
      const mid = Math.floor((digitA + digitB) / 2);
      return result + intToDigit(mid);
    }

    if (digitB - digitA === 1) {
      result += intToDigit(digitA);
      i++;
      continue;
    }

    if (a !== null && i >= a.length) {
      if (b !== null && i < b.length && digitB > 1) {
        const mid = Math.floor(digitB / 2);
        return result + intToDigit(mid);
      }
      if (b !== null && i >= b.length) {
        result += intToDigit(Math.floor(BASE / 2));
        return result;
      }
      result += '0';
      i++;
      continue;
    }

    result += intToDigit(digitA);
    i++;
  }
}

function sortByKey<T extends { sortKey: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  );
}

function createBlock(blockType: string): Block {
  return {
    id: crypto.randomUUID(),
    blockType,
    sortKey: '',
    props: {},
    styles: {},
    responsive: {},
    animation: {
      type: 'none',
      duration: 300,
      delay: 0,
      easing: 'ease-out',
      cascadeLevel: 0,
    },
  };
}

function createColumn(span: number): Column {
  return {
    id: crypto.randomUUID(),
    sectionId: '',
    gridRow: 1,
    gridCol: 1,
    span,
    sortKey: '',
    settings: {},
    blocks: [],
  };
}

function createSection(sectionType: string): Section {
  const col = createColumn(12);
  col.sectionId = '';
  const section: Section = {
    id: crypto.randomUUID(),
    pageId: '',
    sectionType,
    sortKey: '',
    settings: {
      backgroundColor: 'transparent',
      paddingTop: 40,
      paddingBottom: 40,
      paddingLeft: 16,
      paddingRight: 16,
      maxWidth: 1200,
    },
    responsive: {},
    columns: [col],
  };
  col.sectionId = section.id;
  return section;
}

function deepCloneSections(sections: Section[]): Section[] {
  return JSON.parse(JSON.stringify(sections));
}

function takeSnapshot(
  sections: Section[],
  pageSettings: PageSettings
): BuilderSnapshot {
  return {
    sections: deepCloneSections(sections),
    pageSettings: JSON.parse(JSON.stringify(pageSettings)),
  };
}

function findBlock(
  sections: Section[],
  blockId: string
): { section: Section; column: Column; block: Block } | null {
  for (const s of sections) {
    for (const c of s.columns) {
      const block = c.blocks.find((b) => b.id === blockId);
      if (block) return { section: s, column: c, block };
    }
  }
  return null;
}

const MAX_HISTORY = 50;

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      // State
      sections: [],
      pageSettings: DEFAULT_PAGE_SETTINGS,
      selection: null,
      selectedIds: [],
      clipboard: null,
      viewport: 'desktop',
      zoom: 100,
      showGrid: false,
      gridSize: 20,
      snapToGrid: false,
      snapDistance: 8,
      fullscreen: false,
      isPanning: false,
      panOffset: { x: 0, y: 0 },
      history: { past: [], future: [] },

      // Meta
      siteId: null as string | null,
      pageId: null as string | null,
      pageTitle: '',
      isDirty: false,
      lastSaved: null as string | null,
      isSaving: false,
      isLoading: false,
      loadingMessage: null as string | null,
      sceneVersion: crypto.randomUUID().slice(0, 8),
      remoteSceneVersion: null as string | null,

      // Sections CRUD
      addSection: (sectionType: string, afterId?: string) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        const sorted = sortByKey(sections);
        let prevKey: string | null = null;
        let nextKey: string | null = null;

        if (afterId) {
          const afterIndex = sorted.findIndex((s) => s.id === afterId);
          if (afterIndex >= 0) {
            prevKey = sorted[afterIndex].sortKey;
            nextKey =
              afterIndex + 1 < sorted.length
                ? sorted[afterIndex + 1].sortKey
                : null;
          } else {
            prevKey =
              sorted.length > 0 ? sorted[sorted.length - 1].sortKey : null;
          }
        } else {
          prevKey =
            sorted.length > 0 ? sorted[sorted.length - 1].sortKey : null;
        }

        const section = createSection(sectionType);
        section.sortKey = generateKeyBetween(prevKey, nextKey);

        set({
          sections: [...sections, section],
          selection: { id: section.id, type: 'section' },
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      deleteSection: (sectionId: string) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        set({
          sections: sections.filter((s) => s.id !== sectionId),
          selection: get().selection?.id === sectionId ? null : get().selection,
          selectedIds: get().selectedIds.filter((id) => id !== sectionId),
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      duplicateSection: (sectionId: string) => {
        const { sections } = get();
        const sorted = sortByKey(sections);
        const idx = sorted.findIndex((s) => s.id === sectionId);
        if (idx < 0) return;
        const snapshot = takeSnapshot(sections, get().pageSettings);
        const source = sorted[idx];
        const clone: Section = JSON.parse(JSON.stringify(source));
        clone.id = crypto.randomUUID();
        clone.pageId = source.pageId;
        const prevKey = source.sortKey;
        const nextKey =
          idx + 1 < sorted.length ? sorted[idx + 1].sortKey : null;
        clone.sortKey = generateKeyBetween(prevKey, nextKey);

        set({
          sections: [...sections, clone],
          selection: { id: clone.id, type: 'section' },
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      reorderSections: (fromIndex: number, toIndex: number) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        const sorted = sortByKey(sections);
        const [moved] = sorted.splice(fromIndex, 1);
        sorted.splice(toIndex, 0, moved);
        const prevKey = toIndex > 0 ? sorted[toIndex - 1].sortKey : null;
        const nextKey =
          toIndex < sorted.length - 1 ? sorted[toIndex + 1].sortKey : null;
        moved.sortKey = generateKeyBetween(prevKey, nextKey);

        set({
          sections: sorted,
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      addBlock: (sectionId: string, columnId: string, blockType: string) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        const updated = sections.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            columns: s.columns.map((c) => {
              if (c.id !== columnId) return c;
              const sorted = sortByKey(c.blocks);
              const prevKey =
                sorted.length > 0 ? sorted[sorted.length - 1].sortKey : null;
              const newBlock = createBlock(blockType);
              newBlock.sortKey = generateKeyBetween(prevKey, null);
              return { ...c, blocks: [...c.blocks, newBlock] };
            }),
          };
        });

        set({
          sections: updated,
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      updateBlock: (
        sectionId: string,
        columnId: string,
        blockId: string,
        updates: Partial<Block>
      ) => {
        const { sections } = get();
        const updated = sections.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            columns: s.columns.map((c) => {
              if (c.id !== columnId) return c;
              return {
                ...c,
                blocks: c.blocks.map((b) =>
                  b.id === blockId ? { ...b, ...updates } : b
                ),
              };
            }),
          };
        });

        set({ sections: updated, isDirty: true });
      },

      deleteBlock: (sectionId: string, columnId: string, blockId: string) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        const updated = sections.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            columns: s.columns.map((c) => {
              if (c.id !== columnId) return c;
              return {
                ...c,
                blocks: c.blocks.filter((b) => b.id !== blockId),
              };
            }),
          };
        });

        set({
          sections: updated,
          selectedIds: get().selectedIds.filter((id) => id !== blockId),
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      duplicateBlock: (
        sectionId: string,
        columnId: string,
        blockId: string
      ) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        const updated = sections.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            columns: s.columns.map((c) => {
              if (c.id !== columnId) return c;
              const sorted = sortByKey(c.blocks);
              const idx = sorted.findIndex((b) => b.id === blockId);
              if (idx < 0) return c;
              const source = sorted[idx];
              const clone: Block = JSON.parse(JSON.stringify(source));
              clone.id = crypto.randomUUID();
              const prevKey = source.sortKey;
              const nextKey =
                idx + 1 < sorted.length ? sorted[idx + 1].sortKey : null;
              clone.sortKey = generateKeyBetween(prevKey, nextKey);
              const blocks = [...c.blocks];
              const insertIdx = blocks.findIndex((b) => b.id === blockId) + 1;
              blocks.splice(insertIdx, 0, clone);
              return { ...c, blocks };
            }),
          };
        });

        set({
          sections: updated,
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      moveBlock: (
        blockId: string,
        from: { sectionId: string; columnId: string },
        to: { sectionId: string; columnId: string },
        newIndex: number
      ) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        let movedBlock: Block | null = null;

        let sectionsWithout = sections.map((s) => ({
          ...s,
          columns: s.columns.map((c) => {
            if (s.id === from.sectionId && c.id === from.columnId) {
              const idx = c.blocks.findIndex((b) => b.id === blockId);
              if (idx >= 0) {
                const blocks = [...c.blocks];
                const [moved] = blocks.splice(idx, 1);
                movedBlock = moved;
                return { ...c, blocks };
              }
            }
            return c;
          }),
        }));

        if (movedBlock) {
          sectionsWithout = sectionsWithout.map((s) => ({
            ...s,
            columns: s.columns.map((c) => {
              if (s.id === to.sectionId && c.id === to.columnId) {
                const sorted = sortByKey(c.blocks);
                const prevKey =
                  newIndex > 0
                    ? sorted[Math.min(newIndex - 1, sorted.length - 1)].sortKey
                    : null;
                const nextKey =
                  newIndex < sorted.length
                    ? sorted[Math.min(newIndex, sorted.length - 1)].sortKey
                    : null;
                movedBlock!.sortKey = generateKeyBetween(prevKey, nextKey);
                const blocks = [...c.blocks];
                blocks.splice(newIndex, 0, movedBlock!);
                return { ...c, blocks };
              }
              return c;
            }),
          }));
        }

        set({
          sections: sectionsWithout,
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      select: (id: string, type: 'section' | 'column' | 'block') => {
        const { selection } = get();
        if (selection?.id === id && selection?.type === type) return;
        set({ selection: { id, type }, selectedIds: [id] });
      },

      clearSelection: () => {
        set({ selection: null, selectedIds: [] });
      },

      toggleSelection: (id: string, type: 'section' | 'column' | 'block') => {
        const { selectedIds, selection } = get();
        if (selectedIds.includes(id)) {
          const filtered = selectedIds.filter((sid) => sid !== id);
          set({
            selectedIds: filtered,
            selection: filtered.length > 0 ? { id: filtered[0], type } : null,
          });
        } else {
          set({
            selectedIds: [...selectedIds, id],
            selection: { id, type },
          });
        }
      },

      nudgeBlock: (
        sectionId: string,
        columnId: string,
        blockId: string,
        dx: number,
        dy: number
      ) => {
        const { sections, snapToGrid, gridSize } = get();
        const found = findBlock(sections, blockId);
        if (!found) return;
        const { block } = found;
        const currentX = (block.styles.marginLeft as number) ?? 0;
        const currentY = (block.styles.marginTop as number) ?? 0;
        let newX = currentX + dx;
        let newY = currentY + dy;
        if (snapToGrid) {
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }
        get().updateBlock(sectionId, columnId, blockId, {
          styles: { ...block.styles, marginLeft: newX, marginTop: newY },
        });
      },

      undo: () => {
        const { history } = get();
        if (history.past.length === 0) return;
        const current = takeSnapshot(get().sections, get().pageSettings);
        const previous = history.past[history.past.length - 1];

        set({
          sections: previous.sections,
          pageSettings: previous.pageSettings,
          history: {
            past: history.past.slice(0, -1),
            future: [current, ...history.future].slice(0, MAX_HISTORY),
          },
          isDirty: true,
        });
      },

      redo: () => {
        const { history } = get();
        if (history.future.length === 0) return;
        const current = takeSnapshot(get().sections, get().pageSettings);
        const next = history.future[0];

        set({
          sections: next.sections,
          pageSettings: next.pageSettings,
          history: {
            past: [...history.past, current].slice(-MAX_HISTORY),
            future: history.future.slice(1),
          },
          isDirty: true,
        });
      },

      setViewport: (viewport) => {
        set({ viewport });
      },

      setZoom: (zoom: number) => {
        set({ zoom: Math.max(10, Math.min(500, zoom)) });
      },

      copySelection: () => {
        const { sections, selection } = get();
        if (!selection) return;

        if (selection.type === 'section') {
          const section = sections.find((s) => s.id === selection.id);
          if (section) {
            set({ clipboard: { sections: [section], blocks: [] } });
          }
        } else if (selection.type === 'block') {
          for (const s of sections) {
            for (const c of s.columns) {
              const block = c.blocks.find((b) => b.id === selection.id);
              if (block) {
                set({ clipboard: { sections: [], blocks: [block] } });
                return;
              }
            }
          }
        }
      },

      pasteClipboard: () => {
        const { clipboard, sections } = get();
        if (!clipboard) return;
        const snapshot = takeSnapshot(sections, get().pageSettings);

        if (clipboard.sections.length > 0) {
          const sorted = sortByKey(sections);
          const prevKey =
            sorted.length > 0 ? sorted[sorted.length - 1].sortKey : null;
          const clones = clipboard.sections.map((s) => ({
            ...JSON.parse(JSON.stringify(s)),
            id: crypto.randomUUID(),
            sortKey: generateKeyBetween(prevKey, null),
          }));
          set({
            sections: [...sections, ...clones],
            history: {
              past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
              future: [],
            },
            isDirty: true,
          });
        }
      },

      setSections: (sections: Section[]) => {
        set({ sections, isDirty: true });
      },

      setPageSettings: (settings: PageSettings) => {
        set({ pageSettings: settings, isDirty: true });
      },

      setShowGrid: (show: boolean) => {
        set({ showGrid: show });
      },

      setGridSize: (size: number) => {
        set({ gridSize: Math.max(4, Math.min(64, size)) });
      },

      setSnapToGrid: (snap: boolean) => {
        set({ snapToGrid: snap });
      },

      setSnapDistance: (distance: number) => {
        set({ snapDistance: Math.max(2, Math.min(20, distance)) });
      },

      setFullscreen: (fs: boolean) => {
        set({ fullscreen: fs });
      },

      toggleFullscreen: () => {
        const fs = !get().fullscreen;
        set({ fullscreen: fs });
        try {
          if (fs) {
            document.documentElement.requestFullscreen();
          } else {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            }
          }
        } catch (e) {
          console.warn('Fullscreen API not available:', e);
        }
      },

      setPanOffset: (offset: { x: number; y: number }) => {
        set({ panOffset: offset });
      },

      setIsPanning: (panning: boolean) => {
        set({ isPanning: panning });
      },

      setIsSaving: (saving: boolean) => {
        set({ isSaving: saving });
      },

      setIsLoading: (loading: boolean, message?: string) => {
        set({ isLoading: loading, loadingMessage: message ?? null });
      },

      abortPendingSaves: () => {
        if ((get() as any)._abortController) {
          (get() as any)._abortController.abort();
          set({ _abortController: null, isSaving: false });
        }
      },
    }),
    {
      name: 'sukit-builder-store',
      partialize: (state) => ({
        sections: state.sections,
        pageSettings: state.pageSettings,
        lastSaved: state.lastSaved,
        sceneVersion: state.sceneVersion,
        remoteSceneVersion: state.remoteSceneVersion,
        isDirty: state.isDirty,
        isSaving: state.isSaving,
        isLoading: state.isLoading,
        loadingMessage: state.loadingMessage,
        zoom: state.zoom,
        viewport: state.viewport,
        showGrid: state.showGrid,
        showOutlines: state.showOutlines,
        gridSize: state.gridSize,
        snapToGrid: state.snapToGrid,
        customBreakpoints: state.customBreakpoints,
        templates: state.templates,
        versionHistory: state.versionHistory,
        isPublished: state.isPublished,
        lastPublishedSnapshot: state.lastPublishedSnapshot,
        builderTheme: state.builderTheme,
        leftSidebarOpen: state.leftSidebarOpen,
        rightSidebarOpen: state.rightSidebarOpen,
        showPadding: state.showPadding,
        showMargin: state.showMargin,
        showBorderRadius: state.showBorderRadius,
        themeColors: state.themeColors,
      }),
    }
  )
);
