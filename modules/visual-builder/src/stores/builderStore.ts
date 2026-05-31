import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BuilderStore,
  Section,
  Column,
  Block,
  PageSettings,
  BuilderSnapshot,
  BuilderTemplate,
  VersionEntry,
} from '../types';
import { validateBlock, validateSection, validatePage } from '../validators';

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
      showOutlines: false,
      gridSize: 20,
      snapToGrid: false,
      snapDistance: 8,
      fullscreen: false,
      isPanning: false,
      isResizing: false,
      panOffset: { x: 0, y: 0 },
      history: { past: [], future: [] },
      customBreakpoints: { tablet: 810, phone: 390 },
      templates: [],
      versionHistory: [],
      isPublished: false,
      lastPublishedSnapshot: null,
      isOffline: false,
      debugMode: false,
      builderTheme: 'system',
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      showPadding: false,
      showMargin: false,
      showBorderRadius: false,
      themeColors: [
        '#0f172a',
        '#1e293b',
        '#334155',
        '#475569',
        '#ef4444',
        '#f97316',
        '#eab308',
        '#22c55e',
        '#06b6d4',
        '#3b82f6',
        '#6366f1',
        '#a855f7',
        '#ec4899',
        '#ffffff',
        '#f8fafc',
        '#f1f5f9',
      ],

      // Meta
      siteId: null as string | null,
      pageId: null as string | null,
      pageTitle: '',
      isDirty: false,
      lastSaved: null as string | null,

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

      reorderColumns: (
        sectionId: string,
        fromIndex: number,
        toIndex: number
      ) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        const updated = sections.map((s) => {
          if (s.id !== sectionId) return s;
          const sorted = sortByKey(s.columns);
          const [moved] = sorted.splice(fromIndex, 1);
          sorted.splice(toIndex, 0, moved);
          const prevKey = toIndex > 0 ? sorted[toIndex - 1].sortKey : null;
          const nextKey =
            toIndex < sorted.length - 1 ? sorted[toIndex + 1].sortKey : null;
          moved.sortKey = generateKeyBetween(prevKey, nextKey);
          return { ...s, columns: sorted };
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

      addBlock: (sectionId: string, columnId: string, blockType: string) => {
        const { sections, snapToGrid, gridSize } = get();
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
              const validation = validateBlock(newBlock);
              if (!validation.success) {
                console.warn('Block validation failed:', validation.error);
              }
              newBlock.sortKey = generateKeyBetween(prevKey, null);
              if (snapToGrid && gridSize > 0) {
                const styles = newBlock.styles as Record<string, number>;
                if (styles.marginLeft != null) {
                  styles.marginLeft =
                    Math.round(Number(styles.marginLeft) / gridSize) * gridSize;
                }
                if (styles.marginTop != null) {
                  styles.marginTop =
                    Math.round(Number(styles.marginTop) / gridSize) * gridSize;
                }
              }
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
        const snapshot = takeSnapshot(sections, get().pageSettings);
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

        set({
          sections: updated,
          isDirty: true,
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
        });
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
        const { clipboard, sections, selection } = get();
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
          return;
        }

        if (clipboard.blocks.length > 0) {
          let targetSectionId: string | null = null;
          let targetColumnId: string | null = null;
          let insertAfterId: string | null = null;

          if (selection?.type === 'section') {
            targetSectionId = selection.id;
          } else if (selection?.type === 'block') {
            for (const s of sections) {
              for (const c of s.columns) {
                if (c.blocks.find((b) => b.id === selection.id)) {
                  targetSectionId = s.id;
                  targetColumnId = c.id;
                  insertAfterId = selection.id;
                  break;
                }
              }
              if (targetSectionId) break;
            }
          } else if (sections.length > 0) {
            targetSectionId = sections[0].id;
          }

          if (!targetSectionId) return;

          const updated = sections.map((s) => {
            if (s.id !== targetSectionId) return s;
            return {
              ...s,
              columns: s.columns.map((c) => {
                if (targetColumnId && c.id !== targetColumnId) return c;
                if (!targetColumnId && c !== s.columns[0]) return c;
                const sorted = sortByKey(c.blocks);
                const idx = insertAfterId
                  ? sorted.findIndex((b) => b.id === insertAfterId)
                  : sorted.length - 1;
                const prevKey = idx >= 0 ? sorted[idx].sortKey : null;
                const nextKey =
                  idx + 1 < sorted.length ? sorted[idx + 1].sortKey : null;
                const clones = clipboard.blocks.map((b) => ({
                  ...JSON.parse(JSON.stringify(b)),
                  id: crypto.randomUUID(),
                  sortKey: generateKeyBetween(prevKey, nextKey),
                }));
                const newBlocks = [...c.blocks];
                newBlocks.splice(idx + 1, 0, ...clones);
                return { ...c, blocks: newBlocks };
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
        }
      },

      setSections: (sections: Section[]) => {
        set({ sections, isDirty: true });
      },

      setPageSettings: (settings: PageSettings) => {
        const snapshot = takeSnapshot(get().sections, get().pageSettings);
        set({
          pageSettings: settings,
          isDirty: true,
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
        });
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
        set({ fullscreen: !get().fullscreen });
      },

      setPanOffset: (offset: { x: number; y: number }) => {
        set({ panOffset: offset });
      },

      setIsPanning: (panning: boolean) => {
        set({ isPanning: panning });
      },

      setShowOutlines: (show: boolean) => {
        set({ showOutlines: show });
      },

      setIsResizing: (resizing: boolean) => {
        set({ isResizing: resizing });
      },

      loadBlocks: (sections: Section[]) => {
        for (const s of sections) {
          const result = validateSection(s);
          if (!result.success) {
            console.warn('Section validation failed:', result.error);
          }
        }
        set({
          sections,
          history: { past: [], future: [] },
          selection: null,
          selectedIds: [],
          isDirty: false,
        });
      },

      exportBlocks: () => {
        const { sections, pageSettings } = get();
        return {
          sections: deepCloneSections(sections),
          pageSettings: JSON.parse(JSON.stringify(pageSettings)),
        };
      },

      clear: () => {
        set({
          sections: [],
          selection: null,
          selectedIds: [],
          clipboard: null,
          history: { past: [], future: [] },
          isDirty: false,
        });
      },

      selectAll: () => {
        const { sections } = get();
        const allIds: string[] = [];
        for (const s of sections) {
          allIds.push(s.id);
          for (const c of s.columns) {
            allIds.push(c.id);
            for (const b of c.blocks) {
              allIds.push(b.id);
            }
          }
        }
        set({
          selectedIds: allIds,
          selection:
            sections.length > 0
              ? { id: sections[0].id, type: 'section' as const }
              : null,
        });
      },

      setCustomBreakpoints: (breakpoints: Record<string, number>) => {
        const snapshot = takeSnapshot(get().sections, get().pageSettings);
        set({
          customBreakpoints: breakpoints,
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
        });
      },

      setColumnSpan: (sectionId: string, columnId: string, span: number) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        const updated = sections.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            columns: s.columns.map((c) =>
              c.id === columnId
                ? { ...c, span: Math.max(1, Math.min(12, span)) }
                : c
            ),
          };
        });
        set({
          sections: updated,
          isDirty: true,
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
        });
      },

      setSectionVisibility: (
        sectionId: string,
        viewport: string,
        hidden: boolean
      ) => {
        const { sections } = get();
        const snapshot = takeSnapshot(sections, get().pageSettings);
        const updated = sections.map((s) => {
          if (s.id !== sectionId) return s;
          const existing = s.responsive[viewport] ?? {};
          return {
            ...s,
            responsive: {
              ...s.responsive,
              [viewport]: { ...existing, hidden },
            },
          };
        });
        set({
          sections: updated as Section[],
          isDirty: true,
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
        });
      },

      saveCurrentAsTemplate: (name: string, category?: string) => {
        const { sections } = get();
        const template: BuilderTemplate = {
          id: crypto.randomUUID(),
          name,
          category,
          sections: JSON.parse(JSON.stringify(sections)),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ templates: [...get().templates, template] });
      },

      loadTemplate: (templateId: string) => {
        const { templates } = get();
        const template = templates.find((t) => t.id === templateId);
        if (!template) return;
        const snapshot = takeSnapshot(get().sections, get().pageSettings);
        set({
          sections: JSON.parse(JSON.stringify(template.sections)),
          selection: null,
          selectedIds: [],
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      deleteTemplate: (templateId: string) => {
        set({ templates: get().templates.filter((t) => t.id !== templateId) });
      },

      getTemplates: () => get().templates,

      saveVersion: (label: string) => {
        const { sections, pageSettings, versionHistory } = get();
        const entry: VersionEntry = {
          id: crypto.randomUUID(),
          label,
          snapshot: takeSnapshot(sections, pageSettings),
          createdAt: new Date().toISOString(),
        };
        set({ versionHistory: [...versionHistory, entry].slice(-20) });
      },

      restoreVersion: (versionId: string) => {
        const { versionHistory } = get();
        const entry = versionHistory.find((v) => v.id === versionId);
        if (!entry) return;
        const snapshot = takeSnapshot(get().sections, get().pageSettings);
        set({
          sections: JSON.parse(JSON.stringify(entry.snapshot.sections)),
          pageSettings: JSON.parse(JSON.stringify(entry.snapshot.pageSettings)),
          history: {
            past: [...get().history.past, snapshot].slice(-MAX_HISTORY),
            future: [],
          },
          isDirty: true,
        });
      },

      deleteVersion: (versionId: string) => {
        set({
          versionHistory: get().versionHistory.filter(
            (v) => v.id !== versionId
          ),
        });
      },

      getVersions: () => get().versionHistory,

      publish: () => {
        const snapshot = takeSnapshot(get().sections, get().pageSettings);
        set({
          isPublished: true,
          lastPublishedSnapshot: snapshot,
          isDirty: false,
        });
      },

      unpublish: () => {
        set({ isPublished: false });
      },

      revertToPublished: () => {
        const { lastPublishedSnapshot } = get();
        if (!lastPublishedSnapshot) return;
        set({
          sections: JSON.parse(JSON.stringify(lastPublishedSnapshot.sections)),
          pageSettings: JSON.parse(
            JSON.stringify(lastPublishedSnapshot.pageSettings)
          ),
          isDirty: true,
        });
      },

      setOffline: (offline: boolean) => {
        set({ isOffline: offline });
      },

      setDebugMode: (debug: boolean) => {
        set({ debugMode: debug });
      },

      setBuilderTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ builderTheme: theme });
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else if (theme === 'light') root.classList.remove('dark');
        else root.classList.remove('dark');
      },
      setLeftSidebarOpen: (open: boolean) => set({ leftSidebarOpen: open }),
      setRightSidebarOpen: (open: boolean) => set({ rightSidebarOpen: open }),
      setShowPadding: (show: boolean) => set({ showPadding: show }),
      setShowMargin: (show: boolean) => set({ showMargin: show }),
      setShowBorderRadius: (show: boolean) => set({ showBorderRadius: show }),
      setThemeColors: (colors: string[]) => set({ themeColors: colors }),

      addTemplateCategory: (templateId: string, category: string) => {
        set({
          templates: get().templates.map((t) =>
            t.id === templateId ? { ...t, category } : t
          ),
        });
      },

      setTemplateThumbnail: (templateId: string, url: string) => {
        set({
          templates: get().templates.map((t) =>
            t.id === templateId ? { ...t, thumbnailUrl: url } : t
          ),
        });
      },
    }),
    {
      name: 'sukit-builder-store',
      partialize: (state) => ({
        sections: state.sections,
        pageSettings: state.pageSettings,
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
