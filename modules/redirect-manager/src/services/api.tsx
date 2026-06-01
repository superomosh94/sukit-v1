const B = '/api/redirects';
export const redirectApi = {
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
  async test(source: string): Promise<any> {
    const r = await fetch(B + '/test?source=' + encodeURIComponent(source));
    return r.json();
  },
  async log404(url: string, referer?: string): Promise<void> {
    await fetch(B + '/404', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, referer }),
    });
  },
  async get404Logs(): Promise<any[]> {
    const r = await fetch(B + '/404');
    return r.json();
  },
  async importBulk(items: any[]): Promise<any> {
    const r = await fetch(B + '/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    return r.json();
  },
};
