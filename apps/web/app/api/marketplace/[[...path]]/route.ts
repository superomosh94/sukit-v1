import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const handlers: Record<
  string,
  (params: any, body?: any) => Promise<NextResponse>
> = {
  // ─── Registry ───────────────────────────────────────────────────
  async 'GET /modules'(params) {
    const { searchParams } = new URL(params.url);
    const { listModules } = await import('@/lib/marketplace/services/registry');
    const result = await listModules({
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      sort: (searchParams.get('sort') as any) || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      staffPick: searchParams.get('staffPick') === 'true' ? true : undefined,
      priceModel: (searchParams.get('priceModel') as any) || undefined,
      minRating: searchParams.get('minRating')
        ? parseFloat(searchParams.get('minRating')!)
        : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      status: searchParams.get('status') || undefined,
      authorId: searchParams.get('authorId') || undefined,
    });
    return NextResponse.json(result);
  },
  async 'GET /modules/:id'(params) {
    const { getModuleById } =
      await import('@/lib/marketplace/services/registry');
    const mod = await getModuleById(params.id);
    if (!mod)
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    return NextResponse.json(mod);
  },
  async 'GET /modules/:id/versions'(params) {
    const { getModuleVersions } =
      await import('@/lib/marketplace/services/registry');
    return NextResponse.json(await getModuleVersions(params.id));
  },
  async 'GET /modules/:id/dependencies'(params) {
    const { getDependencies } =
      await import('@/lib/marketplace/services/registry');
    return NextResponse.json(await getDependencies(params.id));
  },
  async 'GET /modules/:id/dependencies/check'(params) {
    const { checkDependencies } =
      await import('@/lib/marketplace/services/registry');
    return NextResponse.json(await checkDependencies(params.id));
  },
  async 'GET /modules/:id/dependencies/resolve'(params) {
    const { resolveDependencies } =
      await import('@/lib/marketplace/services/registry');
    return NextResponse.json(await resolveDependencies(params.id));
  },
  async 'GET /modules/:id/update-history'(params) {
    const { getUpdateHistory } =
      await import('@/lib/marketplace/services/registry');
    return NextResponse.json(await getUpdateHistory(params.id));
  },
  async 'GET /featured'(params) {
    const { listFeatured } =
      await import('@/lib/marketplace/services/registry');
    const { searchParams } = new URL(params.url);
    return NextResponse.json(
      await listFeatured(parseInt(searchParams.get('limit') || '12'))
    );
  },
  async 'GET /popular'(params) {
    const { listPopular } = await import('@/lib/marketplace/services/registry');
    const { searchParams } = new URL(params.url);
    return NextResponse.json(
      await listPopular(
        parseInt(searchParams.get('limit') || '20'),
        searchParams.get('period') as any
      )
    );
  },
  async 'GET /new'(params) {
    const { listNew } = await import('@/lib/marketplace/services/registry');
    const { searchParams } = new URL(params.url);
    return NextResponse.json(
      await listNew(parseInt(searchParams.get('limit') || '20'))
    );
  },
  async 'GET /categories'(params) {
    const { listCategories } =
      await import('@/lib/marketplace/services/registry');
    return NextResponse.json(await listCategories());
  },
  async 'GET /tags'(params) {
    const { listTags } = await import('@/lib/marketplace/services/registry');
    return NextResponse.json(await listTags());
  },
  async 'GET /search'(params) {
    const { searchParams } = new URL(params.url);
    const { listModules } = await import('@/lib/marketplace/services/registry');
    const result = await listModules({
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      sort: (searchParams.get('sort') as any) || 'relevance',
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
    });
    return NextResponse.json(result);
  },
  async 'GET /search/suggestions'(params) {
    const { searchParams } = new URL(params.url);
    const { searchSuggestions } =
      await import('@/lib/marketplace/services/registry');
    return NextResponse.json(
      await searchSuggestions(searchParams.get('q') || '')
    );
  },

  // ─── Install ────────────────────────────────────────────────────
  async 'POST /install/:moduleId'(params, body) {
    const { installModule } =
      await import('@/lib/marketplace/services/installer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    const user = await requireUser(req);
    const result = await installModule(params.moduleId, {
      userId: user.id,
      siteId: body?.siteId,
      channel: body?.channel,
      autoUpdate: body?.autoUpdate,
      pinVersion: body?.pinVersion,
      permissions: body?.permissions,
      version: body?.version,
    });
    return NextResponse.json(result);
  },
  async 'POST /install/url'(params, body) {
    const { installFromUrl } =
      await import('@/lib/marketplace/services/installer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url, { method: 'POST' });
    const user = await requireUser(req);
    const result = await installFromUrl(body?.url, {
      userId: user.id,
      siteId: body?.siteId,
      autoUpdate: body?.autoUpdate,
    });
    return NextResponse.json(result);
  },
  async 'POST /install/file'(params, _body) {
    const { installFromFile } =
      await import('@/lib/marketplace/services/installer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const form = await req.formData().catch(() => null);
    const file = form?.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await installFromFile(buf, { userId: user.id });
    return NextResponse.json(result);
  },
  async 'POST /install/:moduleId/rollback'(params, body) {
    const { rollbackInstall } =
      await import('@/lib/marketplace/services/installer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await rollbackInstall(params.moduleId, user.id));
  },
  async 'POST /uninstall/:moduleId'(params, body) {
    const { uninstallModule } =
      await import('@/lib/marketplace/services/installer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await uninstallModule(params.moduleId, user.id, {
        backup: body?.backup,
        reason: body?.reason,
      })
    );
  },
  async 'GET /installed'(params) {
    const { listInstalled } =
      await import('@/lib/marketplace/services/installer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const { searchParams } = new URL(params.url);
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await listInstalled(user.id, searchParams.get('siteId') || undefined)
    );
  },
  async 'POST /backup/:moduleId'(params) {
    const { createBackup } =
      await import('@/lib/marketplace/services/installer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await createBackup(params.moduleId, user.id));
  },
  async 'POST /restore/:moduleId'(params, body) {
    const { restoreBackup } =
      await import('@/lib/marketplace/services/installer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await restoreBackup(params.moduleId, user.id, body?.backupId)
    );
  },

  // ─── Updates ────────────────────────────────────────────────────
  async 'POST /update/:moduleId'(params, body) {
    const { applyUpdate } = await import('@/lib/marketplace/services/updates');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await applyUpdate(params.moduleId, user.id, {
        version: body?.version,
        channel: body?.channel,
      })
    );
  },
  async 'POST /update-all'(params, body) {
    const { updateAll } = await import('@/lib/marketplace/services/updates');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await updateAll(user.id, { channel: body?.channel })
    );
  },
  async 'POST /rollback/:moduleId'(params, _body) {
    const { rollbackInstall } =
      await import('@/lib/marketplace/services/installer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await rollbackInstall(params.moduleId, user.id));
  },
  async 'GET /updates/check'(params) {
    const { checkUpdates } = await import('@/lib/marketplace/services/updates');
    const { searchParams } = new URL(params.url);
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await checkUpdates(user.id, searchParams.get('siteId') || undefined)
    );
  },
  async 'PUT /updates/auto/:moduleId'(params, body) {
    const { setAutoUpdate } =
      await import('@/lib/marketplace/services/updates');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await setAutoUpdate(params.moduleId, user.id, body?.enabled ?? true)
    );
  },
  async 'PUT /updates/pin/:moduleId'(params, body) {
    const { pinVersion } = await import('@/lib/marketplace/services/updates');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await pinVersion(params.moduleId, user.id, body?.version || null)
    );
  },
  async 'PUT /updates/channel/:moduleId'(params, body) {
    const { setChannel } = await import('@/lib/marketplace/services/updates');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await setChannel(params.moduleId, user.id, body?.channel)
    );
  },

  // ─── Payments / Checkout ────────────────────────────────────────
  async 'POST /checkout/create'(params, body) {
    const { createCheckoutSession } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await createCheckoutSession(user.id, user.email, body?.items || [])
    );
  },
  async 'POST /checkout/stripe'(params, body) {
    const { createStripeCheckoutSession } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const result = await createStripeCheckoutSession({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      items: body?.items || [],
      successUrl:
        body?.successUrl ||
        `${process.env.APP_URL || 'http://localhost:3042'}/billing?success=1`,
      cancelUrl:
        body?.cancelUrl ||
        `${process.env.APP_URL || 'http://localhost:3042'}/checkout?canceled=1`,
      couponCode: body?.couponCode,
    });
    return NextResponse.json(result);
  },
  async 'POST /checkout/coupon'(params, body) {
    const { applyCoupon } = await import('@/lib/marketplace/services/payments');
    return NextResponse.json(
      await applyCoupon(body?.code || '', body?.subtotal || 0)
    );
  },
  async 'POST /checkout/pay'(params, body) {
    const { processPayment } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await processPayment({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        items: body?.items || [],
        paymentMethod: body?.paymentMethod || 'stripe',
        paymentId: body?.paymentId || `pay_${Date.now()}`,
        couponCode: body?.couponCode,
      })
    );
  },
  async 'GET /payment-methods'(params) {
    const { listPaymentMethods } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await listPaymentMethods(user.id));
  },
  async 'POST /payment-methods/save'(params, body) {
    const { savePaymentMethod } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await savePaymentMethod(user.id, body));
  },

  // ─── Licenses ───────────────────────────────────────────────────
  async 'GET /licenses'(params) {
    const { listLicenses } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await listLicenses(user.id));
  },
  async 'POST /licenses/activate'(params, body) {
    const { activateLicense } =
      await import('@/lib/marketplace/services/payments');
    return NextResponse.json(
      await activateLicense(body?.key || '', body?.domain || '')
    );
  },
  async 'POST /licenses/deactivate'(params, body) {
    const { deactivateLicense } =
      await import('@/lib/marketplace/services/payments');
    return NextResponse.json(
      await deactivateLicense(body?.key || '', body?.domain || '')
    );
  },
  async 'POST /licenses/transfer'(params, body) {
    const { transferLicense } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await transferLicense(body?.key || '', user.id, body?.toUserId || '')
    );
  },
  async 'GET /licenses/validate/:licenseKey'(params) {
    const { validateLicense } =
      await import('@/lib/marketplace/services/payments');
    return NextResponse.json(await validateLicense(params.licenseKey));
  },

  // ─── Subscriptions ──────────────────────────────────────────────
  async 'GET /subscriptions'(params) {
    const { listSubscriptions } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await listSubscriptions(user.id));
  },
  async 'POST /subscriptions/:id/cancel'(params) {
    const { cancelSubscription } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await cancelSubscription(user.id, params.id));
  },
  async 'POST /subscriptions/:id/pause'(params) {
    const { pauseSubscription } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await pauseSubscription(user.id, params.id));
  },
  async 'POST /subscriptions/:id/resume'(params) {
    const { resumeSubscription } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await resumeSubscription(user.id, params.id));
  },
  async 'POST /subscriptions/:id/change-plan'(params, body) {
    const { changePlan } = await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await changePlan(user.id, params.id, body?.plan || 'monthly')
    );
  },
  async 'PUT /subscriptions/:id/payment-method'(params, body) {
    const { updateSubscriptionPaymentMethod } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await updateSubscriptionPaymentMethod(
        user.id,
        params.id,
        body?.method || ''
      )
    );
  },

  // ─── Stripe Customer Portal ─────────────────────────────────────
  async 'POST /billing/portal'(params, body) {
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
    if (!STRIPE_KEY) {
      return NextResponse.json({ url: '/billing' });
    }
    try {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(STRIPE_KEY, {
        apiVersion: '2025-02-24.acacia' as any,
      });
      const session = await stripe.billingPortal.sessions.create({
        customer: body?.customerId || user.id,
        return_url:
          body?.returnUrl ||
          `${process.env.APP_URL || 'http://localhost:3042'}/billing`,
      });
      return NextResponse.json({ url: session.url });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  },

  // ─── Stripe Checkout Success ─────────────────────────────────────
  async 'GET /checkout/success'(params) {
    const { searchParams } = new URL(params.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing session_id' });
    }
    const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
    if (!STRIPE_KEY || sessionId.startsWith('cs_dev_')) {
      return NextResponse.json({ success: true, mode: 'sandbox', sessionId });
    }
    try {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(STRIPE_KEY, {
        apiVersion: '2025-02-24.acacia' as any,
      });
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return NextResponse.json({
        success: session.payment_status === 'paid',
        sessionId,
        mode: 'live',
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message });
    }
  },

  // ─── Billing ────────────────────────────────────────────────────
  async 'GET /billing'(params) {
    const { listBilling } = await import('@/lib/marketplace/services/payments');
    const { searchParams } = new URL(params.url);
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await listBilling(
        user.id,
        parseInt(searchParams.get('page') || '1'),
        parseInt(searchParams.get('pageSize') || '20')
      )
    );
  },
  async 'GET /billing/invoice/:transactionId'(params) {
    const { generateInvoicePdf } =
      await import('@/lib/marketplace/services/payments');
    const text = await generateInvoicePdf(params.transactionId);
    return new NextResponse(text, {
      headers: { 'Content-Type': 'text/plain' },
    });
  },

  // ─── Refunds ────────────────────────────────────────────────────
  async 'POST /refunds/request'(params, body) {
    const { requestRefund } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await requestRefund({
        userId: user.id,
        transactionId: body?.transactionId,
        reason: body?.reason,
      })
    );
  },
  async 'GET /refunds/status/:transactionId'(params) {
    const { getRefundStatus } =
      await import('@/lib/marketplace/services/payments');
    return NextResponse.json(await getRefundStatus(params.transactionId));
  },
  async 'GET /refunds/policy'() {
    const { refundPolicy } =
      await import('@/lib/marketplace/services/payments');
    return NextResponse.json(await refundPolicy());
  },

  // ─── Reviews ────────────────────────────────────────────────────
  async 'GET /modules/:moduleId/reviews'(params) {
    const { searchParams } = new URL(params.url);
    const { listReviews } = await import('@/lib/marketplace/services/reviews');
    return NextResponse.json(
      await listReviews(params.moduleId, {
        sort: (searchParams.get('sort') as any) || 'recent',
        rating: searchParams.get('rating')
          ? parseInt(searchParams.get('rating')!)
          : undefined,
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        verifiedOnly: searchParams.get('verifiedOnly') === 'true',
      })
    );
  },
  async 'POST /modules/:moduleId/reviews'(params, body) {
    const { submitReview } = await import('@/lib/marketplace/services/reviews');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const rev = await submitReview(
      params.moduleId,
      { id: user.id, name: user.name },
      {
        rating: body?.rating || 5,
        title: body?.title,
        review: body?.review || '',
        pros: body?.pros,
        cons: body?.cons,
        versionUsed: body?.versionUsed,
      }
    );
    return NextResponse.json(rev, { status: 201 });
  },
  async 'GET /modules/:moduleId/reviews/analytics'(params) {
    const { getReviewAnalytics } =
      await import('@/lib/marketplace/services/reviews');
    return NextResponse.json(await getReviewAnalytics(params.moduleId));
  },
  async 'GET /modules/:moduleId/reviews/summary'(params) {
    const { getReviewSummary } =
      await import('@/lib/marketplace/services/reviews');
    return NextResponse.json(await getReviewSummary(params.moduleId));
  },
  async 'PUT /reviews/:reviewId'(params, body) {
    const { updateReview } = await import('@/lib/marketplace/services/reviews');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await updateReview(params.reviewId, user.id, body)
    );
  },
  async 'DELETE /reviews/:reviewId'(params) {
    const { deleteReview } = await import('@/lib/marketplace/services/reviews');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await deleteReview(params.reviewId, user.id));
  },
  async 'POST /reviews/:reviewId/helpful'(params) {
    const { voteHelpful } = await import('@/lib/marketplace/services/reviews');
    return NextResponse.json(await voteHelpful(params.reviewId, true));
  },
  async 'POST /reviews/:reviewId/not-helpful'(params) {
    const { voteHelpful } = await import('@/lib/marketplace/services/reviews');
    return NextResponse.json(await voteHelpful(params.reviewId, false));
  },
  async 'POST /reviews/:reviewId/respond'(params, body) {
    const { respondToReview } =
      await import('@/lib/marketplace/services/reviews');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await respondToReview(
        params.reviewId,
        user.id,
        user.name,
        'developer',
        body?.response || ''
      )
    );
  },
  async 'DELETE /reviews/:reviewId/responses/:responseId'(params) {
    const { deleteResponse } =
      await import('@/lib/marketplace/services/reviews');
    return NextResponse.json(
      await deleteResponse(params.reviewId, params.responseId)
    );
  },
  async 'POST /reviews/:reviewId/appeal'(params, body) {
    const { appealReview } = await import('@/lib/marketplace/services/reviews');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await appealReview(params.reviewId, user.id, body?.reason || '')
    );
  },
  async 'GET /reviews/:reviewId/editable'(params) {
    const { isReviewEditable } =
      await import('@/lib/marketplace/services/reviews');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await isReviewEditable(params.reviewId, user.id));
  },
  async 'POST /reviews/:reviewId/report'(params, body) {
    const { reportReview } = await import('@/lib/marketplace/services/reviews');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await reportReview(params.reviewId, user.id, body?.reason || '')
    );
  },

  // ─── Documentation ──────────────────────────────────────────────
  async 'POST /modules/:moduleId/docs/generate'() {
    const { generateDocs } = await import('@/lib/marketplace/services/docs');
    return NextResponse.json(await generateDocs(params.moduleId));
  },
  async 'POST /modules/:moduleId/docs/generate/readme'(params) {
    const { generateDocs } = await import('@/lib/marketplace/services/docs');
    const docs = await generateDocs(params.moduleId);
    return NextResponse.json(
      docs.sections.find((s: any) => s.type === 'readme')
    );
  },
  async 'POST /modules/:moduleId/docs/generate/installation'(params) {
    const { generateDocs } = await import('@/lib/marketplace/services/docs');
    const docs = await generateDocs(params.moduleId);
    return NextResponse.json(
      docs.sections.find((s: any) => s.type === 'installation')
    );
  },
  async 'POST /modules/:moduleId/docs/generate/configuration'(params) {
    const { generateDocs } = await import('@/lib/marketplace/services/docs');
    const docs = await generateDocs(params.moduleId);
    return NextResponse.json(
      docs.sections.find((s: any) => s.type === 'configuration')
    );
  },
  async 'POST /modules/:moduleId/docs/generate/api'(params) {
    const { generateDocs } = await import('@/lib/marketplace/services/docs');
    const docs = await generateDocs(params.moduleId);
    return NextResponse.json(docs.sections.find((s: any) => s.type === 'api'));
  },
  async 'POST /modules/:moduleId/docs/generate/faq'(params) {
    const { generateDocs } = await import('@/lib/marketplace/services/docs');
    const docs = await generateDocs(params.moduleId);
    return NextResponse.json({
      faq: [],
      section: docs.sections.find((s: any) => s.type === 'faq'),
    });
  },
  async 'POST /modules/:moduleId/docs/generate/troubleshooting'(params) {
    const { generateDocs } = await import('@/lib/marketplace/services/docs');
    const docs = await generateDocs(params.moduleId);
    return NextResponse.json(
      docs.sections.find((s: any) => s.type === 'troubleshooting')
    );
  },
  async 'GET /modules/:moduleId/docs'(params) {
    const { getDocs } = await import('@/lib/marketplace/services/docs');
    return NextResponse.json(await getDocs(params.moduleId));
  },
  async 'PUT /modules/:moduleId/docs'(params, body) {
    const { updateDocs } = await import('@/lib/marketplace/services/docs');
    return NextResponse.json(
      await updateDocs(params.moduleId, body?.content || '')
    );
  },
  async 'POST /modules/docs/upload/screenshot'(params) {
    const { saveUpload } = await import('@/lib/marketplace/storage');
    const req = new Request(params.url);
    const form = await req.formData().catch(() => null);
    const file = form?.get('file') as File | null;
    if (!file)
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    const url = await saveUpload(
      'screenshots',
      file.name,
      Buffer.from(await file.arrayBuffer())
    );
    return NextResponse.json({
      id: url,
      url,
      thumbnailUrl: url,
      width: 1920,
      height: 1080,
      fileSize: file.size,
      type: 'image',
    });
  },
  async 'GET /modules/:moduleId/docs/screenshots'(params) {
    const { listScreenshots } = await import('@/lib/marketplace/services/docs');
    return NextResponse.json(await listScreenshots(params.moduleId));
  },
  async 'PUT /modules/:moduleId/docs/screenshots/reorder'(params, body) {
    const { reorderScreenshots } =
      await import('@/lib/marketplace/services/docs');
    return NextResponse.json(
      await reorderScreenshots(params.moduleId, body?.order || [])
    );
  },
  async 'PUT /modules/docs/screenshots/:id'(params, body) {
    const { updateScreenshot } =
      await import('@/lib/marketplace/services/docs');
    return NextResponse.json(
      await updateScreenshot(params.moduleId || 'main', params.id, body)
    );
  },
  async 'DELETE /modules/docs/screenshots/:id'(params) {
    const { deleteScreenshot } =
      await import('@/lib/marketplace/services/docs');
    return NextResponse.json(
      await deleteScreenshot(params.moduleId || 'main', params.id)
    );
  },
  async 'POST /modules/:moduleId/docs/video'(params, body) {
    const { saveVideo } = await import('@/lib/marketplace/services/docs');
    return NextResponse.json(
      await saveVideo(params.moduleId, { url: body?.url, title: body?.title })
    );
  },
  async 'PUT /modules/:moduleId/docs/section/:section'(params, body) {
    const { updateSection } = await import('@/lib/marketplace/services/docs');
    return NextResponse.json(
      await updateSection(params.moduleId, params.section, body)
    );
  },
  async 'POST /modules/docs/render'(params, body) {
    const { renderMarkdown } = await import('@/lib/marketplace/services/docs');
    return NextResponse.json(await renderMarkdown(body?.content || ''));
  },
  async 'POST /modules/docs/upload/image'(params) {
    const req = new Request(params.url);
    const form = await req.formData().catch(() => null);
    const file = form?.get('file') as File | null;
    if (!file)
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    const { saveUpload } = await import('@/lib/marketplace/storage');
    const url = await saveUpload(
      'docs/images',
      file.name,
      Buffer.from(await file.arrayBuffer())
    );
    return NextResponse.json({ url, width: 800, height: 600 });
  },
  async 'GET /modules/:moduleId/docs/preview'(params) {
    const { previewDocs } = await import('@/lib/marketplace/services/docs');
    return NextResponse.json(await previewDocs(params.moduleId));
  },
  async 'GET /modules/:moduleId/docs/export'(params) {
    const { searchParams } = new URL(params.url);
    const { exportDocs } = await import('@/lib/marketplace/services/docs');
    const content = await exportDocs(
      params.moduleId,
      searchParams.get('format') || 'md'
    );
    const type =
      searchParams.get('format') === 'html'
        ? 'text/html'
        : searchParams.get('format') === 'json'
          ? 'application/json'
          : 'text/markdown';
    return new NextResponse(content, { headers: { 'Content-Type': type } });
  },

  // ─── Developer Portal ───────────────────────────────────────────
  async 'GET /developer/profile'(params) {
    const { getDeveloperProfile } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await getDeveloperProfile(user.id));
  },
  async 'POST /developer/register'(params, body) {
    const { registerDeveloper } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const dev = await registerDeveloper({
      userId: user.id,
      email: user.email,
      name: user.name,
      companyName: body?.companyName,
      website: body?.website,
      bio: body?.bio,
      taxId: body?.taxId,
      payoutMethod: body?.payoutMethod,
      payoutEmail: body?.payoutEmail,
      payoutCountry: body?.payoutCountry,
      agreementAccepted: body?.agreementAccepted,
      agreementVersion: body?.agreementVersion || 'v1.0',
    });
    return NextResponse.json(dev, { status: 201 });
  },
  async 'GET /developer/status'(params) {
    const { getDeveloperStatus } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await getDeveloperStatus(user.id));
  },
  async 'GET /developer/dashboard'(params) {
    const { getDeveloperDashboard } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await getDeveloperDashboard(user.id));
  },
  async 'GET /developer/modules'(params) {
    const { listDeveloperModules } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await listDeveloperModules(user.id));
  },
  async 'POST /developer/modules'(params, body) {
    const { createDeveloperModule } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const mod = await createDeveloperModule({
      userId: user.id,
      userName: user.name,
      name: body?.name || 'Module',
      description: body?.description || '',
      category: body?.category || 'other',
      tags: body?.tags,
      priceModel: body?.priceModel || 'free',
      price: body?.price,
    });
    return NextResponse.json(mod, { status: 201 });
  },
  async 'PUT /developer/modules/:moduleId'(params, body) {
    const { updateDeveloperModule } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await updateDeveloperModule(user.id, params.moduleId, body)
    );
  },
  async 'DELETE /developer/modules/:moduleId'(params) {
    const { deleteDeveloperModule } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await deleteDeveloperModule(user.id, params.moduleId)
    );
  },
  async 'GET /developer/sales'(params) {
    const { getDeveloperSales } =
      await import('@/lib/marketplace/services/developer');
    const { searchParams } = new URL(params.url);
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await getDeveloperSales(user.id, searchParams.get('period') || 'month')
    );
  },
  async 'GET /developer/payouts'(params) {
    const { listDeveloperPayouts } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const dev = await getDeveloperByUserId(user.id);
    if (!dev)
      return NextResponse.json({ payouts: [], totalPaid: 0, pendingAmount: 0 });
    return NextResponse.json(await listDeveloperPayouts(dev.id));
  },
  async 'POST /developer/payouts/request'(params) {
    const { requestPayout } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const dev = await getDeveloperByUserId(user.id);
    if (!dev)
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    return NextResponse.json(await requestPayout(dev.id));
  },
  async 'GET /developer/payouts/history'(params) {
    const { listDeveloperPayouts } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const dev = await getDeveloperByUserId(user.id);
    if (!dev)
      return NextResponse.json({ payouts: [], totalPaid: 0, pendingAmount: 0 });
    return NextResponse.json(await listDeveloperPayouts(dev.id));
  },
  async 'PUT /developer/payouts/method'(params, body) {
    const { updatePayoutMethod } =
      await import('@/lib/marketplace/services/payments');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const dev = await getDeveloperByUserId(user.id);
    if (!dev)
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    return NextResponse.json(await updatePayoutMethod(dev.id, body));
  },
  async 'GET /developer/reviews'(params) {
    const { listDeveloperReviews } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await listDeveloperReviews(user.id));
  },
  async 'POST /developer/modules/upload'(params) {
    const { uploadAsset } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const form = await req.formData().catch(() => null);
    const file = form?.get('file') as File | null;
    if (!file)
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    const { url } = await uploadAsset(
      user.id,
      'module',
      file.name,
      Buffer.from(await file.arrayBuffer())
    );
    return NextResponse.json({
      url,
      size: file.size,
      version: body?.version || '1.0.0',
    });
  },
  async 'POST /developer/modules/upload/screenshot'(params) {
    const { uploadAsset } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const form = await req.formData().catch(() => null);
    const file = form?.get('file') as File | null;
    if (!file)
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    const { url } = await uploadAsset(
      user.id,
      'screenshot',
      file.name,
      Buffer.from(await file.arrayBuffer())
    );
    return NextResponse.json({ url });
  },
  async 'POST /developer/modules/upload/icon'(params) {
    const { uploadAsset } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const form = await req.formData().catch(() => null);
    const file = form?.get('file') as File | null;
    if (!file)
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    const { url } = await uploadAsset(
      user.id,
      'icon',
      file.name,
      Buffer.from(await file.arrayBuffer())
    );
    return NextResponse.json({ url });
  },
  async 'POST /developer/modules/upload/banner'(params) {
    const { uploadAsset } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const form = await req.formData().catch(() => null);
    const file = form?.get('file') as File | null;
    if (!file)
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    const { url } = await uploadAsset(
      user.id,
      'banner',
      file.name,
      Buffer.from(await file.arrayBuffer())
    );
    return NextResponse.json({ url });
  },
  async 'GET /developer/notifications'(params) {
    const { getDeveloperNotifications } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await getDeveloperNotifications(user.id));
  },
  async 'PUT /developer/notifications/:id/read'(params) {
    const { markNotificationRead } =
      await import('@/lib/marketplace/services/developer');
    return NextResponse.json(await markNotificationRead(params.id));
  },
  async 'GET /developer/support/tickets'(params) {
    const { getDeveloperSupportTickets } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await getDeveloperSupportTickets(user.id));
  },

  // ─── Developer API Keys ─────────────────────────────────────────
  async 'GET /developer/api-keys'(params) {
    const { listApiKeys } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const dev = await getDeveloperByUserId(user.id);
    if (!dev) return NextResponse.json([]);
    return NextResponse.json(await listApiKeys(dev.id));
  },
  async 'POST /developer/api-keys'(params, body) {
    const { createApiKey } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const dev = await getDeveloperByUserId(user.id);
    if (!dev)
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    const key = await createApiKey(dev.id, {
      name: body?.name || 'Key',
      permissions: body?.permissions,
      rateLimit: body?.rateLimit,
      expiresAt: body?.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    return NextResponse.json({
      id: key.id,
      name: key.name,
      key: key.key,
      rawKey: (key as any).rawKey,
      permissions: key.permissions,
      createdAt: key.createdAt,
    });
  },
  async 'DELETE /developer/api-keys/:id'(params) {
    const { revokeApiKey } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const dev = await getDeveloperByUserId(user.id);
    if (!dev)
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    return NextResponse.json(await revokeApiKey(dev.id, params.id));
  },
  async 'PUT /developer/api-keys/:id'(params, body) {
    const { updateApiKey } =
      await import('@/lib/marketplace/services/developer');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const dev = await getDeveloperByUserId(user.id);
    if (!dev)
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    return NextResponse.json(await updateApiKey(dev.id, params.id, body));
  },

  // ─── Submission ─────────────────────────────────────────────────
  async 'GET /developer/modules/:moduleId/submission-status'(params) {
    const { getSubmissionStatus } =
      await import('@/lib/marketplace/services/submission');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await getSubmissionStatus(user.id, params.moduleId)
    );
  },
  async 'POST /developer/modules/:moduleId/submit'(params) {
    const { submitForReview } =
      await import('@/lib/marketplace/services/submission');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await submitForReview(user.id, params.moduleId));
  },
  async 'POST /developer/modules/:moduleId/request-changes'(params) {
    const { requestChanges } =
      await import('@/lib/marketplace/services/submission');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await requestChanges(user.id, params.moduleId));
  },
  async 'POST /developer/modules/:moduleId/deprecate'(params, body) {
    const { deprecateModule } =
      await import('@/lib/marketplace/services/submission');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await deprecateModule(user.id, params.moduleId, body?.reason)
    );
  },
  async 'POST /developer/modules/:moduleId/version'(params) {
    const { publishVersion } =
      await import('@/lib/marketplace/services/submission');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const form = await req.formData().catch(() => null);
    const file = form?.get('file') as File | null;
    const data = form
      ? {
          version: (form.get('version') as string) || '1.0.0',
          changelog: (form.get('changelog') as string) || '',
          downloadUrl: '',
          fileSize: file?.size || 0,
          sukVersion: (form.get('sukVersion') as string) || '1.0.0',
          isBeta: form.get('isBeta') === 'true',
        }
      : body
        ? {
            version: body.version || '1.0.0',
            changelog: body.changelog || '',
            downloadUrl: body.downloadUrl || '',
            fileSize: body.fileSize || 0,
            sukVersion: body.sukVersion || '1.0.0',
            isBeta: body.isBeta || false,
          }
        : { version: '1.0.0', downloadUrl: '', sukVersion: '1.0.0' };
    if (file) {
      const { uploadAsset } =
        await import('@/lib/marketplace/services/developer');
      const { url } = await uploadAsset(
        user.id,
        'module',
        file.name,
        Buffer.from(await file.arrayBuffer())
      );
      data.downloadUrl = url;
      data.fileSize = file.size;
    }
    return NextResponse.json(
      await publishVersion(user.id, params.moduleId, data)
    );
  },

  // ─── Validation & Security Scans ────────────────────────────────
  async 'GET /developer/modules/:moduleId/validate/manifest'(params) {
    const mod = await getModuleForAuthedUser(params);
    if (!mod)
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    const { validateManifest } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(
      validateManifest({
        name: mod.name,
        version: mod.version,
        author: mod.authorName,
        sukitVersion: mod.minSukitVersion,
        description: mod.description,
        permissions: mod.permissions,
        dependencies: mod.dependencies,
      })
    );
  },
  async 'GET /developer/modules/:moduleId/validate/permissions'(params) {
    const mod = await getModuleForAuthedUser(params);
    if (!mod)
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    const { validatePermissions } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(validatePermissions(mod.permissions));
  },
  async 'GET /developer/modules/:moduleId/validate/dependencies'(params) {
    const mod = await getModuleForAuthedUser(params);
    if (!mod)
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    const { validateDependencies } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(validateDependencies(mod.dependencies));
  },
  async 'GET /developer/modules/:moduleId/validate/security/malicious'(params) {
    const { scanMalware } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(scanMalware(''));
  },
  async 'GET /developer/modules/:moduleId/validate/security/rce'(params) {
    const { scanRCE } = await import('@/lib/marketplace/services/submission');
    return NextResponse.json(scanRCE(''));
  },
  async 'GET /developer/modules/:moduleId/validate/security/network'(params) {
    const { scanNetwork } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(scanNetwork(''));
  },
  async 'GET /developer/modules/:moduleId/validate/filesize'(params) {
    const { validateFileSize } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(validateFileSize(0));
  },
  async 'GET /developer/modules/:moduleId/validate/compatibility'(params) {
    const mod = await getModuleForAuthedUser(params);
    if (!mod)
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    const { validateCompatibility } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(
      validateCompatibility({ sukitVersion: mod.minSukitVersion })
    );
  },
  async 'GET /developer/modules/:moduleId/scan/secrets'(params) {
    const { scanSecrets } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(scanSecrets('').findings);
  },
  async 'GET /developer/modules/:moduleId/scan/obfuscation'(params) {
    const { scanObfuscation } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(scanObfuscation('').findings);
  },
  async 'GET /developer/modules/:moduleId/scan/malware'(params) {
    const { scanMalware } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(scanMalware('').findings);
  },
  async 'GET /developer/modules/:moduleId/scan/dependencies'(params) {
    const { scanDependencies } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(scanDependencies({}).findings);
  },

  // ─── Admin Marketplace ──────────────────────────────────────────
  async 'GET /admin/marketplace/submissions'(params) {
    const { searchParams } = new URL(params.url);
    const { listPendingSubmissions } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(
      await listPendingSubmissions({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
      })
    );
  },
  async 'POST /admin/marketplace/submissions/:id/approve'(params) {
    const { approveSubmission } =
      await import('@/lib/marketplace/services/submission');
    const { requireAdminUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireAdminUser(req);
    return NextResponse.json(await approveSubmission(params.id, user.id));
  },
  async 'POST /admin/marketplace/submissions/:id/reject'(params, body) {
    const { rejectSubmission } =
      await import('@/lib/marketplace/services/submission');
    const { requireAdminUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireAdminUser(req);
    return NextResponse.json(
      await rejectSubmission(
        params.id,
        user.id,
        body?.reason || 'No reason provided'
      )
    );
  },
  async 'PUT /admin/marketplace/modules/:moduleId/feature'(params, body) {
    const { setFeatured } = await import('@/lib/marketplace/services/registry');
    const { requireAdminUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireAdminUser(req);
    return NextResponse.json(
      await setFeatured(
        params.moduleId,
        body?.featured ?? true,
        body?.until ? new Date(body.until) : undefined
      )
    );
  },
  async 'DELETE /admin/marketplace/modules/:moduleId'(params) {
    const { deleteModule } =
      await import('@/lib/marketplace/services/registry');
    const { requireAdminUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireAdminUser(req);
    return NextResponse.json(await deleteModule(params.moduleId));
  },
  async 'GET /admin/marketplace/reports'(params) {
    const { getReports } =
      await import('@/lib/marketplace/services/submission');
    return NextResponse.json(await getReports());
  },
  async 'GET /admin/marketplace/stats'(params) {
    const { adminStats } = await import('@/lib/marketplace/services/registry');
    return NextResponse.json(await adminStats());
  },
  async 'GET /admin/marketplace/transactions'(params) {
    const { listTransactions } =
      await import('@/lib/marketplace/services/payments');
    const { searchParams } = new URL(params.url);
    return NextResponse.json(
      await listTransactions({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        buyerId: searchParams.get('buyerId') || undefined,
        moduleId: searchParams.get('moduleId') || undefined,
        status: searchParams.get('status') || undefined,
      })
    );
  },
  async 'POST /admin/marketplace/transactions/:id/refund'(params, body) {
    const { issueAdminRefund } =
      await import('@/lib/marketplace/services/payments');
    const { requireAdminUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    await requireAdminUser(req);
    return NextResponse.json(
      await issueAdminRefund(params.id, body?.amount, body?.reason)
    );
  },

  // ─── Admin Reviews ──────────────────────────────────────────────
  async 'GET /admin/marketplace/reviews/moderation'(params) {
    const { searchParams } = new URL(params.url);
    const { moderationQueue } =
      await import('@/lib/marketplace/services/reviews');
    return NextResponse.json(
      await moderationQueue({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        status: searchParams.get('status') || undefined,
      })
    );
  },
  async 'POST /admin/marketplace/reviews/:reviewId/moderate'(params, body) {
    const { moderateReview } =
      await import('@/lib/marketplace/services/reviews');
    const { requireAdminUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireAdminUser(req);
    return NextResponse.json(
      await moderateReview(
        params.reviewId,
        body?.action || 'approve',
        body?.note,
        user.id
      )
    );
  },
  async 'GET /admin/marketplace/reviews/:reviewId/spam-check'(params) {
    const { spamCheck } = await import('@/lib/marketplace/services/reviews');
    const rev = await prisma.moduleReview.findUnique({
      where: { id: params.reviewId },
    });
    if (!rev)
      return NextResponse.json({ isSpam: false, confidence: 0, reasons: [] });
    return NextResponse.json(await spamCheck(rev.review));
  },

  // ─── Support Tickets ────────────────────────────────────────────
  async 'GET /support/tickets'(params) {
    const { searchParams } = new URL(params.url);
    const { listTickets } = await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await listTickets({
        userId: user.id,
        status: searchParams.get('status') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
      })
    );
  },
  async 'POST /support/tickets'(params, body) {
    const { createTicket } = await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    if (!body?.moduleId || !body?.subject || !body?.message) {
      return NextResponse.json(
        { error: 'moduleId, subject, and message required' },
        { status: 400 }
      );
    }
    const ticket = await createTicket({
      moduleId: body.moduleId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      subject: body.subject,
      message: body.message,
      priority: body.priority,
      category: body.category,
      attachments: body.attachments,
    });
    return NextResponse.json(ticket, { status: 201 });
  },
  async 'GET /support/tickets/:ticketId'(params) {
    const { getTicket } = await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const ticket = await getTicket(params.ticketId, user.id);
    if (!ticket)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json(ticket);
  },
  async 'POST /support/tickets/:ticketId/response'(params, body) {
    const { respondToTicket } =
      await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await respondToTicket({
        ticketId: params.ticketId,
        authorId: user.id,
        authorName: user.name,
        authorType: body?.authorType || 'customer',
        message: body?.message || '',
        attachments: body?.attachments,
        privateNote: body?.privateNote,
      })
    );
  },
  async 'PUT /support/tickets/:ticketId/resolve'(params) {
    const { resolveTicket } =
      await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await resolveTicket(params.ticketId, user.id));
  },
  async 'POST /support/tickets/:ticketId/reopen'(params, body) {
    const { reopenTicket } = await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await reopenTicket(params.ticketId, user.id, body?.reason || '')
    );
  },
  async 'PUT /support/tickets/:ticketId/close'(params) {
    const { closeTicket } = await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await closeTicket(params.ticketId, user.id));
  },
  async 'GET /support/tickets/:ticketId/private-notes'(params) {
    const { getPrivateNotes } =
      await import('@/lib/marketplace/services/support');
    return NextResponse.json(await getPrivateNotes(params.ticketId));
  },
  async 'POST /support/tickets/:ticketId/private-notes'(params, body) {
    const { addPrivateNote } =
      await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await addPrivateNote(params.ticketId, user.id, body?.message || '')
    );
  },
  async 'POST /support/tickets/:ticketId/escalate'(params, body) {
    const { escalateTicket } =
      await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await escalateTicket(params.ticketId, user.id, body?.reason || '')
    );
  },
  async 'POST /support/tickets/:ticketId/request-info'(params, body) {
    const { requestInfo } = await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await requestInfo(params.ticketId, user.id, body?.question || '')
    );
  },
  async 'POST /support/tickets/:ticketId/satisfaction'(params, body) {
    const { recordSatisfaction } =
      await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await recordSatisfaction(params.ticketId, user.id, body?.rating || 5)
    );
  },
  async 'GET /support/tickets/history'(params) {
    const { getTicketHistory } =
      await import('@/lib/marketplace/services/support');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await getTicketHistory(user.id));
  },
  async 'GET /support/templates'(params) {
    const { listTemplates } =
      await import('@/lib/marketplace/services/support');
    return NextResponse.json(await listTemplates());
  },

  // ─── Knowledge Base ─────────────────────────────────────────────
  async 'GET /support/kb'(params) {
    const { searchParams } = new URL(params.url);
    const { listKb } = await import('@/lib/marketplace/services/support');
    return NextResponse.json(
      await listKb({
        category: searchParams.get('category') || undefined,
        published: searchParams.get('published') !== 'false',
      })
    );
  },
  async 'GET /support/kb/search'(params) {
    const { searchParams } = new URL(params.url);
    const { searchKb } = await import('@/lib/marketplace/services/support');
    return NextResponse.json(await searchKb(searchParams.get('query') || ''));
  },
  async 'GET /support/kb/:slug'(params) {
    const { getKbArticle } = await import('@/lib/marketplace/services/support');
    const article = await getKbArticle(params.slug);
    if (!article)
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    return NextResponse.json(article);
  },
  async 'GET /support/kb/:id/related'(params) {
    const { getRelatedArticles } =
      await import('@/lib/marketplace/services/support');
    return NextResponse.json(await getRelatedArticles(params.id));
  },
  async 'POST /support/kb/:id/vote'(params, body) {
    const { voteKb } = await import('@/lib/marketplace/services/support');
    return NextResponse.json(await voteKb(params.id, body?.helpful ?? true));
  },
  async 'POST /admin/support/kb'(params, body) {
    const { createKbArticle } =
      await import('@/lib/marketplace/services/support');
    const { requireAdminUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireAdminUser(req);
    const article = await createKbArticle({
      title: body?.title || '',
      content: body?.content || '',
      excerpt: body?.excerpt,
      category: body?.category || 'general',
      tags: body?.tags,
      published: body?.published,
      authorId: user.id,
      authorName: user.name,
    });
    return NextResponse.json(article, { status: 201 });
  },
  async 'PUT /admin/support/kb/:id'(params, body) {
    const { updateKbArticle } =
      await import('@/lib/marketplace/services/support');
    return NextResponse.json(await updateKbArticle(params.id, body));
  },
  async 'DELETE /admin/support/kb/:id'(params) {
    const { deleteKbArticle } =
      await import('@/lib/marketplace/services/support');
    return NextResponse.json(await deleteKbArticle(params.id));
  },
  async 'GET /admin/support/kb/stats'(params) {
    const { getKbStats } = await import('@/lib/marketplace/services/support');
    return NextResponse.json(await getKbStats());
  },
  async 'GET /admin/support/tickets'(params) {
    const { searchParams } = new URL(params.url);
    const { getAdminTicketQueue } =
      await import('@/lib/marketplace/services/support');
    return NextResponse.json(
      await getAdminTicketQueue({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        status: searchParams.get('status') || undefined,
        priority: searchParams.get('priority') || undefined,
      })
    );
  },
  async 'PUT /admin/support/tickets/:ticketId/assign'(params, body) {
    const { assignTicket } = await import('@/lib/marketplace/services/support');
    return NextResponse.json(
      await assignTicket(params.ticketId, body?.assignedTo || '')
    );
  },
  async 'GET /admin/support/stats'(params) {
    const { getAdminSupportStats } =
      await import('@/lib/marketplace/services/support');
    return NextResponse.json(await getAdminSupportStats());
  },

  // ─── Analytics (Developer) ──────────────────────────────────────
  async 'GET /developer/analytics/business'(params) {
    const { getBusinessAnalytics } =
      await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await getBusinessAnalytics(user.id));
  },
  async 'GET /developer/analytics/revenue'(params) {
    const { getBusinessAnalytics } =
      await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const data = await getBusinessAnalytics(user.id);
    return NextResponse.json({
      totalRevenue: data.totalRevenue,
      mrr: data.mrr,
      arr: data.arr,
      revenueByMonth: data.mrrHistory,
      averageOrderValue: data.averageOrderValue,
      customerLifetimeValue: data.customerLifetimeValue,
    });
  },
  async 'GET /developer/analytics/customers'(params) {
    const { getBusinessAnalytics } =
      await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const data = await getBusinessAnalytics(user.id);
    return NextResponse.json({
      totalCustomers: data.topCustomers.length,
      newCustomers: 0,
      returningCustomers: 0,
      churnRate: data.churnRate,
      topCustomers: data.topCustomers,
      customerAcquisition: [],
    });
  },
  async 'GET /developer/analytics/export'(params) {
    const { searchParams } = new URL(params.url);
    const { exportAnalytics } =
      await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    const content = await exportAnalytics(
      user.id,
      searchParams.get('format') || 'csv'
    );
    const type =
      searchParams.get('format') === 'json' ? 'application/json' : 'text/csv';
    return new NextResponse(content, { headers: { 'Content-Type': type } });
  },
  async 'POST /developer/analytics/report-url'(params, body) {
    const { reportUrl } = await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await reportUrl(user.id, body));
  },
  async 'GET /developer/dashboard/sales-chart'(params) {
    const { searchParams } = new URL(params.url);
    const { getSalesChart } =
      await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await getSalesChart(user.id, parseInt(searchParams.get('days') || '30'))
    );
  },
  async 'GET /developer/dashboard/installs-chart'(params) {
    const { searchParams } = new URL(params.url);
    const { getInstallsChart } =
      await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await getInstallsChart(
        user.id,
        parseInt(searchParams.get('days') || '30')
      )
    );
  },
  async 'GET /developer/dashboard/revenue-chart'(params) {
    const { searchParams } = new URL(params.url);
    const { getRevenueChart } =
      await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(
      await getRevenueChart(user.id, parseInt(searchParams.get('days') || '30'))
    );
  },
  async 'GET /developer/dashboard/compare'(params) {
    const { comparePeriods } =
      await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await comparePeriods(user.id));
  },
  async 'GET /developer/analytics/top-modules'(params) {
    const { getTopModules } =
      await import('@/lib/marketplace/services/analytics');
    const { requireUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireUser(req);
    return NextResponse.json(await getTopModules(user.id));
  },

  // ─── Module Analytics ──────────────────────────────────────────
  async 'GET /modules/:moduleId/analytics/usage'(params) {
    const { getUsageAnalytics } =
      await import('@/lib/marketplace/services/analytics');
    return NextResponse.json(await getUsageAnalytics(params.moduleId));
  },
  async 'GET /modules/:moduleId/analytics/active-installs'(params) {
    const { getActiveInstalls } =
      await import('@/lib/marketplace/services/analytics');
    return NextResponse.json(await getActiveInstalls(params.moduleId));
  },
  async 'GET /modules/:moduleId/analytics/retention'(params) {
    const { getRetention } =
      await import('@/lib/marketplace/services/analytics');
    return NextResponse.json(await getRetention(params.moduleId));
  },
  async 'GET /modules/:moduleId/analytics/update-adoption'(params) {
    const { getUpdateAdoption } =
      await import('@/lib/marketplace/services/analytics');
    return NextResponse.json(await getUpdateAdoption(params.moduleId));
  },
  async 'GET /modules/:moduleId/analytics/performance'(params) {
    const { getPerformance } =
      await import('@/lib/marketplace/services/analytics');
    return NextResponse.json(await getPerformance(params.moduleId));
  },
  async 'GET /modules/:moduleId/analytics/errors'(params) {
    const { getErrors } = await import('@/lib/marketplace/services/analytics');
    return NextResponse.json(await getErrors(params.moduleId));
  },
  async 'GET /modules/:moduleId/analytics/resources'(params) {
    const { getResources } =
      await import('@/lib/marketplace/services/analytics');
    return NextResponse.json(await getResources(params.moduleId));
  },
  async 'GET /modules/:moduleId/analytics/conversion'(params) {
    const { getConversion } =
      await import('@/lib/marketplace/services/analytics');
    return NextResponse.json(await getConversion(params.moduleId));
  },
  async 'GET /modules/:moduleId/analytics/geo'(params) {
    const { getGeoDistribution } =
      await import('@/lib/marketplace/services/analytics');
    return NextResponse.json(await getGeoDistribution(params.moduleId));
  },

  // ─── Admin: Approve Developer ───────────────────────────────────
  async 'POST /admin/marketplace/developers/:id/approve'(params) {
    const { approveDeveloper } =
      await import('@/lib/marketplace/services/developer');
    const { requireAdminUser } = await import('@/lib/marketplace/utils/auth');
    const req = new Request(params.url);
    const user = await requireAdminUser(req);
    return NextResponse.json(await approveDeveloper(params.id, user.id));
  },

  // ─── Audit ──────────────────────────────────────────────────────
  async 'GET /admin/marketplace/audit'(params) {
    const { searchParams } = new URL(params.url);
    const { listAudit } = await import('@/lib/marketplace/utils/audit');
    return NextResponse.json(
      await listAudit({
        userId: searchParams.get('userId') || undefined,
        resourceType: searchParams.get('resourceType') || undefined,
        resourceId: searchParams.get('resourceId') || undefined,
        action: searchParams.get('action') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '50'),
      })
    );
  },
};

export async function GET(
  request: Request,
  { params }: { params: { path?: string[] } }
) {
  return handleRequest('GET', request);
}
export async function POST(
  request: Request,
  { params }: { params: { path?: string[] } }
) {
  return handleRequest('POST', request);
}
export async function PUT(
  request: Request,
  { params }: { params: { path?: string[] } }
) {
  return handleRequest('PUT', request);
}
export async function DELETE(
  request: Request,
  { params }: { params: { path?: string[] } }
) {
  return handleRequest('DELETE', request);
}

async function handleRequest(
  method: string,
  request: Request
): Promise<NextResponse> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/marketplace/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 404 });
  }
  let path = url.pathname.replace('/api/marketplace/', '').replace(/\/+$/, '');
  const body =
    method === 'POST' || method === 'PUT'
      ? await request.json().catch(() => undefined)
      : undefined;

  const key = `${method} /${path}`;
  if (handlers[key])
    return handlers[key](
      {
        url: request.url,
        id: undefined,
        moduleId: undefined,
        reviewId: undefined,
        licenseKey: undefined,
        transactionId: undefined,
        ...extractParams(path),
      },
      body
    );

  const segments = path.split('/');
  for (const [patternKey, handler] of Object.entries(handlers)) {
    const [pMethod, pPath] = patternKey.split(' ');
    if (pMethod !== method) continue;
    const params = matchRoute(pPath, `/${path}`);
    if (params) return handler({ url: request.url, ...params }, body);
  }

  return NextResponse.json(
    { error: 'Not found', path: `/api/marketplace/${path}`, method },
    { status: 404 }
  );
}

function matchRoute(
  pattern: string,
  path: string
): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':'))
      params[patternParts[i].slice(1)] = pathParts[i];
    else if (patternParts[i] !== pathParts[i]) return null;
  }
  return params;
}

function extractParams(path: string): Record<string, string> {
  const segments = path.split('/');
  const params: Record<string, string> = {};
  for (let i = 0; i < segments.length; i++) {
    if (
      (i > 0 && !isNaN(Number(segments[i]))) ||
      segments[i]?.startsWith('suk_')
    ) {
      const key =
        segments[i - 1] === 'modules'
          ? 'moduleId'
          : segments[i - 2] === 'licenses'
            ? 'licenseKey'
            : segments[i - 2] === 'billing'
              ? 'transactionId'
              : segments[i - 1] === 'reviews'
                ? 'reviewId'
                : segments[i - 1] || 'id';
      params[key] = segments[i];
    }
  }
  return params;
}

// Helper: called by validation/scan endpoints to get the user's module
async function getModuleForAuthedUser(params: any) {
  const { prisma } = await import('@/lib/db/prisma');
  const { requireUser } = await import('@/lib/marketplace/utils/auth');
  const req = new Request(params.url);
  const user = await requireUser(req);
  return prisma.marketplaceModule.findFirst({
    where: {
      OR: [{ id: params.moduleId }, { moduleId: params.moduleId }],
      authorId: user.id,
    },
  });
}

// Helper: get developer by userId
async function getDeveloperByUserId(userId: string) {
  const { prisma } = await import('@/lib/db/prisma');
  return prisma.developer.findUnique({ where: { userId } });
}
