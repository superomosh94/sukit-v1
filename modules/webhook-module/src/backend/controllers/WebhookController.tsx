interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  integration?: string;
  retries: number;
  createdAt: Date;
}
interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: number;
  response: string;
  duration: number;
  attempt: number;
  timestamp: Date;
}
const webhooks: WebhookItem[] = [];
const logs: WebhookLog[] = [];
let nid = 1;
export class WebhookController {
  async list() {
    return webhooks;
  }
  async get(id: string) {
    const w = webhooks.find((x) => x.id === id);
    if (!w) throw new Error('Webhook not found');
    return w;
  }
  async create(data: any) {
    const w: WebhookItem = {
      id: String(nid++),
      name: data.name,
      url: data.url,
      events: data.events || [],
      secret: data.secret,
      active: data.active !== false,
      integration: data.integration,
      retries: data.retries || 3,
      createdAt: new Date(),
    };
    webhooks.push(w);
    return w;
  }
  async update(id: string, data: any) {
    const idx = webhooks.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Webhook not found');
    Object.assign(webhooks[idx], data);
    return webhooks[idx];
  }
  async delete(id: string) {
    const idx = webhooks.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Webhook not found');
    webhooks.splice(idx, 1);
    return { success: true };
  }
  async getLogs(webhookId?: string) {
    return webhookId
      ? logs.filter((l) => l.webhookId === webhookId)
      : [...logs].reverse();
  }
  async test(id: string) {
    const w = webhooks.find((x) => x.id === id);
    if (!w) throw new Error('Webhook not found');
    const start = Date.now();
    const logEntry: WebhookLog = {
      id: String(nid++),
      webhookId: id,
      event: 'test',
      status: 200,
      response: 'Test successful',
      duration: Date.now() - start,
      attempt: 1,
      timestamp: new Date(),
    };
    logs.push(logEntry);
    return { success: true, log: logEntry };
  }
}
