import type { SukitKernel } from '@sukit/core';
import type {
  UsageAnalytics,
  PerformanceAnalytics,
  BusinessAnalytics,
  AnalyticsExportOptions,
  DeveloperDashboardStats,
} from './types';

export class ModuleAnalytics {
  private kernel: SukitKernel;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ─── Usage Analytics (Category 6.1) ────────────────────────────

  async getUsageAnalytics(
    moduleId: string,
    period?: {
      from?: string;
      to?: string;
    }
  ): Promise<UsageAnalytics> {
    const params = new URLSearchParams();
    if (period?.from) params.set('from', period.from);
    if (period?.to) params.set('to', period.to);

    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/analytics/usage?${params}`
    );
    return res.json();
  }

  async getActiveInstalls(moduleId: string): Promise<{
    total: number;
    byVersion: { version: string; count: number }[];
    bySukitVersion: { version: string; count: number }[];
    byCountry: { country: string; count: number }[];
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/analytics/active-installs`
    );
    return res.json();
  }

  async getRetentionRate(moduleId: string): Promise<{
    day7: number;
    day30: number;
    day60: number;
    day90: number;
    installsByCohort: {
      cohort: string;
      day7: number;
      day30: number;
      day90: number;
    }[];
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/analytics/retention`
    );
    return res.json();
  }

  async getUpdateAdoption(moduleId: string): Promise<{
    currentVersion: string;
    adoptionRate: number;
    versionTimeline: {
      version: string;
      released: string;
      adoptionPercent: number;
    }[];
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/analytics/update-adoption`
    );
    return res.json();
  }

  // ─── Performance Analytics (Category 6.2) ──────────────────────

  async getPerformanceAnalytics(
    moduleId: string
  ): Promise<PerformanceAnalytics> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/analytics/performance`
    );
    return res.json();
  }

  async getErrorBreakdown(moduleId: string): Promise<{
    totalErrors: number;
    errorRate: number;
    topErrors: { message: string; count: number; percentage: number }[];
    errorsByDay: { date: string; count: number }[];
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/analytics/errors`
    );
    return res.json();
  }

  async getResourceUsage(moduleId: string): Promise<{
    cpu: { avg: number; max: number; p95: number };
    memory: { avg: number; max: number; p95: number };
    network: { avg: number; max: number; p95: number };
    database: { avgQueries: number; slowQueries: number };
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/analytics/resources`
    );
    return res.json();
  }

  // ─── Business Analytics (Category 6.3) ─────────────────────────

  async getBusinessAnalytics(moduleId?: string): Promise<BusinessAnalytics> {
    const params = moduleId ? `?moduleId=${moduleId}` : '';
    const res = await fetch(`/api/developer/analytics/business${params}`);
    return res.json();
  }

  async getRevenueAnalytics(moduleId?: string): Promise<{
    totalRevenue: number;
    mrr: number;
    arr: number;
    revenueByMonth: { month: string; revenue: number; growth: number }[];
    averageOrderValue: number;
    customerLifetimeValue: number;
  }> {
    const params = moduleId ? `?moduleId=${moduleId}` : '';
    const res = await fetch(`/api/developer/analytics/revenue${params}`);
    return res.json();
  }

  async getConversionFunnel(moduleId: string): Promise<{
    impressions: number;
    detailViews: number;
    installStarts: number;
    installs: number;
    activations: number;
    conversionRates: {
      viewToInstall: number;
      installToActivate: number;
      impressionToInstall: number;
    };
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/analytics/conversion`
    );
    return res.json();
  }

  async getCustomerAnalytics(moduleId?: string): Promise<{
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    churnRate: number;
    topCustomers: {
      userId: string;
      name: string;
      email: string;
      totalSpent: number;
      purchases: number;
    }[];
    customerAcquisition: {
      date: string;
      newCustomers: number;
      source?: string;
    }[];
  }> {
    const params = moduleId ? `?moduleId=${moduleId}` : '';
    const res = await fetch(`/api/developer/analytics/customers${params}`);
    return res.json();
  }

  // ─── Developer Dashboard (Category 6.4) ────────────────────────

  async getDeveloperDashboardStats(): Promise<DeveloperDashboardStats> {
    const res = await fetch('/api/developer/dashboard');
    return res.json();
  }

  async getSalesChart(
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<{
    labels: string[];
    datasets: { label: string; data: number[] }[];
  }> {
    const res = await fetch(
      `/api/developer/dashboard/sales-chart?period=${period}`
    );
    return res.json();
  }

  async getInstallsChart(
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<{
    labels: string[];
    installs: number[];
    uninstalls: number[];
    net: number[];
  }> {
    const res = await fetch(
      `/api/developer/dashboard/installs-chart?period=${period}`
    );
    return res.json();
  }

  async getRevenueChart(
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<{
    labels: string[];
    revenue: number[];
    fees: number[];
    netRevenue: number[];
  }> {
    const res = await fetch(
      `/api/developer/dashboard/revenue-chart?period=${period}`
    );
    return res.json();
  }

  async comparePeriods(
    currentFrom: string,
    currentTo: string,
    previousFrom: string,
    previousTo: string
  ): Promise<{
    current: { revenue: number; installs: number; customers: number };
    previous: { revenue: number; installs: number; customers: number };
    changes: { revenue: number; installs: number; customers: number };
  }> {
    const params = new URLSearchParams({
      currentFrom,
      currentTo,
      previousFrom,
      previousTo,
    });
    const res = await fetch(`/api/developer/dashboard/compare?${params}`);
    return res.json();
  }

  // ─── Export (Category 6.4) ─────────────────────────────────────

  async exportAnalytics(options: AnalyticsExportOptions): Promise<Blob> {
    const res = await fetch('/api/developer/analytics/export', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.blob();
  }

  async getReportUrl(
    options: AnalyticsExportOptions
  ): Promise<{ url: string }> {
    const res = await fetch('/api/developer/analytics/report-url', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json();
  }

  // ─── Geographic Analytics ──────────────────────────────────────

  async getGeographicData(moduleId: string): Promise<{
    byCountry: { country: string; installs: number; revenue: number }[];
    mapData: { countryCode: string; value: number }[];
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/analytics/geo`
    );
    return res.json();
  }

  // ─── Top Modules ───────────────────────────────────────────────

  async getTopModules(limit: number = 10): Promise<{
    byDownloads: { moduleId: string; name: string; downloads: number }[];
    byRevenue: { moduleId: string; name: string; revenue: number }[];
    byRating: { moduleId: string; name: string; rating: number }[];
    byGrowth: { moduleId: string; name: string; growth: number }[];
  }> {
    const res = await fetch(
      `/api/developer/analytics/top-modules?limit=${limit}`
    );
    return res.json();
  }
}
