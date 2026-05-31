export type SiteStatus = 'active' | 'archived' | 'trashed';
export type PageStatus = 'draft' | 'published' | 'scheduled' | 'trashed';
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type PrivacyMode = 'public' | 'private' | 'password';
export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'restore'
  | 'archive';
export type EntityType = 'site' | 'page' | 'media' | 'user' | 'team';

export interface SiteSettings {
  theme?: {
    primaryColor: string;
    fontFamily: string;
    borderRadius: number;
  };
  codeInjection?: {
    head: string;
    body: string;
    css: string;
    js: string;
    gtmId?: string;
    gaId?: string;
    fbPixelId?: string;
  };
  seo?: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage?: string;
    favicon?: string;
  };
  backups?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'manual';
    retentionDays: number;
    storage: 'local' | 's3' | 'r2';
    lastBackup?: string;
  };
  domain?: {
    custom?: string;
    subdomain?: string;
    sslEnabled: boolean;
    verified: boolean;
    redirectRules: Array<{ from: string; to: string; type: 301 | 302 }>;
    aliases: string[];
  };
}

export interface Site {
  id: string;
  name: string;
  description?: string;
  slug: string;
  logo?: string;
  favicon?: string;
  timezone: string;
  language: string;
  dateFormat: string;
  privacy: PrivacyMode;
  password?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: SiteStatus;
  archivedAt?: string;
  settings: SiteSettings;
}

export interface PageSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  jsonLd?: string;
  focusKeyphrase?: string;
}

export interface Page {
  id: string;
  siteId: string;
  parentId?: string;
  title: string;
  slug: string;
  status: PageStatus;
  publishedAt?: string;
  scheduledFor?: string;
  authorId: string;
  template: string;
  featuredImage?: string;
  excerpt?: string;
  order: number;
  showInNav: boolean;
  seo: PageSEO;
  createdAt: string;
  updatedAt: string;
  children?: Page[];
}

export interface TeamMember {
  id: string;
  userId: string;
  siteId: string;
  role: TeamRole;
  invitedBy: string;
  invitedAt: string;
  acceptedAt?: string;
  email?: string;
  name?: string;
  avatar?: string;
  permissions?: PermissionOverride[];
}

export interface PermissionOverride {
  pageId?: string;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

export interface ActivityLogEntry {
  id: string;
  siteId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  changes?: Record<string, unknown>;
  timestamp: string;
}

export interface SiteTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'blog' | 'portfolio' | 'ecommerce' | 'landing' | 'custom';
  thumbnail?: string;
  siteData: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackupEntry {
  id: string;
  siteId: string;
  filename: string;
  size: number;
  type: 'automatic' | 'manual';
  createdAt: string;
  createdBy: string;
  status: 'completed' | 'failed' | 'in_progress';
}

export interface NotificationPreference {
  email: boolean;
  push: boolean;
  inApp: boolean;
  slack?: string;
  discord?: string;
  webhook?: string;
}

export interface SiteSearchResult {
  type: 'site' | 'page';
  id: string;
  siteId?: string;
  siteName?: string;
  title: string;
  subtitle?: string;
  matchField: string;
  matchPreview?: string;
  url: string;
}

export interface SiteStats {
  totalPages: number;
  totalBlocks: number;
  totalMedia: number;
  totalTeamMembers: number;
  storageUsed: number;
  storageLimit: number;
  publishedPages: number;
  draftPages: number;
  trashedPages: number;
  recentActivity: ActivityLogEntry[];
  topContributors: Array<{ userId: string; name: string; edits: number }>;
  performanceScore?: number;
  seoScore?: number;
  accessibilityScore?: number;
}

export interface CreateSiteInput {
  name: string;
  description?: string;
  language?: string;
  timezone?: string;
  template?: string;
}

export interface CreatePageInput {
  siteId: string;
  parentId?: string;
  title: string;
  slug?: string;
  template?: string;
  status?: PageStatus;
}

export interface EventPayload {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  userId: string;
}

export type EventHandler = (payload: EventPayload) => void | Promise<void>;

// Store types
export interface SiteManagerStore {
  sites: Site[];
  currentSiteId: string | null;
  currentSite: Site | null;
  pages: Page[];
  currentPageId: string | null;
  currentPage: Page | null;
  team: TeamMember[];
  activity: ActivityLogEntry[];
  stats: SiteStats | null;
  searchResults: SiteSearchResult[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Site actions
  loadSites: () => Promise<void>;
  createSite: (input: CreateSiteInput) => Promise<Site | null>;
  updateSite: (siteId: string, data: Partial<Site>) => Promise<void>;
  deleteSite: (siteId: string, permanent?: boolean) => Promise<void>;
  restoreSite: (siteId: string) => Promise<void>;
  archiveSite: (siteId: string) => Promise<void>;
  setCurrentSite: (siteId: string) => Promise<void>;
  duplicateSite: (siteId: string) => Promise<Site | null>;

  // Page actions
  loadPages: (siteId: string) => Promise<void>;
  createPage: (input: CreatePageInput) => Promise<Page | null>;
  updatePage: (pageId: string, data: Partial<Page>) => Promise<void>;
  deletePage: (pageId: string, permanent?: boolean) => Promise<void>;
  restorePage: (pageId: string) => Promise<void>;
  duplicatePage: (pageId: string) => Promise<Page | null>;
  reorderPages: (
    pageId: string,
    parentId: string | null,
    order: number
  ) => Promise<void>;
  setCurrentPage: (pageId: string) => void;

  // Team actions
  loadTeam: (siteId: string) => Promise<void>;
  inviteMember: (
    siteId: string,
    email: string,
    role: TeamRole
  ) => Promise<void>;
  updateMemberRole: (memberId: string, role: TeamRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  transferOwnership: (siteId: string, userId: string) => Promise<void>;

  // Activity
  loadActivity: (siteId: string, limit?: number) => Promise<void>;
  logActivity: (
    entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>
  ) => Promise<void>;

  // Search
  search: (query: string, siteId?: string) => Promise<void>;

  // Stats
  loadStats: (siteId: string) => Promise<void>;

  // Templates
  loadTemplates: () => Promise<void>;
  saveAsTemplate: (
    siteId: string,
    name: string,
    category?: string
  ) => Promise<void>;
  applyTemplate: (siteId: string, templateId: string) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;

  // Backups
  createBackup: (siteId: string) => Promise<void>;
  loadBackups: (siteId: string) => Promise<BackupEntry[]>;
  restoreBackup: (siteId: string, backupId: string) => Promise<void>;
  downloadBackup: (siteId: string, backupId: string) => Promise<void>;

  // Import/Export
  exportSite: (
    siteId: string,
    options?: { includeMedia?: boolean; encrypt?: boolean }
  ) => Promise<string>;
  importSite: (
    data: string,
    options?: { overwrite?: boolean }
  ) => Promise<Site | null>;

  // Events
  eventHandlers: Map<string, Set<EventHandler>>;
  on: (event: string, handler: EventHandler) => void;
  off: (event: string, handler: EventHandler) => void;
  emit: (event: string, data: Record<string, unknown>) => Promise<void>;

  // UI state
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;

  // Bulk operations
  bulkPublishPages: (pageIds: string[]) => Promise<void>;
  bulkDeletePages: (pageIds: string[]) => Promise<void>;
  bulkMovePages: (
    pageIds: string[],
    newParentId: string | null
  ) => Promise<void>;

  // Revisions
  loadRevisions: (pageId: string) => Promise<any[]>;
  restoreRevision: (pageId: string, revisionId: string) => Promise<void>;

  // SEO
  analyzeSEO: (page: Page) => {
    score: number;
    issues: Array<{ type: 'error' | 'warning' | 'pass'; message: string }>;
  };

  // Webhooks
  loadWebhooks: (siteId: string) => Promise<any[]>;
  createWebhook: (
    siteId: string,
    data: { name: string; url: string; events: string[] }
  ) => Promise<void>;
  deleteWebhook: (siteId: string, webhookId: string) => Promise<void>;
}
