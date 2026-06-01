import { prisma } from '@/lib/db/prisma';
import { createHmac } from 'crypto';

export async function deliverWebhooks(
  event: string,
  payload: unknown
): Promise<void> {
  try {
    const hooks = await prisma.webhookConfig.findMany({
      where: {
        active: true,
        OR: [{ events: { has: event } }, { events: { has: '*' } }],
      },
    });
    const body = JSON.stringify({ event, payload, timestamp: Date.now() });
    await Promise.allSettled(
      hooks.map(async (hook) => {
        const signature = createHmac('sha256', hook.secret)
          .update(body)
          .digest('hex');
        const start = Date.now();
        let status = 'success';
        let responseStatus: number | null = null;
        let responseBody: string | null = null;
        let error: string | null = null;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(
            () => controller.abort(),
            hook.timeoutMs || 10000
          );
          const res = await fetch(hook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sukit-Event': event,
              'X-Sukit-Signature': `sha256=${signature}`,
              ...(hook.headers as Record<string, string> | null),
            },
            body,
            signal: controller.signal,
          });
          clearTimeout(timeout);
          responseStatus = res.status;
          responseBody = (await res.text()).slice(0, 1000);
          if (!res.ok) status = 'failed';
          await prisma.webhookConfig.update({
            where: { id: hook.id },
            data: { lastUsedAt: new Date() },
          });
        } catch (e: any) {
          status = 'failed';
          error = e?.message || String(e);
        }
        await prisma.webhookLog.create({
          data: {
            webhookId: hook.id,
            event,
            status,
            requestUrl: hook.url,
            requestBody: payload as any,
            responseStatus,
            responseBody,
            durationMs: Date.now() - start,
            error,
          },
        });
      })
    );
  } catch (e) {
    console.error('[webhooks] delivery error', e);
  }
}
