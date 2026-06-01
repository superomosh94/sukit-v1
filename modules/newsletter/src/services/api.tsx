const B = '/api/newsletter';
export const newsletterApi = {
  async listLists(): Promise<any[]> {
    const r = await fetch(B + '/lists');
    return r.json();
  },
  async createList(d: any): Promise<any> {
    const r = await fetch(B + '/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async subscribe(d: any): Promise<any> {
    const r = await fetch(B + '/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async listSubscribers(listId?: string): Promise<any[]> {
    const q = listId ? '?listId=' + listId : '';
    const r = await fetch(B + '/subscribers' + q);
    return r.json();
  },
  async unsubscribe(email: string): Promise<void> {
    await fetch(B + '/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  },
  async listCampaigns(): Promise<any[]> {
    const r = await fetch(B + '/campaigns');
    return r.json();
  },
  async createCampaign(d: any): Promise<any> {
    const r = await fetch(B + '/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async sendCampaign(id: string): Promise<any> {
    const r = await fetch(B + '/campaigns/' + id + '/send', { method: 'POST' });
    return r.json();
  },
  async getAnalytics(): Promise<any> {
    const r = await fetch(B + '/analytics');
    return r.json();
  },
};
