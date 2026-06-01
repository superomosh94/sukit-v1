import type { SukitKernel } from '@sukit/core';
import type {
  CheckoutSession,
  CheckoutItem,
  CouponData,
  LicenseData,
  SubscriptionData,
  TransactionData,
  PayoutSummary,
  PayoutData,
  RefundRequest,
  BillingHistoryEntry,
  PaymentGateway,
  PaymentType,
} from './types';

export class PaymentSystem {
  private kernel: SukitKernel;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ─── Checkout Flow (Category 4.4) ──────────────────────────────

  async createCheckoutSession(
    items: CheckoutItem[],
    couponCode?: string
  ): Promise<CheckoutSession> {
    const res = await fetch('/api/marketplace/checkout/create', {
      method: 'POST',
      body: JSON.stringify({ items, couponCode }),
    });
    return res.json();
  }

  async applyCoupon(
    code: string,
    moduleIds: string[]
  ): Promise<CouponData | null> {
    const res = await fetch('/api/marketplace/checkout/coupon', {
      method: 'POST',
      body: JSON.stringify({ code, moduleIds }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async processPayment(
    sessionId: string,
    paymentMethod: PaymentGateway
  ): Promise<{
    success: boolean;
    transactionId?: string;
    licenseKey?: string;
    redirectUrl?: string;
    error?: string;
  }> {
    const res = await fetch('/api/marketplace/checkout/pay', {
      method: 'POST',
      body: JSON.stringify({ sessionId, paymentMethod }),
    });
    return res.json();
  }

  async getPaymentMethods(): Promise<{
    gateways: {
      id: PaymentGateway;
      name: string;
      enabled: boolean;
      icon: string;
    }[];
    savedMethods: {
      id: string;
      type: string;
      last4: string;
      expiry: string;
      isDefault: boolean;
    }[];
  }> {
    const res = await fetch('/api/marketplace/payment-methods');
    return res.json();
  }

  async savePaymentMethod(paymentMethodId: string): Promise<void> {
    await fetch('/api/marketplace/payment-methods/save', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId }),
    });
  }

  // ─── License Management (Category 4.3) ─────────────────────────

  async getLicenses(): Promise<LicenseData[]> {
    const res = await fetch('/api/marketplace/licenses');
    return res.json();
  }

  async activateLicense(
    licenseKey: string,
    domain: string
  ): Promise<{
    success: boolean;
    message: string;
    activationsRemaining?: number;
  }> {
    const res = await fetch('/api/marketplace/licenses/activate', {
      method: 'POST',
      body: JSON.stringify({ licenseKey, domain }),
    });
    return res.json();
  }

  async deactivateLicense(licenseKey: string, domain: string): Promise<void> {
    await fetch('/api/marketplace/licenses/deactivate', {
      method: 'POST',
      body: JSON.stringify({ licenseKey, domain }),
    });
  }

  async transferLicense(licenseKey: string, newDomain: string): Promise<void> {
    await fetch('/api/marketplace/licenses/transfer', {
      method: 'POST',
      body: JSON.stringify({ licenseKey, newDomain }),
    });
  }

  async validateLicense(
    licenseKey: string,
    domain?: string
  ): Promise<{
    valid: boolean;
    license: LicenseData | null;
    expiresIn: number | null;
  }> {
    const params = domain ? `?domain=${encodeURIComponent(domain)}` : '';
    const res = await fetch(
      `/api/marketplace/licenses/validate/${licenseKey}${params}`
    );
    return res.json();
  }

  // ─── Subscription Management (Category 4.5) ────────────────────

  async getSubscriptions(): Promise<SubscriptionData[]> {
    const res = await fetch('/api/marketplace/subscriptions');
    return res.json();
  }

  async cancelSubscription(
    subscriptionId: string,
    atPeriodEnd: boolean = true
  ): Promise<void> {
    await fetch(`/api/marketplace/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ atPeriodEnd }),
    });
  }

  async pauseSubscription(subscriptionId: string): Promise<void> {
    await fetch(`/api/marketplace/subscriptions/${subscriptionId}/pause`, {
      method: 'POST',
    });
  }

  async resumeSubscription(subscriptionId: string): Promise<void> {
    await fetch(`/api/marketplace/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
    });
  }

  async changeSubscriptionPlan(
    subscriptionId: string,
    newPlan: 'monthly' | 'yearly'
  ): Promise<void> {
    await fetch(
      `/api/marketplace/subscriptions/${subscriptionId}/change-plan`,
      {
        method: 'POST',
        body: JSON.stringify({ plan: newPlan }),
      }
    );
  }

  async updatePaymentMethod(
    subscriptionId: string,
    paymentMethodId: string
  ): Promise<void> {
    await fetch(
      `/api/marketplace/subscriptions/${subscriptionId}/payment-method`,
      {
        method: 'PUT',
        body: JSON.stringify({ paymentMethodId }),
      }
    );
  }

  // ─── Billing History ───────────────────────────────────────────

  async getBillingHistory(): Promise<{
    entries: BillingHistoryEntry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const res = await fetch('/api/marketplace/billing');
    return res.json();
  }

  async downloadInvoice(transactionId: string): Promise<Blob> {
    const res = await fetch(
      `/api/marketplace/billing/invoice/${transactionId}`
    );
    return res.blob();
  }

  // ─── Developer Payouts (Category 4.6) ──────────────────────────

  async getPayoutSummary(): Promise<PayoutSummary> {
    const res = await fetch('/api/developer/payouts');
    return res.json();
  }

  async requestPayout(): Promise<{
    success: boolean;
    message: string;
    payoutId?: string;
  }> {
    const res = await fetch('/api/developer/payouts/request', {
      method: 'POST',
    });
    return res.json();
  }

  async getPayoutHistory(): Promise<{
    payouts: PayoutData[];
    totalPaid: number;
    pendingAmount: number;
  }> {
    const res = await fetch('/api/developer/payouts/history');
    return res.json();
  }

  async updatePayoutMethod(method: {
    type: 'stripe' | 'paypal' | 'bank';
    email?: string;
    accountNumber?: string;
    routingNumber?: string;
    country?: string;
  }): Promise<void> {
    await fetch('/api/developer/payouts/method', {
      method: 'PUT',
      body: JSON.stringify(method),
    });
  }

  // ─── Refund Handling (Category 4.7) ────────────────────────────

  async requestRefund(
    transactionId: string,
    reason: string
  ): Promise<RefundRequest> {
    const res = await fetch('/api/marketplace/refunds/request', {
      method: 'POST',
      body: JSON.stringify({ transactionId, reason }),
    });
    return res.json();
  }

  async getRefundStatus(transactionId: string): Promise<RefundRequest | null> {
    const res = await fetch(`/api/marketplace/refunds/status/${transactionId}`);
    if (!res.ok) return null;
    return res.json();
  }

  async getRefundPolicy(): Promise<{
    refundDays: number;
    autoRefundDays: number;
    policy: string;
  }> {
    const res = await fetch('/api/marketplace/refunds/policy');
    return res.json();
  }

  // ─── Admin: Transaction Management ────────────────────────────

  async getTransactions(options?: {
    moduleId?: string;
    status?: string;
    type?: PaymentType;
    page?: number;
    pageSize?: number;
  }): Promise<{
    transactions: TransactionData[];
    total: number;
    page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.moduleId) params.set('moduleId', options.moduleId);
    if (options?.status) params.set('status', options.status);
    if (options?.type) params.set('type', options.type);
    params.set('page', String(options?.page ?? 1));
    params.set('pageSize', String(options?.pageSize ?? 20));

    const res = await fetch(`/api/admin/marketplace/transactions?${params}`);
    return res.json();
  }

  async issueRefund(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    await fetch(`/api/admin/marketplace/transactions/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  // ─── Revenue Share ─────────────────────────────────────────────

  getRevenueShare(developerLevel: 'standard' | 'premium' = 'standard'): number {
    return developerLevel === 'premium' ? 0.8 : 0.7;
  }

  calculateDeveloperAmount(total: number, fee: number, share: number): number {
    const platformFee = total * (1 - share);
    return total - platformFee - fee;
  }
}
