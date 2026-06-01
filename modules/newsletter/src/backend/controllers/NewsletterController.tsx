interface StoredList {
  id: string;
  name: string;
  subscribers: number;
}
interface StoredSubscriber {
  id: string;
  listId: string;
  email: string;
  name?: string;
  status: string;
  subscribedAt: Date;
}
interface StoredCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  listId: string;
  status: string;
  sentAt?: Date;
  opens: number;
  clicks: number;
  bounces: number;
  unsubs: number;
}

const store: {
  lists: StoredList[];
  subscribers: StoredSubscriber[];
  campaigns: StoredCampaign[];
} = { lists: [], subscribers: [], campaigns: [] };
let nid = 1;

export class NewsletterController {
  async createList(data: any) {
    const l: StoredList = {
      id: String(nid++),
      name: data.name,
      subscribers: 0,
    };
    store.lists.push(l);
    return l;
  }
  async listLists() {
    return store.lists;
  }
  async subscribe(data: any) {
    const s: StoredSubscriber = {
      id: String(nid++),
      listId: data.listId,
      email: data.email,
      name: data.name,
      status: 'SUBSCRIBED',
      subscribedAt: new Date(),
    };
    store.subscribers.push(s);
    const list = store.lists.find((l) => l.id === data.listId);
    if (list) list.subscribers++;
    return s;
  }
  async listSubscribers(listId?: string) {
    return listId
      ? store.subscribers.filter((s) => s.listId === listId)
      : store.subscribers;
  }
  async unsubscribe(email: string) {
    const s = store.subscribers.find((s) => s.email === email);
    if (s) {
      s.status = 'UNSUBSCRIBED';
    }
    return { s: true };
  }
  async createCampaign(data: any) {
    const c: StoredCampaign = {
      id: String(nid++),
      name: data.name,
      subject: data.subject,
      content: data.content,
      listId: data.listId,
      status: 'DRAFT',
      opens: 0,
      clicks: 0,
      bounces: 0,
      unsubs: 0,
    };
    store.campaigns.push(c);
    return c;
  }
  async listCampaigns() {
    return store.campaigns;
  }
  async sendCampaign(id: string) {
    const c = store.campaigns.find((c) => c.id === id);
    if (!c) throw new Error('Campaign not found');
    c.status = 'SENT';
    c.sentAt = new Date();
    return c;
  }
  async getAnalytics() {
    const total = store.subscribers.length;
    const active = store.subscribers.filter(
      (s) => s.status === 'SUBSCRIBED'
    ).length;
    const sent = store.campaigns.filter((c) => c.status === 'SENT').length;
    const totalOpens = store.campaigns.reduce((s, c) => s + c.opens, 0);
    return {
      totalSubscribers: total,
      activeSubscribers: active,
      sentCampaigns: sent,
      totalOpens,
    };
  }
}
