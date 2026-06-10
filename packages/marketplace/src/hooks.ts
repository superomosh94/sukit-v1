'use client';

import { useCallback, useEffect } from 'react';
import { useMarketplace } from './provider';
import { useMarketplaceStore } from './store';
import type {
  ModuleSearchOptions,
  ModuleSearchResult,
  ModuleInstallData,
  InstallOptions,
  InstallResult,
  UpdateCheckResult,
  DeveloperData,
  DeveloperDashboardStats,
  DeveloperApiKeyData,
  SubmissionDraft,
  MarketplaceModuleData,
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
import {
  setLoading,
  setError,
  setSearchResults,
  setCurrentModule,
  setFeaturedModules,
  setPopularModules,
  setInstalledModules,
  setInstallProgress,
  setInstallingModuleId,
  setUpdatesAvailable,
  setUpdatingModules,
  setDeveloper,
  setDeveloperModules,
  setDeveloperStats,
  setDeveloperApiKeys,
  setSubmissionDraft,
  setValidationReport,
  setSecurityScan,
  setCheckoutSession,
  setLicenses,
  setSubscriptions,
  setPayoutSummary,
  setSupportTickets,
  setKbArticles,
  setUsageAnalytics,
  setPerformanceAnalytics,
  setBusinessAnalytics,
  setDocSections,
  setScreenshots,
  setReviews,
} from './store';

// ─── Registry Hooks ───────────────────────────────────────────────

export function useMarketplaceSearch() {
  const marketplace = useMarketplace();
  const { searchResults, loading } = useMarketplaceStore();

  const search = useCallback(
    async (options: ModuleSearchOptions) => {
      setLoading('search', true);
      setError('search', null);
      try {
        const results = await marketplace.registry.searchModules(options);
        setSearchResults(results);
        return results;
      } catch (e: any) {
        setError('search', e.message);
        throw e;
      } finally {
        setLoading('search', false);
      }
    },
    [marketplace]
  );

  const loadFeatured = useCallback(async () => {
    try {
      const featured = await marketplace.registry.getFeaturedModules();
      setFeaturedModules(featured);
    } catch {}
  }, [marketplace]);

  const loadPopular = useCallback(async () => {
    try {
      const popular = await marketplace.registry.getPopularModules();
      setPopularModules(popular);
    } catch {}
  }, [marketplace]);

  return {
    search,
    loadFeatured,
    loadPopular,
    searchResults,
    loading: loading.search,
  };
}

export function useModuleDetail() {
  const marketplace = useMarketplace();
  const { currentModule, loading } = useMarketplaceStore();

  const loadModule = useCallback(
    async (moduleId: string) => {
      setLoading('module', true);
      setError('module', null);
      try {
        const mod = await marketplace.registry.getModule(moduleId);
        setCurrentModule(mod);
        return mod;
      } catch (e: any) {
        setError('module', e.message);
        throw e;
      } finally {
        setLoading('module', false);
      }
    },
    [marketplace]
  );

  return { loadModule, currentModule, loading: loading.module };
}

// ─── Install Hooks ────────────────────────────────────────────────

export function useModuleInstall() {
  const marketplace = useMarketplace();
  const { installedModules, installProgress, installingModuleId, loading } =
    useMarketplaceStore();

  const install = useCallback(
    async (
      moduleId: string,
      options?: InstallOptions
    ): Promise<InstallResult> => {
      setInstallingModuleId(moduleId);
      setError('install', null);
      try {
        const unsub = marketplace.installer.onProgress(
          moduleId,
          setInstallProgress
        );
        const result = await marketplace.installer.install(
          moduleId,
          'marketplace',
          options
        );
        unsub();
        if (result.success) {
          const updated = await marketplace.installer.getInstalledModules();
          setInstalledModules(updated);
        }
        return result;
      } catch (e: any) {
        setError('install', e.message);
        throw e;
      } finally {
        setInstallingModuleId(null);
        setInstallProgress(null);
      }
    },
    [marketplace]
  );

  const uninstall = useCallback(
    async (moduleId: string) => {
      setLoading('uninstall', true);
      try {
        await marketplace.installer.uninstall(moduleId);
        const updated = await marketplace.installer.getInstalledModules();
        setInstalledModules(updated);
      } finally {
        setLoading('uninstall', false);
      }
    },
    [marketplace]
  );

  const loadInstalled = useCallback(async () => {
    try {
      const mods = await marketplace.installer.getInstalledModules();
      setInstalledModules(mods);
    } catch {}
  }, [marketplace]);

  return {
    install,
    uninstall,
    loadInstalled,
    installedModules,
    installProgress,
    installingModuleId,
    loading: loading.uninstall,
  };
}

// ─── Update Hooks ─────────────────────────────────────────────────

export function useModuleUpdates() {
  const marketplace = useMarketplace();
  const { updatesAvailable, updatingModules } = useMarketplaceStore();

  const checkForUpdates = useCallback(async () => {
    setLoading('updates', true);
    try {
      const result = await marketplace.installer.checkForUpdates();
      setUpdatesAvailable(result);
      return result;
    } finally {
      setLoading('updates', false);
    }
  }, [marketplace]);

  const updateModule = useCallback(
    async (moduleId: string, options?: { version?: string }) => {
      setUpdatingModules([...updatingModules, moduleId]);
      try {
        await marketplace.installer.updateModule(moduleId, options);
        const result = await marketplace.installer.checkForUpdates();
        setUpdatesAvailable(result);
      } finally {
        setUpdatingModules(updatingModules.filter((id) => id !== moduleId));
      }
    },
    [marketplace]
  );

  const updateAll = useCallback(async () => {
    const result = await marketplace.installer.updateAllModules();
    const updates = await marketplace.installer.checkForUpdates();
    setUpdatesAvailable(updates);
    return result;
  }, [marketplace]);

  return {
    checkForUpdates,
    updateModule,
    updateAll,
    updatesAvailable,
    updatingModules,
  };
}

// ─── Developer Hooks ──────────────────────────────────────────────

export function useDeveloperPortal() {
  const marketplace = useMarketplace();
  const { developer, developerModules, developerStats, developerApiKeys } =
    useMarketplaceStore();

  const loadDeveloper = useCallback(async () => {
    try {
      const dev = await marketplace.developer.getDeveloperProfile();
      setDeveloper(dev);
    } catch {}
  }, [marketplace]);

  const loadModules = useCallback(async () => {
    try {
      const mods = await marketplace.developer.getDeveloperModules();
      setDeveloperModules(mods);
    } catch {}
  }, [marketplace]);

  const loadStats = useCallback(async () => {
    try {
      const stats = await marketplace.developer.getDashboardStats();
      setDeveloperStats(stats);
    } catch {}
  }, [marketplace]);

  const loadApiKeys = useCallback(async () => {
    try {
      const keys = await marketplace.developer.getApiKeys();
      setDeveloperApiKeys(keys);
    } catch {}
  }, [marketplace]);

  return {
    developer,
    developerModules,
    developerStats,
    developerApiKeys,
    loadDeveloper,
    loadModules,
    loadStats,
    loadApiKeys,
  };
}

// ─── Analytics Hook ───────────────────────────────────────────────

export function useModuleAnalytics(moduleId?: string) {
  const marketplace = useMarketplace();
  const { usageAnalytics, performanceAnalytics, businessAnalytics } =
    useMarketplaceStore();

  const loadUsage = useCallback(async () => {
    if (!moduleId) return;
    setLoading('usage-analytics', true);
    try {
      const data = await marketplace.analytics.getUsageAnalytics(moduleId);
      setUsageAnalytics(data);
    } finally {
      setLoading('usage-analytics', false);
    }
  }, [marketplace, moduleId]);

  const loadPerformance = useCallback(async () => {
    if (!moduleId) return;
    setLoading('perf-analytics', true);
    try {
      const data =
        await marketplace.analytics.getPerformanceAnalytics(moduleId);
      setPerformanceAnalytics(data);
    } finally {
      setLoading('perf-analytics', false);
    }
  }, [marketplace, moduleId]);

  const loadBusiness = useCallback(async () => {
    setLoading('biz-analytics', true);
    try {
      const data = await marketplace.analytics.getBusinessAnalytics(moduleId);
      setBusinessAnalytics(data);
    } finally {
      setLoading('biz-analytics', false);
    }
  }, [marketplace, moduleId]);

  return {
    loadUsage,
    loadPerformance,
    loadBusiness,
    usageAnalytics,
    performanceAnalytics,
    businessAnalytics,
  };
}

// ─── Payment Hooks ────────────────────────────────────────────────

export function usePayments() {
  const marketplace = useMarketplace();
  const { checkoutSession, licenses, subscriptions, payoutSummary } =
    useMarketplaceStore();

  const createCheckout = useCallback(
    async (items: any[], coupon?: string) => {
      const session = await marketplace.payments.createCheckoutSession(
        items,
        coupon
      );
      setCheckoutSession(session);
      return session;
    },
    [marketplace]
  );

  const loadLicenses = useCallback(async () => {
    const data = await marketplace.payments.getLicenses();
    setLicenses(data);
  }, [marketplace]);

  const loadSubscriptions = useCallback(async () => {
    const data = await marketplace.payments.getSubscriptions();
    setSubscriptions(data);
  }, [marketplace]);

  const loadPayouts = useCallback(async () => {
    const data = await marketplace.payments.getPayoutSummary();
    setPayoutSummary(data);
  }, [marketplace]);

  return {
    createCheckout,
    loadLicenses,
    loadSubscriptions,
    loadPayouts,
    checkoutSession,
    licenses,
    subscriptions,
    payoutSummary,
  };
}

// ─── Support Hook ─────────────────────────────────────────────────

export function useSupport() {
  const marketplace = useMarketplace();
  const { supportTickets, kbArticles } = useMarketplaceStore();

  const loadTickets = useCallback(async () => {
    try {
      const { tickets } = await marketplace.support.getTickets();
      setSupportTickets(tickets);
    } catch {}
  }, [marketplace]);

  const searchKB = useCallback(
    async (query: string) => {
      const result = await marketplace.support.searchKnowledgeBase(query);
      setKbArticles(result.articles);
      return result;
    },
    [marketplace]
  );

  return { loadTickets, searchKB, supportTickets, kbArticles };
}

// ─── Documentation Hook ───────────────────────────────────────────

export function useDocumentation(moduleId?: string) {
  const marketplace = useMarketplace();
  const { docSections, screenshots } = useMarketplaceStore();

  const loadDocs = useCallback(async () => {
    if (!moduleId) return;
    try {
      const sections = await marketplace.docs.getDocumentation(moduleId);
      setDocSections(sections);
    } catch {}
  }, [marketplace, moduleId]);

  const loadScreenshots = useCallback(async () => {
    if (!moduleId) return;
    try {
      const shots = await marketplace.docs.getScreenshots(moduleId);
      setScreenshots(shots);
    } catch {}
  }, [marketplace, moduleId]);

  return { loadDocs, loadScreenshots, docSections, screenshots };
}

// ─── Submission Hook ──────────────────────────────────────────────

export function useModuleSubmission() {
  const marketplace = useMarketplace();
  const { submissionDraft, validationReport, securityScan } =
    useMarketplaceStore();

  const loadDraft = useCallback(async () => {
    const draft = await marketplace.submission.loadDraft();
    setSubmissionDraft(draft);
    return draft;
  }, [marketplace]);

  const validate = useCallback(
    async (moduleId: string) => {
      setLoading('validation', true);
      try {
        const report = await marketplace.submission.runFullValidation(moduleId);
        setValidationReport(report);
        const scan = await marketplace.submission.runSecurityScan(moduleId);
        setSecurityScan(scan);
        return { report, scan };
      } finally {
        setLoading('validation', false);
      }
    },
    [marketplace]
  );

  return {
    loadDraft,
    validate,
    submissionDraft,
    validationReport,
    securityScan,
  };
}
