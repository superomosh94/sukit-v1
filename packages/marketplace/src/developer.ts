import type { SukitKernel } from '@sukit/core';
import type {
  DeveloperData,
  DeveloperApplication,
  DeveloperApiKeyData,
  DeveloperDashboardStats,
  MarketplaceModuleData,
} from './types';

export class DeveloperPortal {
  private kernel: SukitKernel;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ─── Developer Registration (Category 7.1) ────────────────────

  async getDeveloperProfile(): Promise<DeveloperData | null> {
    try {
      const res = await fetch('/api/developer/profile');
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async applyAsDeveloper(application: DeveloperApplication): Promise<{
    success: boolean;
    message: string;
    developerId?: string;
  }> {
    if (!application.agreementAccepted) {
      throw new Error('You must accept the Developer Agreement to proceed');
    }
    if (application.reason.length < 20) {
      throw new Error(
        'Please provide a more detailed reason for your application (min 20 characters)'
      );
    }

    const res = await fetch('/api/developer/register', {
      method: 'POST',
      body: JSON.stringify(application),
    });
    const data = await res.json();

    if (res.ok) {
      await this.kernel.events.emit('marketplace:developerApplied', {
        developerId: data.developerId,
      });
    }

    return data;
  }

  async checkApplicationStatus(): Promise<
    'not_applied' | 'pending' | 'approved' | 'rejected'
  > {
    try {
      const res = await fetch('/api/developer/status');
      const data = await res.json();
      return data.status;
    } catch {
      return 'not_applied';
    }
  }

  // ─── Developer Dashboard (Category 7.2) ───────────────────────

  async getDashboardStats(): Promise<DeveloperDashboardStats> {
    const res = await fetch('/api/developer/dashboard');
    return res.json();
  }

  async getDeveloperModules(): Promise<MarketplaceModuleData[]> {
    const res = await fetch('/api/developer/modules');
    return res.json();
  }

  async createModule(moduleData: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  }): Promise<MarketplaceModuleData> {
    const res = await fetch('/api/developer/modules', {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
    return res.json();
  }

  async updateModule(
    moduleId: string,
    data: Partial<MarketplaceModuleData>
  ): Promise<MarketplaceModuleData> {
    const res = await fetch(`/api/developer/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async deleteModule(moduleId: string): Promise<void> {
    await fetch(`/api/developer/modules/${moduleId}`, {
      method: 'DELETE',
    });
  }

  async getSalesAnalytics(moduleId?: string): Promise<{
    totalRevenue: number;
    mrr: number;
    averageOrderValue: number;
    conversionRate: number;
    refundRate: number;
    salesByDay: { date: string; amount: number; count: number }[];
    topCustomers: { userId: string; name: string; totalSpent: number }[];
  }> {
    const params = moduleId ? `?moduleId=${moduleId}` : '';
    const res = await fetch(`/api/developer/sales${params}`);
    return res.json();
  }

  async getPayoutHistory(): Promise<{
    payouts: {
      id: string;
      amount: number;
      currency: string;
      status: 'pending' | 'sent' | 'failed';
      method: string;
      sentAt: string;
    }[];
    totalPaid: number;
    pendingAmount: number;
    nextPayoutDate: string | null;
  }> {
    const res = await fetch('/api/developer/payouts');
    return res.json();
  }

  async getDeveloperReviews(): Promise<{
    reviews: {
      id: string;
      moduleId: string;
      moduleName: string;
      rating: number;
      review: string;
      userName: string;
      createdAt: string;
      responded: boolean;
    }[];
    averageRating: number;
    totalReviews: number;
    pendingResponse: number;
  }> {
    const res = await fetch('/api/developer/reviews');
    return res.json();
  }

  async respondToReview(reviewId: string, response: string): Promise<void> {
    await fetch(`/api/marketplace/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  // ─── Module Submission Form Helpers (Category 7.4) ─────────────

  async uploadModuleFile(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ url: string; size: number; version: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/developer/modules/upload', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  async uploadScreenshot(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('screenshot', file);
    const res = await fetch('/api/developer/modules/upload/screenshot', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  async uploadIcon(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('icon', file);
    const res = await fetch('/api/developer/modules/upload/icon', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  async uploadBanner(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('banner', file);
    const res = await fetch('/api/developer/modules/upload/banner', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  // ─── API Key Management (Category 7.3) ─────────────────────────

  async getApiKeys(): Promise<DeveloperApiKeyData[]> {
    const res = await fetch('/api/developer/api-keys');
    return res.json();
  }

  async createApiKey(data: {
    name: string;
    permissions: string[];
    ipWhitelist?: string[];
    expiresAt?: string;
  }): Promise<DeveloperApiKeyData & { rawKey: string }> {
    const res = await fetch('/api/developer/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async revokeApiKey(keyId: string): Promise<void> {
    await fetch(`/api/developer/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  async updateApiKey(
    keyId: string,
    data: Partial<{
      name: string;
      permissions: string[];
      ipWhitelist: string[];
      rateLimit: number;
    }>
  ): Promise<DeveloperApiKeyData> {
    const res = await fetch(`/api/developer/api-keys/${keyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // ─── Notifications (Category 7.7) ──────────────────────────────

  async getNotifications(): Promise<{
    notifications: {
      id: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      createdAt: string;
    }[];
    unreadCount: number;
  }> {
    const res = await fetch('/api/developer/notifications');
    return res.json();
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await fetch(`/api/developer/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // ─── Support Ticket Management ────────────────────────────────

  async getDeveloperTickets(): Promise<{
    tickets: {
      id: string;
      moduleId: string;
      moduleName: string;
      subject: string;
      priority: string;
      status: string;
      createdAt: string;
      lastResponseAt: string | null;
    }[];
    openCount: number;
  }> {
    const res = await fetch('/api/developer/support/tickets');
    return res.json();
  }

  async respondToTicket(ticketId: string, message: string): Promise<void> {
    await fetch(`/api/support/tickets/${ticketId}/response`, {
      method: 'POST',
      body: JSON.stringify({ message, authorType: 'developer' }),
    });
  }
}
