import { Block } from './block';

export interface SeoSettings {
  title?: string;
  description?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

export interface PageSettings {
  fullWidth?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  customCSS?: string;
  customJS?: string;
  seo?: SeoSettings;
}

export interface Column {
  id: string;
  sectionId: string;
  gridRow: number;
  gridCol: number;
  span: number;
  sortOrder: number;
  settings: Record<string, any>;
  blocks: Block[];
}

export interface Section {
  id: string;
  pageId: string;
  sectionType: string;
  sortOrder: number;
  settings: Record<string, any>;
  responsive?: Record<string, { visible?: boolean; settings?: Record<string, any> }>;
  columns: Column[];
}

export interface Page {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  isHome: boolean;
  pageSettings: PageSettings;
  metadata: Record<string, any>;
  sections: Section[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
