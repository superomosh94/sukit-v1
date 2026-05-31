import { Worker, Job } from 'bullmq';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';

interface EmailJobData {
  type: 'welcome' | 'password-reset' | 'export-complete' | 'invite';
  to: string;
  data: Record<string, any>;
}

async function sendEmail(type: string, to: string, data: Record<string, any>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn('RESEND_API_KEY not set, skipping email');
    return;
  }

  const templates: Record<string, { subject: string; html: string }> = {
    welcome: {
      subject: 'Welcome to SUKIT!',
      html: `<h1>Welcome ${data.name || 'there'}!</h1><p>Thanks for joining SUKIT.</p>`,
    },
    'password-reset': {
      subject: 'Reset your SUKIT password',
      html: `<p>Click <a href="${data.resetUrl}">here</a> to reset your password.</p>`,
    },
    'export-complete': {
      subject: 'Your site export is ready',
      html: `<p>Your site "${data.siteName}" has been exported. <a href="${data.downloadUrl}">Download here</a>.</p>`,
    },
    invite: {
      subject: `You've been invited to ${data.siteName}`,
      html: `<p>You've been invited to collaborate on "${data.siteName}". <a href="${data.inviteUrl}">Accept invite</a>.</p>`,
    },
  };

  const template = templates[type];
  if (!template) throw new Error(`Unknown email type: ${type}`);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.SMTP_FROM || 'noreply@sukit.dev',
      to,
      subject: template.subject,
      html: template.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status} ${await response.text()}`);
  }
}

export const emailWorker = new Worker<EmailJobData>(
  'sukit-emails',
  async (job: Job<EmailJobData>) => {
    const { type, to, data } = job.data;
    logger.info(`Sending email`, { type, to, jobId: job.id });
    await sendEmail(type, to, data);
  },
  { connection: getRedis() }
);

emailWorker.on('completed', (job) => {
  logger.info(`Email job completed`, { jobId: job.id });
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job failed`, { jobId: job?.id, error: err.message });
});
