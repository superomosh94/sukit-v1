const B = '/api/webhooks';
export const webhookApi = {
  async list(): Promise<any[]> {
    const r = await fetch(B);
    return r.json();
  },
  async get(id: string): Promise<any> {
    const r = await fetch(B + '/' + id);
    return r.json();
  },
  async create(d: any): Promise<any> {
    const r = await fetch(B, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async update(id: string, d: any): Promise<any> {
    const r = await fetch(B + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async delete(id: string): Promise<void> {
    await fetch(B + '/' + id, { method: 'DELETE' });
  },
  async getLogs(webhookId?: string): Promise<any[]> {
    const q = webhookId ? '/' + webhookId + '/logs' : '';
    const r = await fetch(B + q);
    return r.json();
  },
  async test(id: string): Promise<any> {
    const r = await fetch(B + '/' + id + '/test', { method: 'POST' });
    return r.json();
  },
};
