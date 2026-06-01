const B = '/api/custom-code';
export const customCodeApi = {
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
  async toggle(id: string): Promise<any> {
    const r = await fetch(B + '/' + id + '/toggle', { method: 'POST' });
    return r.json();
  },
  async getActive(): Promise<any> {
    const r = await fetch(B + '/active');
    return r.json();
  },
};
