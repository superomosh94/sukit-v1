const B = '/api/countdown';
export const countdownApi = {
  async list(): Promise<any[]> {
    const r = await fetch(B);
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
  async trackView(id: string): Promise<any> {
    const r = await fetch(B + '/' + id + '/view', { method: 'POST' });
    return r.json();
  },
  async trackConversion(id: string): Promise<any> {
    const r = await fetch(B + '/' + id + '/convert', { method: 'POST' });
    return r.json();
  },
  async getAnalytics(): Promise<any> {
    const r = await fetch(B + '/analytics');
    return r.json();
  },
};
