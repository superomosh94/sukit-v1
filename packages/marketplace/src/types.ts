import type { ComponentType, ReactNode } from 'react';

// ─── Module Registry Types (Category 1) ──────────────────────────

export type PriceModel = 'free' | 'one-time' | 'subscription' | 'tiered';
export type ModuleStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'resubmitted'
  | 'deprecated';
export type ModuleCategory =
  | 'ecommerce'
  | 'seo'
  | 'forms'
  | 'analytics'
  | 'media'
  | 'social'
  | 'marketing'
  | 'content'
  | 'performance'
  | 'security'
  | 'ai'
  | 'automation'
  | 'integration'
  | 'theme'
  | 'tool'
  | 'other';

export interface MarketplaceModuleData {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  version: string;
  authorId: string;
  authorName: string;
  category: ModuleCategory;
  tags: string[];
  price: number | null;
  priceModel: PriceModel;
  subscriptionPriceMonthly: number | null;
  subscriptionPriceYearly: number | null;
  downloads: number;
  rating: number;
  ratingCount: number;
  screenshots: string[];
  icon: string | null;
  banner: string | null;
  documentation: string | null;
  changelog: string | null;
  minSukitVersion: string;
  maxSukitVersion: string | null;
  sukCompatibleVersions: string[];
  dependencies: Record<string, string> | null;
  permissions: string[];
  status: ModuleStatus;
  featured: boolean;
  staffPick: boolean;
  trendingScore: number;
  demoUrl: string | null;
  supportUrl: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  versions?: ModuleVersionData[];
}

export interface ModuleVersionData {
  id: string;
  moduleId: string;
  version: string;
  changelog: string | null;
  downloadUrl: string;
  fileSize: number;
  sukVersion: string;
  isLatest: boolean;
  isDeprecated: boolean;
  isSecurityFix: boolean;
  isBeta: boolean;
  downloads: number;
  createdAt: string;
}

export interface ModuleDependency {
  moduleId: string;
  name: string;
  version: string;
  optional: boolean;
}

export interface ModuleSearchOptions {
  query?: string;
  category?: ModuleCategory;
  tags?: string[];
  priceModel?: PriceModel;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  sukVersion?: string;
  sortBy?:
    | 'relevance'
    | 'downloads'
    | 'rating'
    | 'newest'
    | 'price'
    | 'trending';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ModuleSearchResult {
  modules: MarketplaceModuleData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  suggestions?: string[];
}

// ─── Install Types (Category 2) ──────────────────────────────────

export type InstallStatus =
  | 'idle'
  | 'downloading'
  | 'extracting'
  | 'validating'
  | 'installing_deps'
  | 'configuring'
  | 'activating'
  | 'complete'
  | 'failed'
  | 'cancelled';

export interface InstallProgress {
  status: InstallStatus;
  percent: number;
  message: string;
  log: string[];
  timeRemaining?: number;
}

export interface PermissionRequest {
  permission: string;
  label: string;
  description: string;
  required: boolean;
  granted: boolean;
}

export interface InstallOptions {
  version?: string;
  autoResolveDeps?: boolean;
  installBeta?: boolean;
  grantPermissions?: string[];
  siteId?: string;
}

export interface InstallResult {
  success: boolean;
  moduleId: string;
  version: string;
  dependencies: string[];
  errors?: string[];
  rollbackPerformed?: boolean;
}

export type InstallSource = 'marketplace' | 'cli' | 'url' | 'file';

// ─── Update Types (Category 3) ───────────────────────────────────

export interface UpdateInfo {
  moduleId: string;
  moduleName: string;
  installedVersion: string;
  latestVersion: string;
  changelog: string | null;
  fileSize: number;
  isSecurityUpdate: boolean;
  isBreaking: boolean;
  isBeta: boolean;
  publishedAt: string;
}

export interface UpdateCheckResult {
  updatesAvailable: UpdateInfo[];
  totalCount: number;
  securityCount: number;
  lastChecked: string;
}

export interface UpdateOptions {
  moduleIds?: string[];
  backup?: boolean;
  maintenanceMode?: boolean;
  scheduleAt?: string;
  batchSize?: number;
}

export type UpdateSchedule = 'immediate' | 'next_window' | 'scheduled';

// ─── Developer Portal Types (Category 7) ─────────────────────────

export type DeveloperStatus = 'pending' | 'approved' | 'suspended';
export type PayoutMethod = 'stripe' | 'paypal' | 'bank';

export interface DeveloperData {
  id: string;
  userId: string;
  email: string;
  name: string;
  companyName: string | null;
  website: string | null;
  bio: string | null;
  avatar: string | null;
  status: DeveloperStatus;
  totalEarnings: number;
  unpaidEarnings: number;
  payoutMethod: PayoutMethod | null;
  payoutEmail: string | null;
  agreementAccepted: boolean;
  approvedAt: string | null;
  createdAt: string;
}

export interface DeveloperApplication {
  name: string;
  email: string;
  website?: string;
  companyName?: string;
  bio?: string;
  reason: string;
  taxId?: string;
  payoutMethod: PayoutMethod;
  payoutEmail: string;
  agreementAccepted: boolean;
}

export interface DeveloperApiKeyData {
  id: string;
  developerId: string;
  name: string;
  key: string;
  permissions: string[];
  ipWhitelist: string[];
  rateLimit: number;
  lastUsed: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface DeveloperDashboardStats {
  totalModules: number;
  publishedModules: number;
  pendingSubmissions: number;
  totalDownloads: number;
  totalRevenue: number;
  unpaidEarnings: number;
  mrr: number;
  averageRating: number;
  reviewCount: number;
  openTickets: number;
  installsToday: number;
  installsThisWeek: number;
  installsThisMonth: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  churnRate: number;
}

// ─── Submission Types (Category 8) ───────────────────────────────

export type SubmissionStep =
  | 'basic-info'
  | 'pricing'
  | 'upload'
  | 'assets'
  | 'documentation'
  | 'review';

export interface SubmissionDraft {
  moduleId?: string;
  currentStep: SubmissionStep;
  basicInfo?: {
    name: string;
    description: string;
    category: ModuleCategory;
    tags: string[];
  };
  pricing?: {
    priceModel: PriceModel;
    price?: number;
    subscriptionMonthly?: number;
    subscriptionYearly?: number;
  };
  upload?: {
    fileUrl?: string;
    fileSize?: number;
    version?: string;
    sukVersion?: string;
  };
  assets?: {
    screenshots: string[];
    icon?: string;
    banner?: string;
    demoUrl?: string;
    supportUrl?: string;
    sourceUrl?: string;
  };
  documentation?: {
    readme?: string;
    changelog?: string;
  };
}

export interface ValidationReport {
  passed: boolean;
  checks: ValidationCheck[];
  summary: string;
  generatedAt: string;
}

export interface ValidationCheck {
  name: string;
  label: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message: string;
  details?: string;
}

export interface SecurityScanResult {
  passed: boolean;
  score: number;
  findings: SecurityFinding[];
  scannedAt: string;
}

export interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: string;
  file: string;
  line?: number;
  message: string;
  recommendation: string;
}

export interface SubmissionReviewData {
  id: string;
  moduleId: string;
  reviewerId: string;
  status:
    | 'pending'
    | 'in_review'
    | 'approved'
    | 'changes_requested'
    | 'rejected';
  notes: string | null;
  validationResults: ValidationReport | null;
  createdAt: string;
  reviewedAt: string | null;
}

// ─── Shared Store Types ──────────────────────────────────────────

export interface MarketplaceStore {
  modules: MarketplaceModuleData[];
  installedModules: ModuleInstallData[];
  searchResults: ModuleSearchResult | null;
  currentModule: MarketplaceModuleData | null;
  installProgress: InstallProgress | null;
  updatesAvailable: UpdateCheckResult | null;
  developer: DeveloperData | null;
  developerModules: MarketplaceModuleData[];
  developerStats: DeveloperDashboardStats | null;
  submissionDraft: SubmissionDraft | null;
  validationReport: ValidationReport | null;
  securityScan: SecurityScanResult | null;
  reviews: ModuleReviewData[];
  loading: Record<string, boolean>;
}

export interface ModuleInstallData {
  id: string;
  moduleId: string;
  module: MarketplaceModuleData;
  version: string;
  previousVersion: string | null;
  status: string;
  autoUpdate: boolean;
  pinnedVersion: string | null;
  installedAt: string;
  updatedAt: string;
}

export interface ModuleReviewData {
  id: string;
  moduleId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string | null;
  review: string;
  pros: string | null;
  cons: string | null;
  versionUsed: string | null;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  responses?: ReviewResponseData[];
}

export interface ReviewResponseData {
  id: string;
  reviewId: string;
  authorId: string;
  authorType: string;
  response: string;
  createdAt: string;
}

// ─── Event payloads ──────────────────────────────────────────────

export interface MarketplaceEvents {
  'marketplace:moduleInstalled': {
    moduleId: string;
    version: string;
    userId: string;
  };
  'marketplace:moduleUninstalled': { moduleId: string; userId: string };
  'marketplace:moduleUpdated': {
    moduleId: string;
    fromVersion: string;
    toVersion: string;
  };
  'marketplace:modulePublished': { moduleId: string; authorId: string };
  'marketplace:moduleRejected': { moduleId: string; reason: string };
  'marketplace:reviewSubmitted': {
    moduleId: string;
    reviewId: string;
    rating: number;
  };
  'marketplace:payoutSent': { developerId: string; amount: number };
  'marketplace:developerApproved': { developerId: string };
  'marketplace:newSupportTicket': { moduleId: string; ticketId: string };
  'marketplace:securityAlert': {
    moduleId: string;
    version: string;
    issue: string;
  };
}

// ─── UI Config Types ─────────────────────────────────────────────

export interface MarketplaceUIConfig {
  itemsPerPage: number;
  maxScreenshots: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  cacheTTL: number;
  featuredModuleCount: number;
  popularModuleCount: number;
  reviewMinLength: number;
  reviewMaxLength: number;
  trialDays: number;
  refundDays: number;
  revenueShare: number;
  minimumPayout: number;
  updateCheckInterval: number;
}

// ─── Payment Types (Category 4) ─────────────────────────────────

export type PaymentGateway =
  | 'stripe'
  | 'paypal'
  | 'paddle'
  | 'lemonsqueezy'
  | 'gumroad'
  | 'bank';
export type PaymentType = 'purchase' | 'subscription' | 'refund';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type LicenseStatus = 'active' | 'inactive' | 'expired' | 'revoked';

export interface CheckoutItem {
  moduleId: string;
  moduleName: string;
  price: number;
  quantity: number;
}

export interface CheckoutSession {
  id: string;
  items: CheckoutItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  couponCode: string | null;
  total: number;
  currency: string;
  paymentMethod: PaymentGateway | null;
}

export interface CouponData {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt: string | null;
  moduleIds?: string[];
}

export interface LicenseData {
  id: string;
  key: string;
  moduleId: string;
  moduleName: string;
  userId: string;
  status: LicenseStatus;
  activatedAt: string | null;
  expiresAt: string | null;
  domains: string[];
  maxActivations: number;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface SubscriptionData {
  id: string;
  moduleId: string;
  moduleName: string;
  userId: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  paymentMethod: string;
  createdAt: string;
}

export interface TransactionData {
  id: string;
  moduleId: string;
  moduleName: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  currency: string;
  fee: number;
  developerAmount: number;
  paymentMethod: PaymentGateway;
  paymentId: string;
  type: PaymentType;
  status: PaymentStatus;
  licenseKey: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PayoutData {
  id: string;
  developerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'sent' | 'failed';
  method: PayoutMethod;
  periodStart: string;
  periodEnd: string;
  transactionCount: number;
  sentAt: string | null;
  notes: string | null;
}

export interface PayoutSummary {
  payouts: PayoutData[];
  totalPaid: number;
  pendingAmount: number;
  nextPayoutDate: string | null;
  minimumPayout: number;
  revenueShare: number;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
  autoRefund: boolean;
  reviewedBy: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface BillingHistoryEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  invoiceUrl: string | null;
  receiptUrl: string | null;
}

// ─── Review Moderation Types (Category 5) ─────────────────────────

export type ReviewModerationStatus = 'pending' | 'approved' | 'rejected';
export type ReviewSortMode = 'recent' | 'helpful' | 'highest' | 'lowest';

export interface ReviewModerationQueue {
  pending: number;
  flagged: number;
  total: number;
}

export interface ModerationAction {
  reviewId: string;
  action: 'approve' | 'reject' | 'flag' | 'unflag';
  reason?: string;
  moderatorId: string;
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  verifiedPercentage: number;
  responseRate: number;
  averageResponseTime: number;
  topKeywords: { word: string; count: number }[];
  sentimentScore: number;
  reviewsOverTime: { date: string; count: number; average: number }[];
}

// ─── Analytics Types (Category 6) ────────────────────────────────

export interface UsageAnalytics {
  totalInstalls: number;
  activeInstalls: number;
  last30DaysInstalls: number;
  uninstalls: number;
  retentionRate: {
    day7: number;
    day30: number;
    day60: number;
    day90: number;
  };
  updateAdoption: number;
  versionDistribution: { version: string; percentage: number }[];
  sukVersionDistribution: { version: string; percentage: number }[];
  geographicDistribution: { country: string; count: number }[];
  installsByDay: { date: string; count: number }[];
  uninstallsByDay: { date: string; count: number }[];
}

export interface PerformanceAnalytics {
  loadTimeImpact: number;
  memoryUsage: number;
  errorRate: number;
  crashRate: number;
  performanceScore: number;
  resourceUsage: {
    cpu: number;
    disk: number;
    network: number;
  };
  slowQueries: { query: string; avgDuration: number; count: number }[];
  apiLatency: { endpoint: string; avgMs: number; p95Ms: number }[];
}

export interface BusinessAnalytics {
  totalRevenue: number;
  mrr: number;
  arr: number;
  averageOrderValue: number;
  conversionRate: number;
  refundRate: number;
  customerLifetimeValue: number;
  churnRate: number;
  revenueByDay: { date: string; amount: number; count: number }[];
  topCustomers: {
    userId: string;
    name: string;
    email: string;
    totalSpent: number;
    purchases: number;
  }[];
  revenueByCountry: { country: string; amount: number }[];
  mrrHistory: {
    month: string;
    mrr: number;
    newMRR: number;
    churnedMRR: number;
  }[];
}

export interface AnalyticsExportOptions {
  dateFrom: string;
  dateTo: string;
  granularity: 'day' | 'week' | 'month';
  format: 'csv' | 'json' | 'pdf';
  metrics: string[];
}

// ─── Documentation Types (Category 9) ────────────────────────────

export type DocSectionType =
  | 'readme'
  | 'installation'
  | 'configuration'
  | 'api'
  | 'blocks'
  | 'faq'
  | 'troubleshooting';

export interface DocumentSection {
  type: DocSectionType;
  title: string;
  content: string;
  order: number;
  autoGenerated: boolean;
}

export interface DocGenerationRequest {
  moduleId: string;
  sections: DocSectionType[];
  includeChangelog: boolean;
  includeScreenshots: boolean;
}

export interface DocGenerationResult {
  moduleId: string;
  sections: DocumentSection[];
  tableOfContents: { id: string; title: string; level: number }[];
  wordCount: number;
  generatedAt: string;
}

export interface ScreenshotData {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string | null;
  order: number;
  width: number;
  height: number;
  fileSize: number;
  type: 'image' | 'video' | 'gif';
  videoUrl?: string;
}

// ─── Support Types (Category 10) ─────────────────────────────────

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory =
  | 'bug'
  | 'feature'
  | 'question'
  | 'billing'
  | 'other';

export interface TicketData {
  id: string;
  moduleId: string;
  moduleName: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  attachments: string[];
  metadata: Record<string, any>;
  resolvedAt: string | null;
  satisfaction: number | null;
  createdAt: string;
  updatedAt: string;
  responses?: TicketResponseData[];
}

export interface TicketResponseData {
  id: string;
  ticketId: string;
  authorId: string;
  authorType: 'customer' | 'developer' | 'admin';
  authorName: string;
  message: string;
  attachments: string[];
  createdAt: string;
}

export interface KnowledgeBaseArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  published: boolean;
  publishedAt: string | null;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseSearchResult {
  articles: KnowledgeBaseArticleData[];
  total: number;
  query: string;
  suggestedArticles: KnowledgeBaseArticleData[];
}

export const DEFAULT_UI_CONFIG: MarketplaceUIConfig = {
  itemsPerPage: 20,
  maxScreenshots: 5,
  maxFileSize: 10 * 1024 * 1024,
  allowedFileTypes: ['zip', 'tar.gz'],
  cacheTTL: 300,
  featuredModuleCount: 8,
  popularModuleCount: 12,
  reviewMinLength: 10,
  reviewMaxLength: 5000,
  trialDays: 14,
  refundDays: 30,
  revenueShare: 0.7,
  minimumPayout: 50,
  updateCheckInterval: 86400,
};
