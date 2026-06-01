import { Worker, Job } from 'bullmq';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';

interface WebhookJobData {
  url: string;
  event: string;
  payload: any;
}

async function deliverWebhook(
  url: string,
  event: string,
  payload: any
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SUKIT-Event': event,
      'X-SUKIT-Signature': 'sha256=placeholder',
    },
    body: JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Webhook delivery failed: ${response.status} ${await response.text()}`
    );
  }
}

export const webhookWorker = new Worker<WebhookJobData>(
  'sukit-webhooks',
  async (job: Job<WebhookJobData>) => {
    const { url, event, payload } = job.data;
    logger.info(`Delivering webhook`, {
      event,
      url,
      jobId: job.id,
      attempt: job.attemptsMade + 1,
    });
    await deliverWebhook(url, event, payload);
    logger.info(`Webhook delivered`, { event, url, jobId: job.id });
  },
  {
    connection: getRedis() as any,
  } as any
);

webhookWorker.on('completed', (job) => {
  logger.info(`Webhook job completed`, { jobId: job.id });
});

webhookWorker.on('failed', (job, err) => {
  logger.error(`Webhook job failed after ${job?.attemptsMade} attempts`, {
    jobId: job?.id,
    error: err.message,
  });
});
