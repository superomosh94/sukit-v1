const B = '/api/reviews';
export const reviewsApi = {
  async list(params?: any): Promise<any[]> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const r = await fetch(B + qs);
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
  async approve(id: string): Promise<any> {
    const r = await fetch(B + '/' + id + '/approve', { method: 'POST' });
    return r.json();
  },
  async reject(id: string): Promise<any> {
    const r = await fetch(B + '/' + id + '/reject', { method: 'POST' });
    return r.json();
  },
  async markSpam(id: string): Promise<any> {
    const r = await fetch(B + '/' + id + '/spam', { method: 'POST' });
    return r.json();
  },
  async vote(id: string, type: 'helpful' | 'notHelpful'): Promise<any> {
    const r = await fetch(B + '/' + id + '/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    return r.json();
  },
  async getAggregate(productId: string): Promise<any> {
    const r = await fetch(B + '/aggregate/' + productId);
    return r.json();
  },
};
