export type EventName =
  | 'module.installed'
  | 'module.uninstalled'
  | 'module.updated'
  | 'module.published'
  | 'module.featured'
  | 'review.submitted'
  | 'review.responded'
  | 'review.approved'
  | 'review.rejected'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'subscription.created'
  | 'subscription.canceled'
  | 'subscription.renewed'
  | 'refund.requested'
  | 'refund.completed'
  | 'payout.requested'
  | 'payout.completed'
  | 'license.activated'
  | 'license.deactivated'
  | 'ticket.created'
  | 'ticket.updated'
  | 'ticket.resolved'
  | 'developer.approved'
  | 'developer.rejected'
  | 'submission.approved'
  | 'submission.rejected'
  | 'kb.published';

export type EventPayload = Record<string, unknown>;

export async function emit(
  event: EventName,
  payload: EventPayload
): Promise<void> {
  try {
    const { prisma } = await import('@/lib/db/prisma');
    const { deliverWebhooks } = await import('./webhooks');
    await deliverWebhooks(event, payload);
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.MARKETPLACE_LOG_EVENTS !== '1'
    ) {
      // Quiet by default in dev
    } else {
      console.log(`[event] ${event}`, JSON.stringify(payload).slice(0, 200));
    }
  } catch (e) {
    console.error('[events] emit failed', event, e);
  }
}
