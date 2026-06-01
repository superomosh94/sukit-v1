const B = '/api/testimonials';
export const testimonialApi = {
  async list(featured?: boolean): Promise<any[]> {
    const q = featured ? '?featured=true' : '';
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
  async delete(id: string): Promise<void> {
    await fetch(B + '/' + id, { method: 'DELETE' });
  },
  async toggleFeatured(id: string): Promise<any> {
    const r = await fetch(B + '/' + id + '/feature', { method: 'POST' });
    return r.json();
  },
};
