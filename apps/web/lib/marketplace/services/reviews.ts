import { prisma } from '@/lib/db/prisma';
import { emit } from '@/lib/marketplace/utils/events';
import { audit } from '@/lib/marketplace/utils/audit';
import { reviewNotificationEmail } from '@/lib/marketplace/utils/email';

const SPAM_KEYWORDS = [
  'viagra',
  'casino',
  'lottery',
  'click here',
  'buy now',
  'free money',
  'make money fast',
  'work from home',
  'crypto airdrop',
  'limited offer',
];

function detectSpam(text: string): {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
} {
  const lower = text.toLowerCase();
  const reasons: string[] = [];
  let score = 0;
  for (const kw of SPAM_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 0.4;
      reasons.push(`Contains spam keyword: "${kw}"`);
    }
  }
  // Detect URL over-repetition
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount >= 3) {
    score += 0.5;
    reasons.push('Excessive URLs');
  }
  // Detect all-caps
  const upper = text.replace(/[^A-Z]/g, '').length;
  const letters = text.replace(/[^A-Za-z]/g, '').length;
  if (letters > 20 && upper / letters > 0.7) {
    score += 0.3;
    reasons.push('Excessive capital letters');
  }
  // Very short reviews
  if (text.replace(/\s/g, '').length < 5) {
    score += 0.3;
    reasons.push('Very short review');
  }
  // Repeated characters
  if (/(.)\1{5,}/.test(text)) {
    score += 0.4;
    reasons.push('Repeated character pattern');
  }
  return {
    isSpam: score >= 0.5,
    confidence: Math.min(1, score),
    reasons,
  };
}

async function getModule(idOrSlug: string) {
  return prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: idOrSlug }, { moduleId: idOrSlug }] },
  });
}

export async function listReviews(
  moduleIdOrSlug: string,
  filters: {
    sort?: 'recent' | 'helpful' | 'highest' | 'lowest' | 'verified';
    rating?: number;
    page?: number;
    pageSize?: number;
    verifiedOnly?: boolean;
  } = {}
) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod)
    return {
      reviews: [],
      total: 0,
      page: 1,
      totalPages: 0,
      averageRating: 0,
      ratingDistribution: {},
    };
  const page = filters.page ?? 1;
  const pageSize = Math.min(50, filters.pageSize ?? 20);
  const where: any = { moduleId: mod.id, status: 'approved' };
  if (filters.rating) where.rating = filters.rating;
  if (filters.verifiedOnly) where.verified = true;
  let orderBy: any = { createdAt: 'desc' };
  if (filters.sort === 'helpful')
    orderBy = [{ helpful: 'desc' }, { createdAt: 'desc' }];
  else if (filters.sort === 'highest') orderBy = { rating: 'desc' };
  else if (filters.sort === 'lowest') orderBy = { rating: 'asc' };
  else if (filters.sort === 'verified')
    orderBy = [{ verified: 'desc' }, { createdAt: 'desc' }];
  const [reviews, total, allRatings] = await Promise.all([
    prisma.moduleReview.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { responses: true },
    }),
    prisma.moduleReview.count({ where }),
    prisma.moduleReview.findMany({
      where: { moduleId: mod.id, status: 'approved' },
      select: { rating: true },
    }),
  ]);
  const dist: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of allRatings) {
    dist[String(r.rating)] = (dist[String(r.rating)] || 0) + 1;
    sum += r.rating;
  }
  const avg = allRatings.length ? sum / allRatings.length : 0;
  return {
    reviews,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    averageRating: avg,
    ratingDistribution: dist,
  };
}

export async function submitReview(
  moduleIdOrSlug: string,
  user: { id: string; name: string },
  data: {
    rating: number;
    title?: string;
    review: string;
    pros?: string;
    cons?: string;
    versionUsed?: string;
  }
) {
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be 1-5');
  }
  if (!data.review || data.review.trim().length < 10) {
    throw new Error('Review must be at least 10 characters');
  }
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  // Check for existing review
  const existing = await prisma.moduleReview.findFirst({
    where: { moduleId: mod.id, userId: user.id },
  });
  if (existing) throw new Error('You have already reviewed this module');
  // Verify purchase (has install or transaction)
  const [install, txn] = await Promise.all([
    prisma.moduleInstall.findFirst({
      where: { moduleId: mod.id, userId: user.id, status: 'installed' },
    }),
    prisma.transaction.findFirst({
      where: { moduleId: mod.id, buyerId: user.id, status: 'completed' },
    }),
  ]);
  const verified = Boolean(install || txn);
  // Auto spam check
  const spam = detectSpam(data.review);
  const review = await prisma.moduleReview.create({
    data: {
      moduleId: mod.id,
      userId: user.id,
      userName: user.name,
      rating: data.rating,
      title: data.title,
      review: data.review,
      pros: data.pros,
      cons: data.cons,
      versionUsed: data.versionUsed,
      verified,
      status: spam.isSpam ? 'pending' : 'approved',
      moderatorNote: spam.isSpam
        ? `Auto-flagged: ${spam.reasons.join('; ')}`
        : null,
    },
  });
  if (!spam.isSpam) {
    await updateModuleRating(mod.id);
  }
  await emit('review.submitted', {
    moduleId: mod.moduleId,
    reviewId: review.id,
    rating: data.rating,
  });
  return review;
}

export async function updateReview(
  reviewId: string,
  userId: string,
  data: {
    rating?: number;
    title?: string;
    review?: string;
    pros?: string;
    cons?: string;
  }
) {
  const r = await prisma.moduleReview.findUnique({ where: { id: reviewId } });
  if (!r) throw new Error('Review not found');
  if (r.userId !== userId) throw new Error('Not your review');
  // 30-day edit window for verified reviews
  const editable = await isReviewEditable(reviewId, userId);
  if (!editable.editable) throw new Error('Review is no longer editable');
  const updated = await prisma.moduleReview.update({
    where: { id: reviewId },
    data: {
      rating: data.rating ?? r.rating,
      title: data.title ?? r.title,
      review: data.review ?? r.review,
      pros: data.pros ?? r.pros,
      cons: data.cons ?? r.cons,
    },
  });
  await updateModuleRating(r.moduleId);
  return updated;
}

export async function deleteReview(reviewId: string, userId: string) {
  const r = await prisma.moduleReview.findUnique({ where: { id: reviewId } });
  if (!r) throw new Error('Review not found');
  if (r.userId !== userId) {
    // admin override
  }
  await prisma.moduleReview.delete({ where: { id: reviewId } });
  await updateModuleRating(r.moduleId);
  return { success: true };
}

export async function isReviewEditable(reviewId: string, userId: string) {
  const r = await prisma.moduleReview.findUnique({ where: { id: reviewId } });
  if (!r || r.userId !== userId)
    return { editable: false, remainingEdits: 0, expiresAt: null };
  const ageMs = Date.now() - r.createdAt.getTime();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const remaining = Math.max(0, thirtyDays - ageMs);
  return {
    editable: remaining > 0,
    remainingEdits: remaining > 0 ? 3 : 0,
    expiresAt: new Date(r.createdAt.getTime() + thirtyDays).toISOString(),
  };
}

export async function voteHelpful(reviewId: string, helpful: boolean) {
  return prisma.moduleReview.update({
    where: { id: reviewId },
    data: helpful
      ? { helpful: { increment: 1 } }
      : { notHelpful: { increment: 1 } },
  });
}

export async function respondToReview(
  reviewId: string,
  authorId: string,
  authorName: string,
  authorType: 'developer' | 'admin',
  response: string
) {
  const r = await prisma.moduleReview.findUnique({ where: { id: reviewId } });
  if (!r) throw new Error('Review not found');
  const created = await prisma.reviewResponse.create({
    data: { reviewId, authorId, authorType, response },
  });
  await emit('review.responded', { moduleId: r.moduleId, reviewId });
  return created;
}

export async function deleteResponse(reviewId: string, responseId: string) {
  return prisma.reviewResponse.delete({
    where: { id: responseId },
  });
}

export async function appealReview(
  reviewId: string,
  userId: string,
  reason: string
) {
  const r = await prisma.moduleReview.findUnique({ where: { id: reviewId } });
  if (!r) throw new Error('Review not found');
  if (r.userId !== userId) throw new Error('Not your review');
  return prisma.moduleReview.update({
    where: { id: reviewId },
    data: { status: 'pending', moderatorNote: `Appeal: ${reason}` },
  });
}

export async function reportReview(
  reviewId: string,
  _userId: string,
  reason: string
) {
  const r = await prisma.moduleReview.findUnique({ where: { id: reviewId } });
  if (!r) throw new Error('Review not found');
  return prisma.moduleReview.update({
    where: { id: reviewId },
    data: { status: 'flagged', moderatorNote: `Reported: ${reason}` },
  });
}

async function updateModuleRating(moduleInternalId: string) {
  const agg = await prisma.moduleReview.aggregate({
    where: { moduleId: moduleInternalId, status: 'approved' },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.marketplaceModule.update({
    where: { id: moduleInternalId },
    data: {
      rating: agg._avg.rating || 0,
      ratingCount: agg._count,
    },
  });
}

export async function getReviewAnalytics(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const [reviews, responses, approved] = await Promise.all([
    prisma.moduleReview.findMany({
      where: { moduleId: mod.id, status: 'approved' },
      select: { rating: true, verified: true, createdAt: true, review: true },
    }),
    prisma.reviewResponse.count({
      where: { review: { moduleId: mod.id } },
    }),
    prisma.moduleReview.findMany({
      where: { moduleId: mod.id, status: 'approved' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, rating: true },
    }),
  ]);
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {},
      verifiedPercentage: 0,
      responseRate: 0,
      averageResponseTime: 0,
      topKeywords: [],
      sentimentScore: 0,
      reviewsOverTime: [],
    };
  }
  const dist: Record<string, number> = {};
  let sum = 0;
  let verified = 0;
  for (const r of reviews) {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
    sum += r.rating;
    if (r.verified) verified++;
  }
  const avg = sum / reviews.length;
  const sentiment = avg / 5; // simple proxy
  // Basic keyword extraction
  const wordCount = new Map<string, number>();
  for (const r of reviews) {
    const words = r.review
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);
    for (const w of words) wordCount.set(w, (wordCount.get(w) || 0) + 1);
  }
  const topKeywords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
  // Group by day
  const byDay = new Map<string, number>();
  for (const r of reviews) {
    const d = r.createdAt.toISOString().split('T')[0];
    byDay.set(d, (byDay.get(d) || 0) + 1);
  }
  const reviewsOverTime = Array.from(byDay.entries())
    .sort()
    .slice(-30)
    .map(([date, count]) => ({ date, count }));
  return {
    totalReviews: reviews.length,
    averageRating: avg,
    ratingDistribution: dist,
    verifiedPercentage: (verified / reviews.length) * 100,
    responseRate: (responses / reviews.length) * 100,
    averageResponseTime: 0, // computed when response timestamps exist
    topKeywords,
    sentimentScore: sentiment,
    reviewsOverTime,
  };
}

export async function getReviewSummary(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const reviews = await prisma.moduleReview.findMany({
    where: { moduleId: mod.id, status: 'approved' },
    select: { rating: true, review: true, pros: true, cons: true },
  });
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {},
      sentimentLabels: [],
      recommendedPercentage: 0,
    };
  }
  const dist: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let recommend = 0;
  for (const r of reviews) {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
    sum += r.rating;
    if (r.rating >= 4) recommend++;
  }
  const avg = sum / reviews.length;
  const sentimentLabels: { label: string; count: number }[] = [
    { label: '5 stars', count: dist[5] || 0 },
    { label: '4 stars', count: dist[4] || 0 },
    { label: '3 stars', count: dist[3] || 0 },
    { label: '2 stars', count: dist[2] || 0 },
    { label: '1 star', count: dist[1] || 0 },
  ];
  return {
    averageRating: avg,
    totalReviews: reviews.length,
    ratingDistribution: dist,
    sentimentLabels,
    recommendedPercentage: (recommend / reviews.length) * 100,
  };
}

export async function moderationQueue(filters: any = {}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(100, filters.pageSize ?? 20);
  const where: any = {};
  if (filters.status) where.status = filters.status;
  else where.status = { in: ['pending', 'flagged'] };
  if (filters.moduleId) where.moduleId = filters.moduleId;
  const [items, pending, flagged, total] = await Promise.all([
    prisma.moduleReview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { module: { select: { moduleId: true, name: true } } },
    }),
    prisma.moduleReview.count({ where: { status: 'pending' } }),
    prisma.moduleReview.count({ where: { status: 'flagged' } }),
    prisma.moduleReview.count({ where }),
  ]);
  return {
    reviews: items,
    queue: { pending, flagged, total: pending + flagged },
    page,
    pageSize,
    total,
  };
}

export async function moderateReview(
  reviewId: string,
  action: 'approve' | 'reject' | 'flag',
  note?: string,
  reviewerId?: string
) {
  const status =
    action === 'approve'
      ? 'approved'
      : action === 'reject'
        ? 'rejected'
        : 'flagged';
  const r = await prisma.moduleReview.update({
    where: { id: reviewId },
    data: { status, moderatorNote: note },
  });
  if (action === 'approve') await updateModuleRating(r.moduleId);
  await audit(`review.${action}` as any, {
    userId: reviewerId,
    resourceType: 'review',
    resourceId: reviewId,
    changes: { note },
  });
  await emit(action === 'approve' ? 'review.approved' : 'review.rejected', {
    reviewId,
  });
  return r;
}

export async function spamCheck(text: string) {
  return detectSpam(text);
}
