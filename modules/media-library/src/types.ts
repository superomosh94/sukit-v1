import type { ReactNode } from 'react';

export type ViewMode = 'grid' | 'list';
export type FileTypeFilter = 'all' | 'image' | 'video' | 'document';
export type SortField =
  | 'name'
  | 'date'
  | 'size'
  | 'type'
  | 'dimensions'
  | 'uploader';
export type SortOrder = 'asc' | 'desc';
export type MediaStatus = 'active' | 'trashed';

export interface MediaAsset {
  id: string;
  siteId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  alt?: string;
  caption?: string;
  description?: string;
  copyright?: string;
  credit?: string;
  folderId?: string;
  tags: string[];
  isFavorited: boolean;
  variants: MediaVariant[];
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  trashedAt?: string;
  metadata?: Record<string, unknown>;
  thumbnailUrl?: string;
  url?: string;
  focusPoint?: FocusPoint;
}

export interface MediaVariant {
  id: string;
  assetId: string;
  type: VariantType;
  width: number;
  height: number;
  size: number;
  path: string;
}

export type VariantType =
  | 'original'
  | 'webp'
  | 'avif'
  | 'thumbnail'
  | 'small'
  | 'medium'
  | 'large'
  | 'xl';

export interface MediaFolder {
  id: string;
  siteId: string;
  name: string;
  parentId?: string;
  children: MediaFolder[];
  assetCount: number;
  createdBy: string;
  createdAt: string;
}

export interface MediaTag {
  id: string;
  siteId: string;
  name: string;
  assetCount: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FocusPoint {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface ImageFilter {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
}

export interface OptimizeOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'original';
  width?: number;
  height?: number;
  stripMetadata?: boolean;
}

export interface PickerOptions {
  multiple?: boolean;
  fileTypes?: FileTypeFilter[];
  onSelect?: (asset: MediaAsset | MediaAsset[]) => void;
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  loaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface SavedSearch {
  id: string;
  siteId: string;
  name: string;
  filters: { type: FileTypeFilter; tags: string[]; search: string };
  sortBy: SortField;
  sortOrder: SortOrder;
  createdAt: string;
}

export interface UsageRecord {
  pageId: string;
  blockId?: string;
  property?: string;
  usedAt: string;
}

export interface FolderNode {
  id: string;
  name: string;
  parentId?: string;
}

export interface MediaStore {
  assets: MediaAsset[];
  selectedIds: string[];
  currentFolder: string | null;
  currentAsset: MediaAsset | null;
  viewMode: ViewMode;
  folders: MediaFolder[];
  tags: MediaTag[];
  trash: MediaAsset[];
  uploadQueue: UploadProgress[];
  filters: { type: FileTypeFilter; tags: string[]; search: string };
  sortBy: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  thumbnailSize: 'small' | 'medium' | 'large';
  dateRange: { from: Date | null; to: Date | null };
  uploaderFilter: string | null;
  sizeRange: { min: number | null; max: number | null };

  // Upload
  uploadFiles: (files: File[], folderId?: string) => Promise<void>;
  uploadFromUrl: (url: string, folderId?: string) => Promise<MediaAsset | null>;
  cancelUpload: (fileId: string) => void;
  pauseUpload: (fileId: string) => void;
  resumeUpload: (fileId: string) => void;
  retryUpload: (fileId: string) => Promise<void>;
  clearCompletedUploads: () => void;

  // CRUD
  loadAssets: (folderId?: string) => Promise<void>;
  getAsset: (id: string) => Promise<MediaAsset | null>;
  updateAsset: (id: string, data: Partial<MediaAsset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  permanentlyDeleteAsset: (id: string) => Promise<void>;
  restoreAsset: (id: string) => Promise<void>;
  duplicateAsset: (
    id: string,
    newFilename?: string
  ) => Promise<MediaAsset | null>;
  setCurrentAsset: (id: string | null) => void;

  // Bulk
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkPermanentDelete: (ids: string[]) => Promise<void>;
  bulkRestore: (ids: string[]) => Promise<void>;
  bulkMove: (ids: string[], folderId: string) => Promise<void>;
  bulkAddTags: (ids: string[], tags: string[]) => Promise<void>;
  bulkRemoveTags: (ids: string[], tags: string[]) => Promise<void>;
  bulkEditAltText: (ids: string[], altText: string) => Promise<void>;
  bulkEditCaption: (ids: string[], caption: string) => Promise<void>;
  bulkFavorite: (ids: string[]) => Promise<void>;
  bulkUnfavorite: (ids: string[]) => Promise<void>;
  bulkDownload: (ids: string[]) => Promise<Blob | null>;

  // Selection
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  invertSelection: () => void;
  selectRange: (startId: string, endId: string) => void;
  selectAllInFolder: () => void;

  // Folders
  createFolder: (
    name: string,
    parentId?: string
  ) => Promise<MediaFolder | null>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveFolder: (id: string, newParentId: string) => Promise<void>;
  loadFolders: () => Promise<void>;
  setCurrentFolder: (id: string | null) => void;

  // Tags
  createTag: (name: string) => Promise<MediaTag | null>;
  updateTag: (id: string, data: Partial<MediaTag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  loadTags: () => Promise<void>;
  getTagsForAsset: (assetId: string) => Promise<MediaTag[]>;

  // Favorites
  toggleFavorite: (assetId: string) => Promise<void>;
  loadFavorites: () => Promise<void>;

  // Editing
  cropAsset: (id: string, crop: CropArea) => Promise<MediaAsset | null>;
  resizeAsset: (
    id: string,
    width: number,
    height: number
  ) => Promise<MediaAsset | null>;
  rotateAsset: (
    id: string,
    degrees: 90 | 180 | 270
  ) => Promise<MediaAsset | null>;
  flipAsset: (
    id: string,
    direction: 'horizontal' | 'vertical'
  ) => Promise<MediaAsset | null>;
  applyFilter: (id: string, filter: ImageFilter) => Promise<MediaAsset | null>;
  resetEdits: (assetId: string) => Promise<MediaAsset | null>;

  setFocusPoint: (id: string, point: FocusPoint) => void;
  autoStraighten: (id: string) => Promise<MediaAsset | null>;
  smartCrop: (
    id: string,
    aspectRatio: string | number,
    focusPoint?: FocusPoint
  ) => Promise<MediaAsset | null>;

  // Optimization
  optimizeAsset: (
    id: string,
    options: OptimizeOptions
  ) => Promise<MediaVariant | null>;
  generateVariants: (id: string) => Promise<MediaVariant[]>;
  bulkOptimize: (
    ids: string[],
    format?: string,
    quality?: number
  ) => Promise<void>;
  batchOptimize: (
    ids: string[],
    format?: string,
    quality?: number
  ) => Promise<void>;

  // URLs
  getUrl: (id: string, variant?: VariantType) => string;
  getSrcSet: (id: string) => string;
  copyUrl: (id: string, format: 'direct' | 'markdown' | 'html') => string;

  // Search & filters
  searchAssets: (query: string) => Promise<void>;
  setFilterType: (type: FileTypeFilter) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterDateRange: (from: Date | null, to: Date | null) => void;
  setFilterUploader: (userId: string | null) => void;
  setFilterSize: (min: number | null, max: number | null) => void;
  setSortBy: (field: SortField) => void;
  toggleSortOrder: () => void;
  clearFilters: () => void;
  setThumbnailSize: (size: 'small' | 'medium' | 'large') => void;

  // Pagination
  loadMoreAssets: () => Promise<void>;

  // Trash
  loadTrash: () => Promise<void>;
  emptyTrash: () => Promise<void>;

  // Picker (for Visual Builder integration)
  openPicker: (
    options: PickerOptions
  ) => Promise<MediaAsset | MediaAsset[] | null>;

  // Visual Builder
  insertIntoBlock: (
    asset: MediaAsset,
    blockId: string,
    property: string
  ) => void;
  setAsBackground: (asset: MediaAsset, sectionId: string) => void;

  // Drag state
  draggingAsset: MediaAsset | null;
  getRecentUploads: () => MediaAsset[];
  onDragStart: (asset: MediaAsset) => void;
  onDragEnd: () => void;

  // Usage tracking
  getUsage: (assetId: string) => Promise<UsageRecord[]>;
  trackUsage: (
    assetId: string,
    pageId: string,
    blockId?: string,
    property?: string
  ) => Promise<void>;

  // Saved searches
  saveSearch: (name: string) => Promise<void>;
  loadSavedSearch: (searchId: string) => Promise<void>;
  getSavedSearches: () => Promise<SavedSearch[]>;

  // Events
  eventHandlers: Map<string, Set<(payload: any) => void>>;
  on: (event: string, handler: (payload: any) => void) => void;
  off: (event: string, handler: (payload: any) => void) => void;
  emit: (event: string, data: Record<string, unknown>) => Promise<void>;

  // UI
  setViewMode: (mode: ViewMode) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}
