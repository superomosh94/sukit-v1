import { prisma } from '@/lib/db/prisma';
import { emit } from '@/lib/marketplace/utils/events';
import { audit } from '@/lib/marketplace/utils/audit';
import { generateLicenseKey } from '@/lib/marketplace/utils/crypto';

const PLATFORM_FEE = 0.3; // 30% platform, 70% developer

function fee(amount: number) {
  return Math.round(amount * PLATFORM_FEE * 100) / 100;
}
function developerAmount(amount: number) {
  return Math.round(amount * (1 - PLATFORM_FEE) * 100) / 100;
}

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';

async function stripeRequest(path: string, init: RequestInit = {}) {
  if (!STRIPE_KEY) throw new Error('Stripe not configured');
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(init.headers as Record<string, string>),
    },
  });
  if (!res.ok)
    throw new Error(`Stripe error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function paypalRequest(path: string, init: RequestInit = {}) {
  if (!PAYPAL_CLIENT_ID) throw new Error('PayPal not configured');
  const base =
    process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const { access_token } = await tokenRes.json();
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    },
  });
}

export type CheckoutItem = {
  moduleId: string;
  quantity?: number;
  plan?: 'monthly' | 'yearly';
};

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  items: CheckoutItem[]
) {
  if (!items || items.length === 0) throw new Error('Cart is empty');
  const moduleIds = items.map((i) => i.moduleId);
  const mods = await prisma.marketplaceModule.findMany({
    where: { OR: [{ id: { in: moduleIds } }, { moduleId: { in: moduleIds } }] },
  });
  let subtotal = 0;
  const lineItems: any[] = [];
  for (const item of items) {
    const m = mods.find(
      (m) => m.id === item.moduleId || m.moduleId === item.moduleId
    );
    if (!m) throw new Error(`Module ${item.moduleId} not found`);
    const qty = item.quantity || 1;
    let price = m.price || 0;
    if (m.priceModel === 'subscription') {
      price =
        item.plan === 'yearly'
          ? m.subscriptionPriceYearly || price * 12
          : m.subscriptionPriceMonthly || price;
    }
    subtotal += price * qty;
    lineItems.push({
      moduleId: m.id,
      moduleSlug: m.moduleId,
      name: m.name,
      quantity: qty,
      unitPrice: price,
      total: price * qty,
      plan: item.plan,
    });
  }
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + tax;
  return {
    id: `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    items: lineItems,
    subtotal,
    tax,
    discount: 0,
    total,
    currency: 'USD',
    paymentMethods: ['stripe', 'paypal', ...(PAYPAL_CLIENT_ID ? [] : [])],
  };
}

const COUPONS: Record<string, any> = {
  WELCOME10: { type: 'percentage', value: 10, usedCount: 0, maxUses: 1000 },
  SAVE20: { type: 'percentage', value: 20, usedCount: 0, maxUses: 500 },
  FLAT5: { type: 'fixed', value: 5, usedCount: 0, maxUses: 1000 },
};

export async function applyCoupon(code: string, subtotal: number) {
  const upper = code.toUpperCase().trim();
  const coupon = COUPONS[upper];
  if (!coupon) throw new Error('Invalid coupon code');
  if (coupon.usedCount >= coupon.maxUses)
    throw new Error('Coupon has been fully redeemed');
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    throw new Error('Coupon has expired');
  const discount =
    coupon.type === 'percentage'
      ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
      : Math.min(subtotal, coupon.value);
  return {
    code: upper,
    type: coupon.type,
    value: coupon.value,
    usedCount: coupon.usedCount,
    discount,
  };
}

export async function processPayment(opts: {
  userId: string;
  userName: string;
  userEmail: string;
  items: CheckoutItem[];
  paymentMethod: 'stripe' | 'paypal' | 'bank';
  paymentId: string;
  couponCode?: string;
}) {
  const session = await createCheckoutSession(
    opts.userId,
    opts.userEmail,
    opts.items
  );
  let discount = 0;
  if (opts.couponCode) {
    const c = await applyCoupon(opts.couponCode, session.subtotal);
    discount = c.discount;
  }
  const total = session.total - discount;
  const txns: any[] = [];
  for (const item of session.items) {
    const m = await prisma.marketplaceModule.findUnique({
      where: { id: item.moduleId },
    });
    if (!m) continue;
    const txn = await prisma.transaction.create({
      data: {
        moduleId: m.id,
        buyerId: opts.userId,
        buyerName: opts.userName,
        buyerEmail: opts.userEmail,
        amount: item.total,
        fee: fee(item.total),
        developerAmount: developerAmount(item.total),
        paymentMethod: opts.paymentMethod,
        paymentId: opts.paymentId,
        status: 'completed',
        completedAt: new Date(),
      },
    });
    if (m.priceModel !== 'free' && m.price && m.price > 0) {
      const licenseKey = generateLicenseKey();
      await prisma.license.create({
        data: {
          key: licenseKey,
          moduleId: m.id,
          userId: opts.userId,
          transactionId: txn.id,
          status: 'active',
          maxActivations: 3,
        },
      });
      // @ts-ignore
      txn.licenseKey = licenseKey;
    }
    if (m.priceModel === 'subscription') {
      const now = new Date();
      const periodEnd = new Date(now);
      if (item.plan === 'yearly')
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      else periodEnd.setMonth(periodEnd.getMonth() + 1);
      await prisma.subscription.create({
        data: {
          moduleId: m.id,
          userId: opts.userId,
          userEmail: opts.userEmail,
          plan: item.plan || 'monthly',
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          amount: item.unitPrice,
        },
      });
    }
    txns.push(txn);
    await emit('payment.succeeded', {
      transactionId: txn.id,
      moduleId: m.moduleId,
      amount: item.total,
    });
  }
  return {
    success: true,
    transactionIds: txns.map((t) => t.id),
    licenseKeys: txns.map((t) => (t as any).licenseKey).filter(Boolean),
    total,
  };
}

export async function listPaymentMethods(userId: string) {
  const txns = await prisma.transaction.findMany({
    where: { buyerId: userId, status: 'completed' },
    select: { paymentMethod: true },
    distinct: ['paymentMethod'],
  });
  return {
    gateways: [
      {
        id: 'stripe',
        name: 'Credit Card (Stripe)',
        enabled: Boolean(STRIPE_KEY),
      },
      { id: 'paypal', name: 'PayPal', enabled: Boolean(PAYPAL_CLIENT_ID) },
      { id: 'bank', name: 'Bank Transfer', enabled: true },
    ],
    savedMethods: txns.map((t) => ({ type: t.paymentMethod })),
  };
}

export async function savePaymentMethod(userId: string, _data: any) {
  // We don't store full payment details (PCI compliance) — just record preference
  return { success: true, userId };
}

export async function listLicenses(userId: string) {
  return prisma.license.findMany({
    where: { userId },
    include: { module: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function activateLicense(licenseKey: string, domain: string) {
  const license = await prisma.license.findUnique({
    where: { key: licenseKey },
  });
  if (!license) throw new Error('License not found');
  if (license.status === 'revoked') throw new Error('License has been revoked');
  if (license.expiresAt && license.expiresAt < new Date())
    throw new Error('License has expired');
  const domains = license.domains || [];
  if (domains.length >= license.maxActivations && !domains.includes(domain)) {
    throw new Error(`Maximum activations (${license.maxActivations}) reached`);
  }
  const updated = await prisma.license.update({
    where: { id: license.id },
    data: {
      domains: domains.includes(domain) ? domains : [...domains, domain],
      activatedAt: license.activatedAt || new Date(),
    },
  });
  await emit('license.activated', { key: licenseKey, domain });
  return {
    success: true,
    activationsRemaining: license.maxActivations - updated.domains.length,
  };
}

export async function deactivateLicense(licenseKey: string, domain: string) {
  const license = await prisma.license.findUnique({
    where: { key: licenseKey },
  });
  if (!license) throw new Error('License not found');
  const updated = await prisma.license.update({
    where: { id: license.id },
    data: { domains: (license.domains || []).filter((d) => d !== domain) },
  });
  await emit('license.deactivated', { key: licenseKey, domain });
  return { success: true };
}

export async function transferLicense(
  licenseKey: string,
  fromUserId: string,
  toUserId: string
) {
  const license = await prisma.license.findUnique({
    where: { key: licenseKey },
  });
  if (!license) throw new Error('License not found');
  if (license.userId !== fromUserId) throw new Error('Not your license');
  return prisma.license.update({
    where: { id: license.id },
    data: { userId: toUserId, domains: [] },
  });
}

export async function validateLicense(licenseKey: string) {
  const license = await prisma.license.findUnique({
    where: { key: licenseKey },
    include: { module: true },
  });
  if (!license) return { valid: false, license: null, expiresIn: 0 };
  if (license.status !== 'active')
    return { valid: false, license, expiresIn: 0 };
  if (license.expiresAt && license.expiresAt < new Date())
    return { valid: false, license, expiresIn: 0 };
  const expiresIn = license.expiresAt
    ? Math.ceil((license.expiresAt.getTime() - Date.now()) / 86400000)
    : 365;
  return { valid: true, license, expiresIn };
}

export async function listSubscriptions(userId: string) {
  return prisma.subscription.findMany({
    where: { userId },
    include: { module: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function cancelSubscription(userId: string, subId: string) {
  const sub = await prisma.subscription.findUnique({ where: { id: subId } });
  if (!sub) throw new Error('Subscription not found');
  if (sub.userId !== userId) throw new Error('Not your subscription');
  const updated = await prisma.subscription.update({
    where: { id: subId },
    data: { cancelAtPeriodEnd: true, canceledAt: new Date() },
  });
  await emit('subscription.canceled', { subscriptionId: subId });
  return updated;
}

export async function pauseSubscription(userId: string, subId: string) {
  const sub = await prisma.subscription.findUnique({ where: { id: subId } });
  if (!sub) throw new Error('Subscription not found');
  if (sub.userId !== userId) throw new Error('Not your subscription');
  return prisma.subscription.update({
    where: { id: subId },
    data: { status: 'paused', pausedAt: new Date() },
  });
}

export async function resumeSubscription(userId: string, subId: string) {
  const sub = await prisma.subscription.findUnique({ where: { id: subId } });
  if (!sub) throw new Error('Subscription not found');
  if (sub.userId !== userId) throw new Error('Not your subscription');
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  return prisma.subscription.update({
    where: { id: subId },
    data: {
      status: 'active',
      resumedAt: new Date(),
      currentPeriodEnd: periodEnd,
    },
  });
}

export async function changePlan(userId: string, subId: string, plan: string) {
  const sub = await prisma.subscription.findUnique({ where: { id: subId } });
  if (!sub) throw new Error('Subscription not found');
  if (sub.userId !== userId) throw new Error('Not your subscription');
  return prisma.subscription.update({
    where: { id: subId },
    data: { plan },
  });
}

export async function updateSubscriptionPaymentMethod(
  userId: string,
  subId: string,
  method: string
) {
  const sub = await prisma.subscription.findUnique({ where: { id: subId } });
  if (!sub) throw new Error('Subscription not found');
  if (sub.userId !== userId) throw new Error('Not your subscription');
  return prisma.subscription.update({
    where: { id: subId },
    data: { paymentMethod: method },
  });
}

export async function listBilling(userId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const [entries, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count({ where: { buyerId: userId } }),
  ]);
  return {
    entries,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function generateInvoicePdf(transactionId: string) {
  const txn = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { module: true },
  });
  if (!txn) throw new Error('Transaction not found');
  // Minimal PDF generation: build a text-based PDF manually
  const text = `Invoice\n\nTransaction: ${txn.id}\nModule: ${txn.module.name}\nAmount: ${txn.currency} ${txn.amount.toFixed(2)}\nDate: ${txn.createdAt.toISOString()}\nBuyer: ${txn.buyerName} <${txn.buyerEmail}>\nStatus: ${txn.status}`;
  return text;
}

export async function requestRefund(opts: {
  userId: string;
  transactionId: string;
  reason: string;
}) {
  const txn = await prisma.transaction.findUnique({
    where: { id: opts.transactionId },
  });
  if (!txn) throw new Error('Transaction not found');
  if (txn.buyerId !== opts.userId) throw new Error('Not your transaction');
  if (txn.status === 'refunded') throw new Error('Already refunded');
  const ageMs = Date.now() - txn.createdAt.getTime();
  if (ageMs > 30 * 24 * 60 * 60 * 1000) {
    throw new Error('Refund window (30 days) has passed');
  }
  const updated = await prisma.transaction.update({
    where: { id: opts.transactionId },
    data: { refundAmount: txn.amount, refundReason: opts.reason },
  });
  await emit('refund.requested', { transactionId: opts.transactionId });
  return {
    transactionId: opts.transactionId,
    amount: txn.amount,
    reason: opts.reason,
    status: 'pending',
  };
}

export async function getRefundStatus(transactionId: string) {
  const txn = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { refundAmount: true, refundReason: true, refundedAt: true },
  });
  if (!txn) return { status: 'unknown' };
  if (!txn.refundedAt) return { status: 'none' };
  return {
    status: txn.refundAmount === txn.refundAmount ? 'completed' : 'pending',
    amount: txn.refundAmount,
    reason: txn.refundReason,
    processedAt: txn.refundedAt,
  };
}

export async function refundPolicy() {
  return {
    refundDays: 30,
    autoRefundDays: 7,
    policy:
      '30-day money-back guarantee. Refunds within 7 days are processed automatically. Beyond 7 days, refunds are reviewed by the developer.',
  };
}

export async function listDeveloperPayouts(developerId: string) {
  const transactions = await prisma.transaction.findMany({
    where: {
      module: { authorId: developerId },
      status: 'completed',
      refundedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });
  const totalPaid = transactions
    .filter((t) => t.refundedAt)
    .reduce((s, t) => s + (t.developerAmount || 0), 0);
  const pendingAmount = transactions
    .filter((t) => !t.refundedAt)
    .reduce((s, t) => s + (t.developerAmount || 0), 0);
  return {
    payouts: [],
    totalPaid,
    pendingAmount,
    nextPayoutDate: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    minimumPayout: 50,
    revenueShare: 1 - PLATFORM_FEE,
  };
}

export async function requestPayout(developerId: string) {
  const dev = await prisma.developer.findUnique({ where: { id: developerId } });
  if (!dev) throw new Error('Developer not found');
  if (!dev.payoutMethod) throw new Error('Configure payout method first');
  if (dev.unpaidEarnings < 50)
    throw new Error('Below minimum payout threshold ($50)');
  // Mark as paid in a real implementation via Stripe Connect
  await emit('payout.requested', { developerId, amount: dev.unpaidEarnings });
  await audit('payout.request' as any, {
    resourceType: 'developer',
    resourceId: developerId,
    changes: { amount: dev.unpaidEarnings },
  });
  return {
    success: true,
    payoutId: `po_${Date.now()}`,
    amount: dev.unpaidEarnings,
    message: 'Payout requested',
  };
}

export async function updatePayoutMethod(developerId: string, method: any) {
  return prisma.developer.update({
    where: { id: developerId },
    data: {
      payoutMethod: method.method,
      payoutEmail: method.email,
      payoutCountry: method.country,
      taxId: method.taxId,
    },
  });
}

export async function listTransactions(filters: any = {}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(100, filters.pageSize ?? 20);
  const where: any = {};
  if (filters.buyerId) where.buyerId = filters.buyerId;
  if (filters.moduleId) where.moduleId = filters.moduleId;
  if (filters.status) where.status = filters.status;
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { module: { select: { moduleId: true, name: true } } },
    }),
    prisma.transaction.count({ where }),
  ]);
  return { transactions, total, page, pageSize };
}

export async function issueAdminRefund(
  transactionId: string,
  amount?: number,
  reason?: string
) {
  const txn = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!txn) throw new Error('Transaction not found');
  if (txn.status === 'refunded') throw new Error('Already refunded');
  const refundAmount = amount ?? txn.amount;
  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'refunded',
      refundAmount,
      refundReason: reason || 'Admin refund',
      refundedAt: new Date(),
    },
  });
  await emit('refund.completed', { transactionId, amount: refundAmount });
  await audit('refund.approve' as any, {
    resourceType: 'transaction',
    resourceId: transactionId,
    changes: { amount: refundAmount, reason },
  });
  return { success: true, transaction: updated };
}

export async function createStripeCheckoutSession(opts: {
  moduleIds: string[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!STRIPE_KEY) {
    return {
      sessionId: `cs_dev_${Date.now()}`,
      url: opts.successUrl + '?session_id=cs_dev_placeholder',
      mode: 'sandbox',
    };
  }
  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', opts.successUrl);
  params.append('cancel_url', opts.cancelUrl);
  params.append('customer_email', opts.customerEmail);
  for (const id of opts.moduleIds) {
    params.append('line_items[][quantity]', '1');
    params.append('line_items[][price_data][currency]', 'usd');
    params.append('line_items[][price_data][unit_amount]', '1000');
    params.append('line_items[][price_data][product_data][name]', id);
  }
  const res = await stripeRequest('/checkout/sessions', {
    method: 'POST',
    body: params.toString(),
  });
  return { sessionId: res.id, url: res.url };
}
