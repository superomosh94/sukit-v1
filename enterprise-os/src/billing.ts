import type { SukitKernel } from '@sukit/core';

type BillingPlan = 'starter' | 'growth' | 'enterprise' | 'custom';
type BillingPeriod = 'monthly' | 'yearly';
type MeteredUnit =
  | 'api-calls'
  | 'storage-gb'
  | 'bandwidth-gb'
  | 'seats'
  | 'sites';

interface PlanDefinition {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  features: string[];
  limits: Record<string, number>;
  meteredFeatures: {
    unit: MeteredUnit;
    pricePerUnit: number;
    includedUnits: number;
  }[];
  tier: number;
}

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  metered?: boolean;
}

interface Invoice {
  id: string;
  orgId: string;
  number: string;
  periodStart: string;
  periodEnd: string;
  lines: InvoiceLine[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discounts: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paidAt: string | null;
  pdfUrl: string | null;
  createdAt: string;
}

interface MeteredUsage {
  orgId: string;
  unit: MeteredUnit;
  consumed: number;
  included: number;
  overage: number;
  cost: number;
  period: string;
}

interface ResellerTier {
  name: string;
  minRevenue: number;
  commissionRate: number;
  supportLevel: 'basic' | 'premium' | 'enterprise';
  whiteLabel: boolean;
}

export class EnterpriseBilling {
  private kernel: SukitKernel;
  private plans: PlanDefinition[] = [];
  private invoices: Invoice[] = [];
  private usageRecords: Map<string, Map<string, number>> = new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.initPlans();
  }

  private initPlans(): void {
    this.plans = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'For small teams',
        price: { monthly: 29, yearly: 290 },
        features: ['10 sites', '50 pages/site', '1GB storage', 'Email support'],
        limits: {
          sites: 10,
          pages: 500,
          storage: 1,
          bandwidth: 10,
          members: 5,
        },
        meteredFeatures: [],
        tier: 1,
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'For growing businesses',
        price: { monthly: 99, yearly: 990 },
        features: [
          '50 sites',
          '500 pages/site',
          '10GB storage',
          'Chat support',
          'Custom domains',
        ],
        limits: {
          sites: 50,
          pages: 25000,
          storage: 10,
          bandwidth: 100,
          members: 25,
        },
        meteredFeatures: [
          { unit: 'api-calls', pricePerUnit: 0.001, includedUnits: 10000 },
          { unit: 'storage-gb', pricePerUnit: 0.1, includedUnits: 10 },
        ],
        tier: 2,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: { monthly: 499, yearly: 4990 },
        features: [
          'Unlimited sites',
          'Unlimited pages',
          '100GB storage',
          '24/7 support',
          'SSO/SAML',
          'Audit logs',
          '99.99% SLA',
        ],
        limits: {
          sites: -1,
          pages: -1,
          storage: 100,
          bandwidth: 1000,
          members: 1000,
        },
        meteredFeatures: [
          { unit: 'api-calls', pricePerUnit: 0.0005, includedUnits: 100000 },
          { unit: 'storage-gb', pricePerUnit: 0.05, includedUnits: 100 },
          { unit: 'bandwidth-gb', pricePerUnit: 0.02, includedUnits: 1000 },
        ],
        tier: 3,
      },
      {
        id: 'custom',
        name: 'Custom',
        description: 'Tailored for your needs',
        price: { monthly: 0, yearly: 0 },
        features: [
          'Everything in Enterprise',
          'Custom contracts',
          'Dedicated infra',
          'On-premise',
          'Custom SLA',
        ],
        limits: {
          sites: -1,
          pages: -1,
          storage: -1,
          bandwidth: -1,
          members: -1,
        },
        meteredFeatures: [],
        tier: 4,
      },
    ];
  }

  getPlans(): PlanDefinition[] {
    return this.plans;
  }

  getPlan(planId: string): PlanDefinition | undefined {
    return this.plans.find((p) => p.id === planId);
  }

  getUpgradeOptions(currentPlanId: string): PlanDefinition[] {
    const current = this.getPlan(currentPlanId);
    if (!current) return this.plans;
    return this.plans.filter((p) => p.tier > current.tier);
  }

  calculateUpgradePrice(
    fromPlan: string,
    toPlan: string,
    period: BillingPeriod
  ): { prorated: number; dueNow: number } {
    const from = this.getPlan(fromPlan);
    const to = this.getPlan(toPlan);
    if (!from || !to) return { prorated: 0, dueNow: 0 };
    const fromPrice = from.price[period];
    const toPrice = to.price[period];
    return { prorated: fromPrice, dueNow: toPrice - fromPrice };
  }

  recordUsage(orgId: string, unit: MeteredUnit, amount: number): void {
    const now = new Date();
    const periodKey = `${now.getFullYear()}-${now.getMonth()}`;
    if (!this.usageRecords.has(orgId)) this.usageRecords.set(orgId, new Map());
    const orgUsage = this.usageRecords.get(orgId)!;
    const key = `${periodKey}:${unit}`;
    orgUsage.set(key, (orgUsage.get(key) || 0) + amount);
  }

  getMeteredUsage(
    orgId: string,
    planId: string,
    period: string
  ): MeteredUsage[] {
    const plan = this.getPlan(planId);
    if (!plan) return [];
    return plan.meteredFeatures.map((mf) => {
      const key = `${period}:${mf.unit}`;
      const consumed = this.usageRecords.get(orgId)?.get(key) || 0;
      const overage = Math.max(0, consumed - mf.includedUnits);
      return {
        orgId,
        unit: mf.unit,
        consumed,
        included: mf.includedUnits,
        overage,
        cost: overage * mf.pricePerUnit,
        period,
      };
    });
  }

  generateInvoice(
    orgId: string,
    planId: string,
    period: BillingPeriod
  ): Invoice {
    const plan = this.getPlan(planId);
    if (!plan) throw new Error('Invalid plan');

    const now = new Date();
    const periodStart =
      period === 'monthly'
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), 0, 1);
    const periodEnd =
      period === 'monthly'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0)
        : new Date(now.getFullYear(), 11, 31);
    const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const lines: InvoiceLine[] = [
      {
        description: `${plan.name} - ${period} (${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()})`,
        quantity: 1,
        unitPrice: plan.price[period],
        total: plan.price[period],
      },
    ];

    const meteredUsage = this.getMeteredUsage(orgId, planId, periodKey);
    for (const mu of meteredUsage) {
      if (mu.overage > 0) {
        lines.push({
          description: `Overage: ${mu.unit} (${mu.overage} units @ $${mu.pricePerUnit.toFixed(4)})`,
          quantity: mu.overage,
          unitPrice: mu.pricePerUnit,
          total: mu.cost,
          metered: true,
        });
      }
    }

    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const taxRate = 0;
    const tax = 0;

    const invoice: Invoice = {
      id: `inv_${crypto.randomUUID().substring(0, 12)}`,
      orgId,
      number: `INV-${now.getFullYear()}-${String(this.invoices.length + 1).padStart(4, '0')}`,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      lines,
      subtotal,
      tax,
      taxRate,
      discounts: 0,
      total: subtotal + tax - 0,
      currency: 'USD',
      status: 'draft',
      paidAt: null,
      pdfUrl: null,
      createdAt: now.toISOString(),
    };
    this.invoices.push(invoice);
    return invoice;
  }

  getInvoices(orgId: string): Invoice[] {
    return this.invoices.filter((i) => i.orgId === orgId);
  }

  markPaid(invoiceId: string): void {
    const invoice = this.invoices.find((i) => i.id === invoiceId);
    if (invoice) {
      invoice.status = 'paid';
      invoice.paidAt = new Date().toISOString();
    }
  }

  processPayment(invoiceId: string, paymentMethodId: string): { success: boolean; transactionId: string; error?: string } {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (!invoice) return { success: false, transactionId: '', error: 'Invoice not found' };
    if (invoice.status === 'paid') return { success: false, transactionId: '', error: 'Already paid' };
    const transactionId = `txn_${crypto.randomUUID().substring(0, 16)}`;
    invoice.status = 'paid';
    invoice.paidAt = new Date().toISOString();
    this.kernel.events.emit('billing:payment:completed', { invoiceId, transactionId, amount: invoice.total, currency: invoice.currency });
    return { success: true, transactionId };
  }

  // ─── Reseller (8.2) ─────────────────────────────────────────────

  private resellerTiers: ResellerTier[] = [
    {
      name: 'Silver',
      minRevenue: 0,
      commissionRate: 0.15,
      supportLevel: 'basic',
      whiteLabel: false,
    },
    {
      name: 'Gold',
      minRevenue: 5000,
      commissionRate: 0.25,
      supportLevel: 'premium',
      whiteLabel: true,
    },
    {
      name: 'Platinum',
      minRevenue: 25000,
      commissionRate: 0.35,
      supportLevel: 'enterprise',
      whiteLabel: true,
    },
  ];

  getResellerTiers(): ResellerTier[] {
    return this.resellerTiers;
  }

  getResellerTierForRevenue(revenue: number): ResellerTier {
    return (
      [...this.resellerTiers].reverse().find((t) => revenue >= t.minRevenue) ||
      this.resellerTiers[0]
    );
  }

  calculateCommission(
    resellerRevenue: number,
    tierName: string
  ): {
    revenue: number;
    commission: number;
    rate: number;
    nextTier: string | null;
  } {
    const tier = this.resellerTiers.find((t) => t.name === tierName);
    if (!tier)
      return {
        revenue: resellerRevenue,
        commission: 0,
        rate: 0,
        nextTier: null,
      };
    const commission = resellerRevenue * tier.commissionRate;
    const nextTier = this.resellerTiers.find(
      (t) => t.minRevenue > resellerRevenue
    );
    return {
      revenue: resellerRevenue,
      commission,
      rate: tier.commissionRate,
      nextTier: nextTier?.name || null,
    };
  }

  // ─── Stripe Connect Integration ──────────────────────────────

  generateStripeConnectConfig(): Record<string, any> {
    return {
      enabled: true,
      clientId: process.env.STRIPE_CLIENT_ID || 'ca_xxxxxxxx',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      redirectUri: `${process.env.APP_URL || 'http://localhost:3042'}/api/billing/stripe/callback`,
      features: {
        paymentMethods: ['card', 'us_bank_account', 'sepa_debit', 'ideal', 'bancontact'],
        recurringInvoices: true,
        automaticTax: true,
        paymentIntents: true,
        setupIntents: true,
      },
    };
  }

  generateStripePaymentIntent(amount: number, currency: string = 'usd'): { clientSecret: string; id: string } {
    return {
      clientSecret: `pi_${crypto.randomUUID().replace(/-/g, '')}_secret_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`,
      id: `pi_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`,
    };
  }

  // ─── Tax Handling ────────────────────────────────────────────

  private taxRates: Record<string, { vat: number; country: string; region?: string }> = {
    'DE': { vat: 19, country: 'Germany' },
    'FR': { vat: 20, country: 'France' },
    'GB': { vat: 20, country: 'United Kingdom' },
    'NL': { vat: 21, country: 'Netherlands' },
    'BE': { vat: 21, country: 'Belgium' },
    'IT': { vat: 22, country: 'Italy' },
    'ES': { vat: 21, country: 'Spain' },
    'AT': { vat: 20, country: 'Austria' },
    'SE': { vat: 25, country: 'Sweden' },
    'DK': { vat: 25, country: 'Denmark' },
    'FI': { vat: 24, country: 'Finland' },
    'IE': { vat: 23, country: 'Ireland' },
    'PT': { vat: 23, country: 'Portugal' },
    'PL': { vat: 23, country: 'Poland' },
    'CZ': { vat: 21, country: 'Czech Republic' },
    'US': { vat: 0, country: 'United States' },
  };

  private stateTaxRates: Record<string, { rate: number; name: string }> = {
    'CA': { rate: 7.25, name: 'California' },
    'NY': { rate: 4, name: 'New York' },
    'TX': { rate: 6.25, name: 'Texas' },
    'FL': { rate: 6, name: 'Florida' },
    'IL': { rate: 6.25, name: 'Illinois' },
    'WA': { rate: 6.5, name: 'Washington' },
  };

  getTaxRate(countryCode: string, region?: string): { rate: number; label: string; type: string } {
    if (countryCode === 'US' && region && this.stateTaxRates[region]) {
      const st = this.stateTaxRates[region];
      return { rate: st.rate, label: `${st.name} Sales Tax`, type: 'sales_tax' };
    }
    const country = this.taxRates[countryCode];
    if (country) return { rate: country.vat, label: `${country.country} VAT`, type: 'vat' };
    return { rate: 0, label: 'No Tax', type: 'none' };
  }

  calculateTax(subtotal: number, countryCode: string, region?: string): { rate: number; amount: number; label: string; type: string } {
    const taxInfo = this.getTaxRate(countryCode, region);
    const amount = Math.round(subtotal * taxInfo.rate) / 100;
    return { ...taxInfo, amount };
  }

  generateInvoiceWithTax(orgId: string, planId: string, period: BillingPeriod, countryCode: string, region?: string): Invoice {
    const invoice = this.generateInvoice(orgId, planId, period);
    const tax = this.calculateTax(invoice.subtotal, countryCode, region);
    invoice.taxRate = tax.rate;
    invoice.tax = tax.amount;
    invoice.total = invoice.subtotal + tax.amount - invoice.discounts;
    return invoice;
  }

  // ─── Usage Alerts ────────────────────────────────────────────

  private usageAlertThresholds: Map<string, { unit: string; threshold: number; enabled: boolean; channels: string[] }[]> = new Map();

  setUsageAlert(orgId: string, unit: string, threshold: number, channels: string[] = ['email']): void {
    const alerts = this.usageAlertThresholds.get(orgId) || [];
    alerts.push({ unit, threshold, enabled: true, channels });
    this.usageAlertThresholds.set(orgId, alerts);
  }

  checkUsageAlerts(orgId: string, planId: string, period: string): { triggered: { unit: string; consumed: number; threshold: number; channels: string[] }[] } {
    const alerts = this.usageAlertThresholds.get(orgId) || [];
    const usage = this.getMeteredUsage(orgId, planId, period);
    const triggered: { unit: string; consumed: number; threshold: number; channels: string[] }[] = [];
    for (const alert of alerts) {
      if (!alert.enabled) continue;
      const u = usage.find(u => u.unit === alert.unit);
      if (u && u.consumed >= alert.threshold) {
        triggered.push({ unit: alert.unit, consumed: u.consumed, threshold: alert.threshold, channels: alert.channels });
      }
    }
    return { triggered };
  }

  // ─── Sub-Tenant Billing ──────────────────────────────────────

  createSubTenantPlan(parentOrgId: string, name: string, price: number, limits: Record<string, number>): PlanDefinition {
    const plan: PlanDefinition = {
      id: `sub_${crypto.randomUUID().substring(0, 8)}`,
      name: `${name} (Sub-Tenant)`,
      description: `Sub-tenant plan under ${parentOrgId}`,
      price: { monthly: price, yearly: price * 10 },
      features: ['Sub-tenant managed'],
      limits,
      meteredFeatures: [],
      tier: 0,
    };
    this.plans.push(plan);
    return plan;
  }

  // ─── Payment Method Management ──────────────────────────────

  private paymentMethods: Map<string, { id: string; type: string; last4: string; expiryMonth: number; expiryYear: number; isDefault: boolean; billingDetails: Record<string, string> }[]> = new Map();

  addPaymentMethod(orgId: string, type: string, last4: string, expiryMonth: number, expiryYear: number): { id: string } {
    const methods = this.paymentMethods.get(orgId) || [];
    const id = `pm_${crypto.randomUUID().substring(0, 12)}`;
    methods.push({ id, type, last4, expiryMonth, expiryYear, isDefault: methods.length === 0, billingDetails: {} });
    this.paymentMethods.set(orgId, methods);
    return { id };
  }

  getPaymentMethods(orgId: string): { id: string; type: string; last4: string; expiryMonth: number; expiryYear: number; isDefault: boolean }[] {
    return this.paymentMethods.get(orgId) || [];
  }

  setDefaultPaymentMethod(orgId: string, methodId: string): boolean {
    const methods = this.paymentMethods.get(orgId);
    if (!methods) return false;
    const target = methods.find(m => m.id === methodId);
    if (!target) return false;
    methods.forEach(m => m.isDefault = false);
    target.isDefault = true;
    return true;
  }

  removePaymentMethod(orgId: string, methodId: string): boolean {
    const methods = this.paymentMethods.get(orgId);
    if (!methods) return false;
    const idx = methods.findIndex(m => m.id === methodId);
    if (idx < 0) return false;
    methods.splice(idx, 1);
    if (methods.length > 0 && !methods.some(m => m.isDefault)) methods[0].isDefault = true;
    return true;
  }

  // ─── Billing History Export ─────────────────────────────────

  exportBillingHistory(orgId: string, format: 'csv' | 'json' = 'json'): string {
    const invoices = this.getInvoices(orgId);
    if (format === 'csv') {
      const header = 'Invoice Number,Date,Period Start,Period End,Subtotal,Tax,Total,Status,Paid At\n';
      const rows = invoices.map(i =>
        `${i.number},${i.createdAt.substring(0, 10)},${i.periodStart.substring(0, 10)},${i.periodEnd.substring(0, 10)},${i.subtotal},${i.tax},${i.total},${i.status},${i.paidAt || ''}`
      ).join('\n');
      return header + rows;
    }
    return JSON.stringify(invoices, null, 2);
  }

  // ─── Subscription Proration ─────────────────────────────────

  calculateProration(currentPlan: string, newPlan: string, daysRemainingInPeriod: number): { credit: number; charge: number; netAmount: number } {
    const current = this.getPlan(currentPlan);
    const next = this.getPlan(newPlan);
    if (!current || !next) return { credit: 0, charge: 0, netAmount: 0 };
    const periodDays = 30;
    const dailyCurrent = current.price.monthly / periodDays;
    const dailyNext = next.price.monthly / periodDays;
    const credit = Math.round(dailyCurrent * daysRemainingInPeriod * 100) / 100;
    const charge = Math.round(dailyNext * daysRemainingInPeriod * 100) / 100;
    return { credit, charge, netAmount: charge - credit };
  }

  generateProratedInvoice(orgId: string, fromPlan: string, toPlan: string, daysRemaining: number, countryCode?: string, region?: string): Invoice {
    const proration = this.calculateProration(fromPlan, toPlan, daysRemaining);
    const invoice: Invoice = {
      id: `inv_${crypto.randomUUID().substring(0, 12)}`,
      orgId,
      number: `INV-${new Date().getFullYear()}-${String(this.invoices.length + 1).padStart(4, '0')}`,
      periodStart: new Date().toISOString(),
      periodEnd: new Date(Date.now() + daysRemaining * 86400000).toISOString(),
      lines: [
        { description: `Credit: ${fromPlan} (${daysRemaining} days unused)`, quantity: 1, unitPrice: proration.credit, total: -proration.credit },
        { description: `Charge: ${toPlan} (${daysRemaining} days remaining)`, quantity: 1, unitPrice: proration.charge, total: proration.charge },
      ],
      subtotal: proration.netAmount,
      tax: 0,
      taxRate: 0,
      discounts: 0,
      total: proration.netAmount,
      currency: 'USD',
      status: 'draft',
      paidAt: null,
      pdfUrl: null,
      createdAt: new Date().toISOString(),
    };
    if (countryCode) {
      const tax = this.calculateTax(invoice.subtotal, countryCode, region);
      invoice.taxRate = tax.rate;
      invoice.tax = tax.amount;
      invoice.total = invoice.subtotal + tax.amount;
    }
    this.invoices.push(invoice);
    return invoice;
  }

  // ─── Invoice PDF Generation ─────────────────────────────────

  generateInvoicePdfHtml(invoice: Invoice, orgName: string): string {
    const linesHtml = invoice.lines.map(l =>
      `<tr><td>${l.description}</td><td>${l.quantity}</td><td>$${l.unitPrice.toFixed(2)}</td><td>$${Math.abs(l.total).toFixed(2)}</td></tr>`
    ).join('\n');
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 40px; }
h1 { color: #4F46E5; font-size: 28px; margin-bottom: 4px; }
.header { display: flex; justify-content: space-between; margin-bottom: 32px; }
.meta { color: #666; margin-bottom: 24px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
th { background: #f5f5f5; padding: 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
td { padding: 10px; border-bottom: 1px solid #eee; }
.total-row { font-weight: 700; font-size: 16px; }
.total-row td { border-top: 2px solid #333; }
.footer { margin-top: 40px; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 16px; }
</style></head><body>
<div class="header"><div><h1>INVOICE</h1><p style="color:#666;">${orgName}</p></div><div style="text-align:right;"><p><strong>${invoice.number}</strong></p><p>${new Date(invoice.createdAt).toLocaleDateString()}</p></div></div>
<div class="meta"><p><strong>Period:</strong> ${new Date(invoice.periodStart).toLocaleDateString()} - ${new Date(invoice.periodEnd).toLocaleDateString()}</p>
<p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p></div>
<table><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>
${linesHtml}</tbody></table>
<p class="total-row">Total: $${invoice.total.toFixed(2)} ${invoice.currency}</p>
<div class="footer"><p>SUKIT Inc. - support@sukit.dev - https://sukit.dev</p><p>Thank you for your business!</p></div>
</body></html>`;
  }
}
