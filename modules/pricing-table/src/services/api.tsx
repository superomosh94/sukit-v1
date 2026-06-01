const B = '/api/pricing';
export const pricingApi = {
  async list(active?: boolean): Promise<any[]> {
    const q = active ? '?active=true' : '';
    const r = await fetch(B + q);
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
};
