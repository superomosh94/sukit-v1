import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { emit } from '@/lib/marketplace/utils/events';
import { generateLicenseKey } from '@/lib/marketplace/utils/crypto';
import Stripe from 'stripe';

const PLATFORM_FEE = 0.3;

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });
}

function getWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || '';
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const payload = await request.text();

  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as any;
        await handleCheckoutExpired(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as any;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
    }
  } catch (error) {
    console.error('[stripe/webhook] handler failed:', event.type, error);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: any) {
  const metadata = session.metadata || {};
  const moduleIds = metadata.moduleIds?.split(',') || [];
  const userId = metadata.userId || session.client_reference_id;
  const userName = metadata.userName || '';
  const userEmail = metadata.userEmail || session.customer_details?.email || '';
  const couponCode = metadata.couponCode;
  const plans = metadata.plans ? JSON.parse(metadata.plans) : {};

  if (!userId || moduleIds.length === 0) return;

  const mods = await prisma.marketplaceModule.findMany({
    where: { OR: [{ id: { in: moduleIds } }, { moduleId: { in: moduleIds } }] },
  });

  for (const moduleId of moduleIds) {
    const m = mods.find(
      (mod) => mod.id === moduleId || mod.moduleId === moduleId
    );
    if (!m) continue;

    const plan = plans[moduleId] || 'monthly';
    let amount = m.price || 0;
    if (m.priceModel === 'subscription') {
      amount =
        plan === 'yearly'
          ? m.subscriptionPriceYearly || amount * 12
          : m.subscriptionPriceMonthly || amount;
    }

    const txn = await prisma.transaction.create({
      data: {
        moduleId: m.id,
        buyerId: userId,
        buyerName: userName,
        buyerEmail: userEmail,
        amount,
        fee: Math.round(amount * PLATFORM_FEE * 100) / 100,
        developerAmount: Math.round(amount * (1 - PLATFORM_FEE) * 100) / 100,
        paymentMethod: 'stripe',
        paymentId: session.id,
        type: m.priceModel === 'subscription' ? 'subscription' : 'purchase',
        status: 'completed',
        completedAt: new Date(),
        receiptUrl: session.receipt_url || undefined,
      },
    });

    if (m.priceModel !== 'free' && m.price && m.price > 0) {
      const licenseKey = generateLicenseKey();
      await prisma.license.create({
        data: {
          key: licenseKey,
          moduleId: m.id,
          userId,
          transactionId: txn.id,
          status: 'active',
          maxActivations: 3,
        },
      });
    }

    if (m.priceModel === 'subscription') {
      const now = new Date();
      const periodEnd = new Date(now);
      if (plan === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      else periodEnd.setMonth(periodEnd.getMonth() + 1);

      await prisma.subscription.upsert({
        where: {
          id: `stripe_${session.id}_${moduleId}`,
        },
        create: {
          id: `stripe_${session.id}_${moduleId}`,
          moduleId: m.id,
          userId,
          userEmail,
          plan,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          amount,
          gatewayId: 'stripe',
          gatewayCustomerId: (session.customer as string) || '',
          gatewaySubscriptionId: (session.subscription as string) || '',
        },
        update: {
          status: 'active',
          currentPeriodEnd: periodEnd,
          gatewaySubscriptionId: (session.subscription as string) || '',
        },
      });
    }

    await emit('payment.succeeded', {
      transactionId: txn.id,
      moduleId: m.moduleId,
      amount,
    });
  }
}

async function handleCheckoutExpired(session: any) {
  console.warn('[stripe] Checkout session expired:', session.id);
}

async function handleSubscriptionUpdated(subscription: any) {
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    trialing: 'trialing',
    incomplete: 'incomplete',
    incomplete_expired: 'expired',
    paused: 'paused',
  };

  const status = statusMap[subscription.status] || subscription.status;
  const currentPeriodStart = new Date(subscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  await prisma.subscription.updateMany({
    where: { gatewaySubscriptionId: subscription.id },
    data: {
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  await prisma.subscription.updateMany({
    where: { gatewaySubscriptionId: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    },
  });
}

async function handleInvoicePaid(invoice: any) {
  if (!invoice.subscription) return;
  const subId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription.id;

  const currentPeriodEnd = new Date(
    (invoice.lines?.data?.[0]?.period?.end || 0) * 1000
  );

  await prisma.subscription.updateMany({
    where: { gatewaySubscriptionId: subId },
    data: {
      status: 'active',
      currentPeriodEnd,
    },
  });

  const subs = await prisma.subscription.findMany({
    where: { gatewaySubscriptionId: subId },
    include: { module: true },
  });

  for (const sub of subs) {
    await prisma.transaction.create({
      data: {
        moduleId: sub.moduleId,
        buyerId: sub.userId,
        buyerName: '',
        buyerEmail: sub.userEmail || '',
        amount: invoice.amount_paid / 100,
        fee: Math.round((invoice.amount_paid / 100) * PLATFORM_FEE * 100) / 100,
        developerAmount:
          Math.round((invoice.amount_paid / 100) * (1 - PLATFORM_FEE) * 100) /
          100,
        paymentMethod: 'stripe',
        paymentId: invoice.id,
        type: 'subscription',
        status: 'completed',
        completedAt: new Date(),
        receiptUrl: invoice.receipt_url || undefined,
      },
    });

    await emit('subscription.renewed', {
      subscriptionId: sub.id,
      amount: invoice.amount_paid / 100,
      moduleId: sub.module.moduleId,
    });
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  if (!invoice.subscription) return;
  const subId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription.id;

  await prisma.subscription.updateMany({
    where: { gatewaySubscriptionId: subId },
    data: { status: 'past_due' },
  });

  await emit('payment.failed', {
    subscriptionId: subId,
    invoiceId: invoice.id,
    amount: invoice.amount_due / 100,
  });
}
