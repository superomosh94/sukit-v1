'use client';

import { create } from 'zustand';
import type {
  MarketplaceModuleData,
  ModuleSearchResult,
  ModuleInstallData,
  InstallProgress,
  UpdateCheckResult,
  DeveloperData,
  DeveloperDashboardStats,
  SubmissionDraft,
  ValidationReport,
  SecurityScanResult,
  ModuleReviewData,
  DeveloperApiKeyData,
  CheckoutSession,
  LicenseData,
  SubscriptionData,
  PayoutSummary,
  TicketData,
  KnowledgeBaseArticleData,
  UsageAnalytics,
  PerformanceAnalytics,
  BusinessAnalytics,
  DocumentSection,
  ScreenshotData,
} from './types';

export interface MarketplaceState {
  // Registry
  modules: MarketplaceModuleData[];
  searchResults: ModuleSearchResult | null;
  currentModule: MarketplaceModuleData | null;
  featuredModules: MarketplaceModuleData[];
  popularModules: MarketplaceModuleData[];
  categories: { category: string; count: number }[];
  searchSuggestions: string[];

  // Install
  installedModules: ModuleInstallData[];
  installProgress: InstallProgress | null;
  installingModuleId: string | null;

  // Updates
  updatesAvailable: UpdateCheckResult | null;
  updatingModules: string[];

  // Developer
  developer: DeveloperData | null;
  developerModules: MarketplaceModuleData[];
  developerStats: DeveloperDashboardStats | null;
  developerApiKeys: DeveloperApiKeyData[];
  developerNotifications: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];

  // Submission
  submissionDraft: SubmissionDraft | null;
  validationReport: ValidationReport | null;
  securityScan: SecurityScanResult | null;

  // Reviews
  reviews: ModuleReviewData[];
  reviewAnalytics: any | null;

  // Payments
  checkoutSession: CheckoutSession | null;
  licenses: LicenseData[];
  subscriptions: SubscriptionData[];
  payoutSummary: PayoutSummary | null;
  billingHistory: any[];

  // Analytics
  usageAnalytics: UsageAnalytics | null;
  performanceAnalytics: PerformanceAnalytics | null;
  businessAnalytics: BusinessAnalytics | null;

  // Documentation
  docSections: DocumentSection[];
  screenshots: ScreenshotData[];

  // Support
  supportTickets: TicketData[];
  kbArticles: KnowledgeBaseArticleData[];

  // UI
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

const initialState: MarketplaceState = {
  modules: [],
  searchResults: null,
  currentModule: null,
  featuredModules: [],
  popularModules: [],
  categories: [],
  searchSuggestions: [],
  installedModules: [],
  installProgress: null,
  installingModuleId: null,
  updatesAvailable: null,
  updatingModules: [],
  developer: null,
  developerModules: [],
  developerStats: null,
  developerApiKeys: [],
  developerNotifications: [],
  submissionDraft: null,
  validationReport: null,
  securityScan: null,
  reviews: [],
  reviewAnalytics: null,
  checkoutSession: null,
  licenses: [],
  subscriptions: [],
  payoutSummary: null,
  billingHistory: [],
  usageAnalytics: null,
  performanceAnalytics: null,
  businessAnalytics: null,
  docSections: [],
  screenshots: [],
  supportTickets: [],
  kbArticles: [],
  loading: {},
  errors: {},
};

export const useMarketplaceStore = create<MarketplaceState>()(
  () => initialState
);

// ─── Store Actions ────────────────────────────────────────────────

export function resetMarketplaceStore(): void {
  useMarketplaceStore.setState(initialState);
}

export function setLoading(key: string, value: boolean): void {
  useMarketplaceStore.setState((state) => ({
    loading: { ...state.loading, [key]: value },
  }));
}

export function setError(key: string, error: string | null): void {
  useMarketplaceStore.setState((state) => ({
    errors: { ...state.errors, [key]: error },
  }));
}

// Registry actions
export function setModules(modules: MarketplaceModuleData[]): void {
  useMarketplaceStore.setState({ modules });
}
export function setSearchResults(results: ModuleSearchResult | null): void {
  useMarketplaceStore.setState({ searchResults: results });
}
export function setCurrentModule(module: MarketplaceModuleData | null): void {
  useMarketplaceStore.setState({ currentModule: module });
}
export function setFeaturedModules(modules: MarketplaceModuleData[]): void {
  useMarketplaceStore.setState({ featuredModules: modules });
}
export function setPopularModules(modules: MarketplaceModuleData[]): void {
  useMarketplaceStore.setState({ popularModules: modules });
}
export function setCategories(
  categories: { category: string; count: number }[]
): void {
  useMarketplaceStore.setState({ categories });
}

// Install actions
export function setInstalledModules(modules: ModuleInstallData[]): void {
  useMarketplaceStore.setState({ installedModules: modules });
}
export function setInstallProgress(progress: InstallProgress | null): void {
  useMarketplaceStore.setState({ installProgress: progress });
}
export function setInstallingModuleId(id: string | null): void {
  useMarketplaceStore.setState({ installingModuleId: id });
}

// Update actions
export function setUpdatesAvailable(updates: UpdateCheckResult | null): void {
  useMarketplaceStore.setState({ updatesAvailable: updates });
}
export function setUpdatingModules(modules: string[]): void {
  useMarketplaceStore.setState({ updatingModules: modules });
}

// Developer actions
export function setDeveloper(dev: DeveloperData | null): void {
  useMarketplaceStore.setState({ developer: dev });
}
export function setDeveloperModules(modules: MarketplaceModuleData[]): void {
  useMarketplaceStore.setState({ developerModules: modules });
}
export function setDeveloperStats(stats: DeveloperDashboardStats | null): void {
  useMarketplaceStore.setState({ developerStats: stats });
}
export function setDeveloperApiKeys(keys: DeveloperApiKeyData[]): void {
  useMarketplaceStore.setState({ developerApiKeys: keys });
}

// Submission actions
export function setSubmissionDraft(draft: SubmissionDraft | null): void {
  useMarketplaceStore.setState({ submissionDraft: draft });
}
export function setValidationReport(report: ValidationReport | null): void {
  useMarketplaceStore.setState({ validationReport: report });
}
export function setSecurityScan(scan: SecurityScanResult | null): void {
  useMarketplaceStore.setState({ securityScan: scan });
}

// Review actions
export function setReviews(reviews: ModuleReviewData[]): void {
  useMarketplaceStore.setState({ reviews });
}

// Payment actions
export function setCheckoutSession(session: CheckoutSession | null): void {
  useMarketplaceStore.setState({ checkoutSession: session });
}
export function setLicenses(licenses: LicenseData[]): void {
  useMarketplaceStore.setState({ licenses });
}
export function setSubscriptions(subs: SubscriptionData[]): void {
  useMarketplaceStore.setState({ subscriptions: subs });
}
export function setPayoutSummary(summary: PayoutSummary | null): void {
  useMarketplaceStore.setState({ payoutSummary: summary });
}

// Support actions
export function setSupportTickets(tickets: TicketData[]): void {
  useMarketplaceStore.setState({ supportTickets: tickets });
}
export function setKbArticles(articles: KnowledgeBaseArticleData[]): void {
  useMarketplaceStore.setState({ kbArticles: articles });
}

// Analytics actions
export function setUsageAnalytics(analytics: UsageAnalytics | null): void {
  useMarketplaceStore.setState({ usageAnalytics: analytics });
}
export function setPerformanceAnalytics(
  analytics: PerformanceAnalytics | null
): void {
  useMarketplaceStore.setState({ performanceAnalytics: analytics });
}
export function setBusinessAnalytics(
  analytics: BusinessAnalytics | null
): void {
  useMarketplaceStore.setState({ businessAnalytics: analytics });
}

// Doc actions
export function setDocSections(sections: DocumentSection[]): void {
  useMarketplaceStore.setState({ docSections: sections });
}
export function setScreenshots(screenshots: ScreenshotData[]): void {
  useMarketplaceStore.setState({ screenshots });
}
