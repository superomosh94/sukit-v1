import type { ComponentType, ReactNode } from 'react';
import type { z } from 'zod';

export type DeviceViewport = 'desktop' | 'tablet' | 'phone';

export type EnterAnimationType =
  | 'fadeIn'
  | 'slideUp'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'rotateIn'
  | 'flipIn'
  | 'typewriter';

export interface EnterAnimationConfig {
  type: EnterAnimationType;
  duration: number;
  delay: number;
  easing: string;
  cascadeLevel: 'block' | 'column' | 'section' | 'page';
  staggerDelay?: number;
}

export type CSSHoverPreset =
  | 'none'
  | 'lift'
  | 'shadow'
  | 'scale'
  | 'glow'
  | 'color'
  | 'underline';
export type ShaderHoverPreset = 'none' | 'ripple' | 'rgb-shift' | 'pixelate';

export interface HoverEffectConfig {
  cssPreset: CSSHoverPreset;
  shaderPreset: ShaderHoverPreset;
  shaderSpeed?: number;
  shaderSmoothness?: number;
}

export interface Animation {
  type: EnterAnimationType | 'none';
  duration: number;
  delay: number;
  easing: string;
  cascadeLevel: number;
}

export interface ResponsiveOverrides {
  [viewport: string]: Partial<
    Block['props'] & Block['styles'] & { hidden: boolean }
  >;
}

export interface Block {
  id: string;
  blockType: string;
  sortKey: string;
  props: Record<string, unknown>;
  styles: Record<string, string | number>;
  responsive: ResponsiveOverrides;
  animation: Animation;
  children?: Block[];
}

export interface Column {
  id: string;
  sectionId: string;
  gridRow: number;
  gridCol: number;
  span: number;
  sortKey: string;
  settings: Record<string, unknown>;
  blocks: Block[];
}

export interface Section {
  id: string;
  pageId: string;
  sectionType: string;
  sortKey: string;
  settings: Record<string, unknown>;
  responsive: ResponsiveOverrides;
  columns: Column[];
}

export interface PageSettings {
  headHtml: string;
  pageSettings: Record<string, unknown>;
  seoSettings: Record<string, unknown>;
}

export interface Metadata {
  title: string;
  description: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical?: string;
}

export interface Page {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  isHome: boolean;
  pageSettings: PageSettings;
  metadata: Metadata;
  sections: Section[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    headingFont: string;
    borderRadius: number;
  };
  typography: Record<string, unknown>;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    favicon: string;
  };
  domain: {
    custom: string | null;
    subdomain: string;
  };
  code: {
    head: string;
    body: string;
  };
}

export interface Site {
  id: string;
  name: string;
  domain: string;
  settings: SiteSettings;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'user' | 'admin';
}

export interface Media {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

export interface Form {
  id: string;
  siteId: string;
  name: string;
  fields: Record<string, unknown>[];
  settings: Record<string, unknown>;
}

export interface Module {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  settings: Record<string, unknown>;
}

export interface BlockPropSchema {
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'color'
    | 'image'
    | 'select'
    | 'multi-select'
    | 'rich-text'
    | 'code'
    | 'object'
    | 'array'
    | 'slot'
    | 'event';
  label: string;
  required?: boolean;
  default?: unknown;
  options?: { label: string; value: string }[];
  placeholder?: string;
  description?: string;
  group?: string;
}

export interface BlockSchema {
  type: string;
  properties: Record<string, z.ZodTypeAny>;
}

export interface BlockRegistration {
  type: string;
  label: string;
  description?: string;
  category: 'layout' | 'content' | 'media' | 'forms' | 'advanced';
  icon: string;
  schema: Record<string, BlockPropSchema>;
  defaultProps: Record<string, unknown>;
  defaultStyles: Record<string, string | number>;
  defaultAnimation?: EnterAnimationConfig;
  defaultHoverEffect?: HoverEffectConfig;
  Component: ComponentType<{ block: Block; children?: ReactNode }>;
  EditorComponent?: ComponentType<{
    block: Block;
    onChange: (updates: Partial<Block>) => void;
  }>;
  templates?: Record<
    string,
    { props: Record<string, unknown>; styles: Record<string, string | number> }
  >;
}

export interface SiteConfig {
  id: string;
  name: string;
  typography: {
    headingFont: string;
    bodyFont: string;
    headingSizes: Record<string, number>;
    bodySize: number;
    lineHeight: number;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    muted: string;
  };
  grid: {
    columns: number;
    gap: number;
    maxWidth: number;
    containerPadding: number;
  };
}

export interface VersionEntry {
  id: string;
  label: string;
  snapshot: BuilderSnapshot;
  createdAt: string;
}

export interface BuilderTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface BuilderState {
  sections: Section[];
  pageSettings: PageSettings;
  selection: { id: string; type: 'section' | 'column' | 'block' } | null;
  selectedIds: string[];
  clipboard: { sections: Section[]; blocks: Block[] } | null;
  viewport: DeviceViewport;
  zoom: number;
  showGrid: boolean;
  showOutlines: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapDistance: number;
  fullscreen: boolean;
  isPanning: boolean;
  isResizing: boolean;
  panOffset: { x: number; y: number };
  history: { past: BuilderSnapshot[]; future: BuilderSnapshot[] };
  siteId: string | null;
  pageId: string | null;
  pageTitle: string;
  isDirty: boolean;
  lastSaved: string | null;
  customBreakpoints: Record<string, number>;
  templates: BuilderTemplate[];
  versionHistory: VersionEntry[];
  isPublished: boolean;
  lastPublishedSnapshot: BuilderSnapshot | null;
  isOffline: boolean;
  debugMode: boolean;
  builderTheme: 'light' | 'dark' | 'system';
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  showPadding: boolean;
  showMargin: boolean;
  showBorderRadius: boolean;
  themeColors: string[];
}

export interface BuilderSnapshot {
  sections: Section[];
  pageSettings: PageSettings;
}

export interface BuilderActions {
  addSection: (sectionType: string, afterId?: string) => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  reorderColumns: (
    sectionId: string,
    fromIndex: number,
    toIndex: number
  ) => void;
  addBlock: (sectionId: string, columnId: string, blockType: string) => void;
  updateBlock: (
    sectionId: string,
    columnId: string,
    blockId: string,
    updates: Partial<Block>
  ) => void;
  deleteBlock: (sectionId: string, columnId: string, blockId: string) => void;
  duplicateBlock: (
    sectionId: string,
    columnId: string,
    blockId: string
  ) => void;
  moveBlock: (
    blockId: string,
    from: { sectionId: string; columnId: string },
    to: { sectionId: string; columnId: string },
    newIndex: number
  ) => void;
  select: (id: string, type: 'section' | 'column' | 'block') => void;
  clearSelection: () => void;
  toggleSelection: (id: string, type: 'section' | 'column' | 'block') => void;
  nudgeBlock: (
    sectionId: string,
    columnId: string,
    blockId: string,
    dx: number,
    dy: number
  ) => void;
  undo: () => void;
  redo: () => void;
  setViewport: (viewport: DeviceViewport) => void;
  setZoom: (zoom: number) => void;
  copySelection: () => void;
  pasteClipboard: () => void;
  setSections: (sections: Section[]) => void;
  setPageSettings: (settings: PageSettings) => void;
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setSnapDistance: (distance: number) => void;
  setFullscreen: (fs: boolean) => void;
  toggleFullscreen: () => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setIsPanning: (panning: boolean) => void;
  setShowOutlines: (show: boolean) => void;
  setIsResizing: (resizing: boolean) => void;
  loadBlocks: (sections: Section[]) => void;
  exportBlocks: () => BuilderSnapshot;
  clear: () => void;
  selectAll: () => void;
  setCustomBreakpoints: (breakpoints: Record<string, number>) => void;
  setColumnSpan: (sectionId: string, columnId: string, span: number) => void;
  setSectionVisibility: (
    sectionId: string,
    viewport: string,
    hidden: boolean
  ) => void;
  saveCurrentAsTemplate: (name: string, category?: string) => void;
  loadTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;
  getTemplates: () => BuilderTemplate[];
  saveVersion: (label: string) => void;
  restoreVersion: (versionId: string) => void;
  deleteVersion: (versionId: string) => void;
  getVersions: () => VersionEntry[];
  publish: () => void;
  unpublish: () => void;
  revertToPublished: () => void;
  setOffline: (offline: boolean) => void;
  setDebugMode: (debug: boolean) => void;
  setBuilderTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setShowPadding: (show: boolean) => void;
  setShowMargin: (show: boolean) => void;
  setShowBorderRadius: (show: boolean) => void;
  setThemeColors: (colors: string[]) => void;
  addTemplateCategory: (templateId: string, category: string) => void;
  setTemplateThumbnail: (templateId: string, url: string) => void;
}

export type BuilderStore = BuilderState & BuilderActions;
