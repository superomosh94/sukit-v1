import { createHmac, randomBytes } from 'crypto';
import type { SukitKernel } from '@sukit/core';
import type { WebhookConfig, WebhookEvent, CommandResult } from '../../types';

export class WebhookSystem {
  private kernel: SukitKernel;
  private registered: Map<string, WebhookConfig> = new Map();

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
    return webhook;
  }

  unregister(id: string): void {
    this.registered.delete(id);
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
      await this.sendWithRetry(webhook, event).catch((err) =>
        this.kernel.events.emit('webhook:failed', {
          webhookId: webhook.id,
          event: event.type,
          error: err.message,
        })
      );
    }
  }

  private async sendWithRetry(
    webhook: WebhookConfig,
    event: WebhookEvent,
    attempt = 1
  ): Promise<void> {
    const payload =
      webhook.format === 'json'
        ? event.payload
        : new URLSearchParams(event.payload).toString();
    const body = webhook.format === 'json' ? JSON.stringify(payload) : payload;
    const signature = createHmac('sha256', webhook.secret)
      .update(typeof body === 'string' ? body : JSON.stringify(body))
      .digest('hex');

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

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      await this.kernel.events.emit('webhook:sent', {
        webhookId: webhook.id,
        event: event.type,
        status: res.status,
      });
    } catch (err: any) {
      if (attempt < webhook.retryCount) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        return this.sendWithRetry(webhook, event, attempt + 1);
      }
      throw err;
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
    color: string = '0072C6'
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
    const payload: any = { text };
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
    const payload: any = { content };
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

  getRecentLogs(): {
    webhookId: string;
    event: string;
    status: string;
    timestamp: string;
    response?: string;
  }[] {
    return [];
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const expectedV1 = createHmac('sha1', secret).update(payload).digest('hex');
    return signature === expected || signature === expectedV1;
  }
}
