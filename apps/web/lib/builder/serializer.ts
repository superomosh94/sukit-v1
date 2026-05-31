import type { Section, PageSettings } from "./types";

const SCENE_VERSION = 2;

export interface SceneDocument {
  version: number;
  sceneVersion: string;
  createdAt: string;
  sections: Array<{
    id: string;
    sectionType: string;
    sortKey: string;
    settings: Record<string, unknown>;
    responsive: Record<string, unknown>;
    columns: Array<{
      id: string;
      span: number;
      sortKey: string;
      settings: Record<string, unknown>;
      blocks: Array<{
        id: string;
        blockType: string;
        sortKey: string;
        props: Record<string, unknown>;
        styles: Record<string, string | number>;
        responsive: Record<string, unknown>;
        animation: Record<string, unknown>;
      }>;
    }>;
  }>;
  pageSettings: PageSettings;
}

export function stateToDocument(state: {
  sections: Section[];
  pageSettings: PageSettings;
}): string {
  const doc: SceneDocument = {
    version: SCENE_VERSION,
    sceneVersion: crypto.randomUUID().slice(0, 8),
    createdAt: new Date().toISOString(),
    sections: state.sections.map((s) => ({
      id: s.id,
      sectionType: s.sectionType,
      sortKey: s.sortKey,
      settings: s.settings,
      responsive: s.responsive as Record<string, unknown>,
      columns: s.columns.map((c) => ({
        id: c.id,
        span: c.span,
        sortKey: c.sortKey,
        settings: c.settings,
        blocks: c.blocks.map((b) => ({
          id: b.id,
          blockType: b.blockType,
          sortKey: b.sortKey,
          props: b.props,
          styles: b.styles,
          responsive: b.responsive as Record<string, unknown>,
          animation: b.animation as unknown as Record<string, unknown>,
        })),
      })),
    })),
    pageSettings: state.pageSettings,
  };

  return JSON.stringify(doc, null, 2);
}

export function documentToState(
  json: string,
): { sections: Section[]; pageSettings: PageSettings } | null {
  try {
    const doc = JSON.parse(json);
    if (!doc.version || !Array.isArray(doc.sections)) return null;

    const sections: Section[] = doc.sections.map((s: Record<string, unknown>) => ({
      id: (s.id as string) ?? crypto.randomUUID(),
      pageId: "",
      sectionType: s.sectionType as string,
      sortKey: (s.sortKey as string) ?? '',
      settings: (s.settings as Record<string, unknown>) ?? {},
      responsive: (s.responsive as Record<string, unknown>) ?? {},
      columns: ((s.columns as Record<string, unknown>[]) ?? []).map(
        (c: Record<string, unknown>) => ({
          id: (c.id as string) ?? crypto.randomUUID(),
          sectionId: "",
          gridRow: 1,
          gridCol: 1,
          span: (c.span as number) ?? 12,
          sortKey: (c.sortKey as string) ?? '',
          settings: (c.settings as Record<string, unknown>) ?? {},
          blocks: ((c.blocks as Record<string, unknown>[]) ?? []).map(
            (b: Record<string, unknown>) => ({
              id: (b.id as string) ?? crypto.randomUUID(),
              blockType: b.blockType as string,
              sortKey: (b.sortKey as string) ?? '',
              props: (b.props as Record<string, unknown>) ?? {},
              styles: (b.styles as Record<string, string | number>) ?? {},
              responsive: (b.responsive as Record<string, unknown>) ?? {},
              animation: (b.animation as Record<string, unknown>) ?? {
                type: "none",
                duration: 300,
                delay: 0,
                easing: "ease-out",
                cascadeLevel: 0,
              },
            }),
          ),
        }),
      ),
    }));

    sections.forEach((s) => {
      s.columns.forEach((c) => {
        c.sectionId = s.id;
      });
    });

    return {
      sections,
      pageSettings: (doc.pageSettings as PageSettings) ?? {
        headHtml: "",
        pageSettings: {},
        seoSettings: {},
      },
    };
  } catch {
    return null;
  }
}

export function migrateDocument(json: string): string {
  try {
    const doc = JSON.parse(json);
    let version = doc.version ?? 1;

    if (version === 1) {
      const sections = (doc.sections ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        sortKey: s.sortKey ?? (s.sortOrder !== undefined ? String(s.sortOrder as number) : ''),
        sortOrder: undefined,
        columns: ((s.columns as Record<string, unknown>[]) ?? []).map(
          (c: Record<string, unknown>) => ({
            ...c,
            sortKey: c.sortKey ?? (c.sortOrder !== undefined ? String(c.sortOrder as number) : ''),
            sortOrder: undefined,
            blocks: ((c.blocks as Record<string, unknown>[]) ?? []).map(
              (b: Record<string, unknown>) => ({
                ...b,
                sortKey: b.sortKey ?? (b.sortOrder !== undefined ? String(b.sortOrder as number) : ''),
                sortOrder: undefined,
              }),
            ),
          }),
        ),
      }));
      doc.sections = sections;
      doc.version = SCENE_VERSION;
      version = SCENE_VERSION;
    }

    return JSON.stringify(doc, null, 2);
  } catch {
    return json;
  }
}

export function compressForExport(state: {
  sections: Section[];
  pageSettings: PageSettings;
}): string {
  const doc = stateToDocument(state);
  if (typeof btoa !== "undefined") return btoa(doc);
  return Buffer.from(doc).toString("base64");
}

export function decompressImport(
  base64: string,
): { sections: Section[]; pageSettings: PageSettings } | null {
  try {
    let json: string;
    if (typeof atob !== "undefined") {
      json = atob(base64);
    } else {
      json = Buffer.from(base64, "base64").toString("utf-8");
    }
    const migrated = migrateDocument(json);
    return documentToState(migrated);
  } catch {
    return null;
  }
}
