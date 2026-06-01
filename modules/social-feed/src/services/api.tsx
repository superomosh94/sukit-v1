const B = '/api/social-feed';
export const socialFeedApi = {
  async list(platform?: string): Promise<any[]> {
    const q = platform ? '?platform=' + platform : '';
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
  async toggleModeration(id: string): Promise<any> {
    const r = await fetch(B + '/' + id + '/moderate', { method: 'POST' });
    return r.json();
  },
};
