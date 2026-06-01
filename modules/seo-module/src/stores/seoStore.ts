import { create } from 'zustand';

export interface SeoAnalysisIssue {
  type: 'error' | 'warning' | 'pass';
  message: string;
  recommendation?: string;
}

export interface MetaTagData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  canonical: string;
  robots: string;
}

export interface SchemaMarkup {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface SeoStore {
  score: number;
  issues: SeoAnalysisIssue[];
  meta: MetaTagData;
  schemas: SchemaMarkup[];
  previewUrl: string;
  setScore: (score: number) => void;
  setIssues: (issues: SeoAnalysisIssue[]) => void;
  setMeta: (meta: Partial<MetaTagData>) => void;
  addSchema: (type: string) => void;
  updateSchema: (id: string, data: Partial<SchemaMarkup>) => void;
  removeSchema: (id: string) => void;
  setPreviewUrl: (url: string) => void;
}

export const useSeoStore = create<SeoStore>()((set, get) => ({
  score: 0,
  issues: [],
  meta: {
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary',
    canonical: '',
    robots: 'index, follow',
  },
  schemas: [],
  previewUrl: '',

  setScore: (score) => set({ score }),
  setIssues: (issues) => set({ issues }),
  setMeta: (meta) => set((s) => ({ meta: { ...s.meta, ...meta } })),
  addSchema: (type) => {
    const newSchema: SchemaMarkup = {
      id: `schema-${Date.now()}`,
      type,
      data: {},
    };
    set((s) => ({ schemas: [...s.schemas, newSchema] }));
  },
  updateSchema: (id, data) =>
    set((s) => ({
      schemas: s.schemas.map((sc) => (sc.id === id ? { ...sc, ...data } : sc)),
    })),
  removeSchema: (id) =>
    set((s) => ({ schemas: s.schemas.filter((sc) => sc.id !== id) })),
  setPreviewUrl: (url) => set({ previewUrl: url }),
}));
