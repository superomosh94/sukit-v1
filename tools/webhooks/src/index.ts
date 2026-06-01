import { createHmac, randomBytes } from 'crypto';
import type { SukitKernel } from '@sukit/core';
import type { WebhookConfig, WebhookEvent, CommandResult } from '../../types';

interface WebhookLog {
  webhookId: string;
  event: string;
  status: string;
  timestamp: string;
  response?: string;
  latency: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class WebhookSystem {
  private kernel: SukitKernel;
  private registered: Map<string, WebhookConfig> = new Map();
  private logs: WebhookLog[] = [];
  private deadLetterQueue: WebhookLog[] = [];
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private stats: Map<
    string,
    {
      attempts: number;
      successes: number;
      failures: number;
      totalLatency: number;
    }
  > = new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.setupEventListeners();
  }

  register(config: Omit<WebhookConfig, 'id' | 'secret'>): WebhookConfig {
    const webhook: WebhookConfig = {
      id: crypto.randomUUID(),
      secret: randomBytes(32).toString('hex'),
      retryCount: 3,
      timeout: 10000,
      format: 'json',
      headers: {},
      ...config,
      active: true,
    };
    this.registered.set(webhook.id, webhook);
    this.stats.set(webhook.id, {
      attempts: 0,
      successes: 0,
      failures: 0,
      totalLatency: 0,
    });
    return webhook;
  }

  unregister(id: string): void {
    this.registered.delete(id);
    this.stats.delete(id);
  }

  list(): WebhookConfig[] {
    return Array.from(this.registered.values());
  }

  private setupEventListeners(): void {
    const events = [
      'site:created',
      'site:updated',
      'page:created',
      'page:published',
      'page:updated',
      'page:deleted',
      'media:uploaded',
      'module:installed',
      'module:uninstalled',
      'form:submitted',
      'user:registered',
      'backup:completed',
    ];
    for (const event of events) {
      this.kernel.events.on(event, async (payload: any) => {
        const eventObj: WebhookEvent = {
          id: crypto.randomUUID(),
          type: event,
          resourceType: event.split(':')[0],
          resourceId: payload?.id || payload?.siteId || '',
          payload,
          timestamp: new Date().toISOString(),
        };
        await this.dispatch(eventObj);
      });
    }
  }

  private async dispatch(event: WebhookEvent): Promise<void> {
    const matched = this.registered
      .values()
      .filter((w) => w.active && w.events.includes(event.type));
    for (const webhook of matched) {
      if (this.isRateLimited(webhook.id)) {
        this.addLog(
          webhook.id,
          event.type,
          'rate_limited',
          'Rate limit exceeded',
          0
        );
        continue;
      }
      if (webhook.allowedIPs && !this.isIPAllowed(webhook, event)) {
        this.addLog(webhook.id, event.type, 'ip_blocked', 'IP not allowed', 0);
        continue;
      }
      await this.sendWithRetry(webhook, event).catch((err) => {
        this.deadLetterQueue.push({
          webhookId: webhook.id,
          event: event.type,
          status: 'dead',
          timestamp: new Date().toISOString(),
          response: err.message,
          latency: 0,
        });
        this.kernel.events.emit('webhook:failed', {
          webhookId: webhook.id,
          event: event.type,
          error: err.message,
        });
      });
    }
  }

  private async sendWithRetry(
    webhook: WebhookConfig,
    event: WebhookEvent,
    attempt = 1
  ): Promise<void> {
    const payload = this.transformPayload(webhook, event);
    const body =
      webhook.format === 'json'
        ? JSON.stringify(payload)
        : new URLSearchParams(payload).toString();
    const signature = createHmac('sha256', webhook.secret)
      .update(typeof body === 'string' ? body : JSON.stringify(body))
      .digest('hex');
    const start = Date.now();

    try {
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type':
            webhook.format === 'json'
              ? 'application/json'
              : 'application/x-www-form-urlencoded',
          'X-Webhook-ID': event.id,
          'X-Event-Type': event.type,
          'X-Webhook-Signature': signature,
          'X-Signature-256': signature,
          ...webhook.headers,
        },
        body: body as any,
        signal: AbortSignal.timeout(webhook.timeout),
      });
      const latency = Date.now() - start;
      this.updateStats(webhook.id, true, latency);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      this.addLog(
        webhook.id,
        event.type,
        'sent',
        `HTTP ${res.status}`,
        latency
      );
      await this.kernel.events.emit('webhook:sent', {
        webhookId: webhook.id,
        event: event.type,
        status: res.status,
      });
    } catch (err: any) {
      const latency = Date.now() - start;
      this.updateStats(webhook.id, false, latency);
      this.addLog(webhook.id, event.type, 'failed', err.message, latency);
      if (attempt < webhook.retryCount) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        return this.sendWithRetry(webhook, event, attempt + 1);
      }
      throw err;
    }
  }

  private transformPayload(
    webhook: WebhookConfig,
    event: WebhookEvent
  ): Record<string, unknown> {
    if (!webhook.template) return event.payload || {};
    try {
      const tmpl =
        typeof webhook.template === 'string'
          ? JSON.parse(webhook.template)
          : webhook.template;
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(tmpl)) {
        if (typeof val === 'string') {
          result[key] = val.replace(/\{\{(\w+)\}\}/g, (_, k) =>
            String((event.payload as Record<string, unknown>)?.[k] ?? val)
          );
        } else {
          result[key] = val;
        }
      }
      return result;
    } catch {
      return event.payload || {};
    }
  }

  private isRateLimited(webhookId: string): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(webhookId);
    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(webhookId, { count: 1, resetAt: now + 60000 });
      return false;
    }
    entry.count++;
    return entry.count > 60;
  }

  private isIPAllowed(webhook: WebhookConfig, event: WebhookEvent): boolean {
    if (!webhook.allowedIPs || webhook.allowedIPs.length === 0) return true;
    return webhook.allowedIPs.some((ip) => {
      const sourceIP =
        ((event.payload as Record<string, unknown>)?.sourceIP as string) || '';
      return sourceIP === ip;
    });
  }

  private addLog(
    webhookId: string,
    event: string,
    status: string,
    response: string,
    latency: number
  ): void {
    this.logs.unshift({
      webhookId,
      event,
      status,
      timestamp: new Date().toISOString(),
      response,
      latency,
    });
    if (this.logs.length > 1000) this.logs = this.logs.slice(0, 1000);
  }

  private updateStats(
    webhookId: string,
    success: boolean,
    latency: number
  ): void {
    const s = this.stats.get(webhookId);
    if (s) {
      s.attempts++;
      if (success) s.successes++;
      else s.failures++;
      s.totalLatency += latency;
    }
  }

  async testEndpoint(url: string, event?: string): Promise<CommandResult> {
    const testEvent: WebhookEvent = {
      id: 'test',
      type: event || 'test:ping',
      resourceType: 'test',
      resourceId: 'test',
      payload: {
        message: 'This is a test webhook from SUKIT',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    const testWebhook: WebhookConfig = {
      id: 'test',
      name: 'Test',
      url,
      events: ['*'],
      secret: 'test-secret',
      active: true,
      retryCount: 0,
      timeout: 5000,
      format: 'json',
      headers: {},
    };
    try {
      await this.sendWithRetry(testWebhook, testEvent);
      return {
        success: true,
        message: `Test webhook sent to ${url}`,
        data: { url, event: testEvent.type },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Test failed: ${err.message}`,
        error: err.message,
      };
    }
  }

  registerSlack(url: string, events: string[]): WebhookConfig {
    return this.register({ name: 'Slack', url, events, format: 'json' });
  }
  registerDiscord(url: string, events: string[]): WebhookConfig {
    return this.register({ name: 'Discord', url, events });
  }
  registerTeams(url: string, events: string[]): WebhookConfig {
    return this.register({
      name: 'Microsoft Teams',
      url,
      events,
      format: 'json',
    });
  }
  registerZapier(url: string, events: string[]): WebhookConfig {
    return this.register({ name: 'Zapier', url, events, format: 'json' });
  }
  registerMake(url: string, events: string[]): WebhookConfig {
    return this.register({
      name: 'Make (Integromat)',
      url,
      events,
      format: 'json',
    });
  }

  async sendToZapier(
    zapId: string,
    trigger: string,
    payload: any
  ): Promise<CommandResult> {
    const url = `https://hooks.zapier.com/hooks/catch/${zapId}/${trigger}/`;
    const event: WebhookEvent = {
      id: crypto.randomUUID(),
      type: 'zapier:trigger',
      resourceType: 'external',
      resourceId: zapId,
      payload,
      timestamp: new Date().toISOString(),
    };
    try {
      await this.sendWithRetry(
        {
          id: 'zapier-' + zapId,
          name: 'Zapier',
          url,
          events: ['*'],
          secret: '',
          active: true,
          retryCount: 2,
          timeout: 15000,
          format: 'json',
          headers: {},
        },
        event
      );
      return {
        success: true,
        message: `Zap triggered: ${trigger}`,
        data: { zapId, trigger },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Zap failed: ${err.message}`,
        error: err.message,
      };
    }
  }

  async sendToMake(webhookId: string, payload: any): Promise<CommandResult> {
    const url = `https://hook.eu1.make.com/${webhookId}`;
    const event: WebhookEvent = {
      id: crypto.randomUUID(),
      type: 'make:webhook',
      resourceType: 'external',
      resourceId: webhookId,
      payload,
      timestamp: new Date().toISOString(),
    };
    try {
      await this.sendWithRetry(
        {
          id: 'make-' + webhookId,
          name: 'Make',
          url,
          events: ['*'],
          secret: '',
          active: true,
          retryCount: 2,
          timeout: 15000,
          format: 'json',
          headers: {},
        },
        event
      );
      return {
        success: true,
        message: 'Data sent to Make scenario',
        data: { webhookId },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Make webhook failed: ${err.message}`,
        error: err.message,
      };
    }
  }

  async sendToTeams(
    webhookUrl: string,
    title: string,
    message: string,
    color = '0072C6'
  ): Promise<CommandResult> {
    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: color,
      summary: title,
      sections: [{ activityTitle: title, text: message, markdown: true }],
    };
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        message: 'Teams notification sent',
        data: { title },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Teams webhook failed: ${err.message}`,
        error: err.message,
      };
    }
  }

  async sendSlackMessage(
    webhookUrl: string,
    text: string,
    channel?: string
  ): Promise<CommandResult> {
    const payload: Record<string, unknown> = { text };
    if (channel) payload.channel = channel;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        message: 'Slack message sent',
        data: { channel },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Slack webhook failed: ${err.message}`,
        error: err.message,
      };
    }
  }

  async sendDiscordMessage(
    webhookUrl: string,
    content: string,
    username?: string
  ): Promise<CommandResult> {
    const payload: Record<string, unknown> = { content };
    if (username) payload.username = username;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        message: 'Discord message sent',
        data: { username },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Discord webhook failed: ${err.message}`,
        error: err.message,
      };
    }
  }

  registerIntegration(
    platform: 'slack' | 'discord' | 'teams' | 'zapier' | 'make',
    url: string,
    events: string[]
  ): WebhookConfig {
    const names: Record<string, string> = {
      slack: 'Slack',
      discord: 'Discord',
      teams: 'Microsoft Teams',
      zapier: 'Zapier',
      make: 'Make (Integromat)',
    };
    return this.register({
      name: names[platform] || platform,
      url,
      events,
      format: 'json',
    });
  }

  getRecentLogs(): WebhookLog[] {
    return this.logs;
  }

  getDeadLetterQueue(): WebhookLog[] {
    return this.deadLetterQueue;
  }

  retryDeadLetter(index: number): void {
    const entry = this.deadLetterQueue[index];
    if (!entry) return;
    this.deadLetterQueue.splice(index, 1);
  }

  getAnalytics(): {
    deliveryRate: number;
    avgLatency: number;
    totalAttempts: number;
  } {
    let totalAttempts = 0,
      totalSuccesses = 0,
      totalLatency = 0;
    for (const s of this.stats.values()) {
      totalAttempts += s.attempts;
      totalSuccesses += s.successes;
      totalLatency += s.totalLatency;
    }
    return {
      deliveryRate: totalAttempts > 0 ? totalSuccesses / totalAttempts : 1,
      avgLatency: totalSuccesses > 0 ? totalLatency / totalSuccesses : 0,
      totalAttempts,
    };
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const expectedV1 = createHmac('sha1', secret).update(payload).digest('hex');
    return signature === expected || signature === expectedV1;
  }
}
