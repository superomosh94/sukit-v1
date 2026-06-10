import type { SukitKernel } from '@sukit/core';
import type {
  ModuleReviewData,
  ReviewModerationStatus,
  ReviewModerationQueue,
  ModerationAction,
  ReviewAnalytics,
  ReviewSortMode,
  ReviewResponseData,
} from './types';

export class ReviewModeration {
  private kernel: SukitKernel;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ─── Review CRUD ───────────────────────────────────────────────

  async getModuleReviews(
    moduleId: string,
    options?: {
      sort?: ReviewSortMode;
      status?: ReviewModerationStatus;
      page?: number;
      pageSize?: number;
    }
  ): Promise<{
    reviews: ModuleReviewData[];
    total: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.sort) params.set('sort', options.sort);
    if (options?.status) params.set('status', options.status);
    params.set('page', String(options?.page ?? 1));
    params.set('pageSize', String(options?.pageSize ?? 20));

    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/reviews?${params}`
    );
    return res.json();
  }

  async submitReview(
    moduleId: string,
    data: {
      rating: number;
      title?: string;
      review: string;
      pros?: string;
      cons?: string;
    }
  ): Promise<ModuleReviewData> {
    const res = await fetch(`/api/marketplace/modules/${moduleId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const review = await res.json();

    await this.kernel.events.emit('marketplace:reviewSubmitted', {
      moduleId,
      reviewId: review.id,
      rating: data.rating,
    });

    return review;
  }

  async updateReview(
    reviewId: string,
    data: Partial<{
      title: string;
      review: string;
      pros: string;
      cons: string;
      rating: number;
    }>
  ): Promise<ModuleReviewData> {
    const res = await fetch(`/api/marketplace/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async deleteReview(reviewId: string): Promise<void> {
    await fetch(`/api/marketplace/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async markHelpful(reviewId: string): Promise<void> {
    await fetch(`/api/marketplace/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  async markNotHelpful(reviewId: string): Promise<void> {
    await fetch(`/api/marketplace/reviews/${reviewId}/not-helpful`, {
      method: 'POST',
    });
  }

  // ─── Developer Responses ───────────────────────────────────────

  async respondToReview(
    reviewId: string,
    response: string
  ): Promise<ReviewResponseData> {
    const res = await fetch(`/api/marketplace/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
    return res.json();
  }

  async deleteResponse(reviewId: string, responseId: string): Promise<void> {
    await fetch(
      `/api/marketplace/reviews/${reviewId}/responses/${responseId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // ─── Moderation (Category 5.3) ─────────────────────────────────

  async getModerationQueue(status?: 'pending' | 'flagged'): Promise<{
    reviews: ModuleReviewData[];
    queue: ReviewModerationQueue;
  }> {
    const params = status ? `?status=${status}` : '';
    const res = await fetch(
      `/api/admin/marketplace/reviews/moderation${params}`
    );
    return res.json();
  }

  async moderateReview(action: ModerationAction): Promise<void> {
    await fetch(`/api/admin/marketplace/reviews/${action.reviewId}/moderate`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async approveReview(reviewId: string): Promise<void> {
    await this.moderateReview({
      reviewId,
      action: 'approve',
      moderatorId: await this.getCurrentUserId(),
    });
  }

  async rejectReview(reviewId: string, reason: string): Promise<void> {
    await this.moderateReview({
      reviewId,
      action: 'reject',
      reason,
      moderatorId: await this.getCurrentUserId(),
    });
  }

  async flagReview(reviewId: string): Promise<void> {
    await this.moderateReview({
      reviewId,
      action: 'flag',
      moderatorId: await this.getCurrentUserId(),
    });
  }

  async appealRejection(reviewId: string, reason: string): Promise<void> {
    await fetch(`/api/marketplace/reviews/${reviewId}/appeal`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async checkReviewEditable(
    reviewId: string
  ): Promise<{ editable: boolean; remainingEdits: number; expiresAt: string }> {
    const res = await fetch(`/api/marketplace/reviews/${reviewId}/editable`);
    return res.json();
  }

  // ─── Spam Detection ────────────────────────────────────────────

  async reportReview(reviewId: string, reason: string): Promise<void> {
    await fetch(`/api/marketplace/reviews/${reviewId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async runSpamCheck(reviewId: string): Promise<{
    isSpam: boolean;
    confidence: number;
    reasons: string[];
  }> {
    const res = await fetch(
      `/api/admin/marketplace/reviews/${reviewId}/spam-check`
    );
    return res.json();
  }

  // ─── Review Analytics (Category 5.4) ───────────────────────────

  async getReviewAnalytics(moduleId: string): Promise<ReviewAnalytics> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/reviews/analytics`
    );
    return res.json();
  }

  async getReviewSummary(moduleId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    sentimentLabels: { label: string; percentage: number }[];
    recommendedPercentage: number;
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/reviews/summary`
    );
    return res.json();
  }

  // ─── Rating Weighting ──────────────────────────────────────────

  calculateWeightedRating(reviews: ModuleReviewData[]): number {
    if (reviews.length === 0) return 0;

    const now = Date.now();
    const weighted = reviews.reduce(
      (acc, r) => {
        const age = now - new Date(r.createdAt).getTime();
        const daysOld = age / (1000 * 60 * 60 * 24);
        const weight = Math.max(0.1, 1 - daysOld * 0.005);
        const verifiedBonus = r.verified ? 1.2 : 1;
        return {
          total: acc.total + r.rating * weight * verifiedBonus,
          weightSum: acc.weightSum + weight * verifiedBonus,
        };
      },
      { total: 0, weightSum: 0 }
    );

    return Math.round((weighted.total / weighted.weightSum) * 10) / 10;
  }

  // ─── Private Helpers ───────────────────────────────────────────

  private async getCurrentUserId(): Promise<string> {
    try {
      const user = await this.kernel.auth.user();
      return user?.id || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}
