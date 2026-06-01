const B = '/api/faq';
export const faqApi = {
  async listCategories(): Promise<any[]> {
    const r = await fetch(B + '/categories');
    return r.json();
  },
  async createCategory(d: any): Promise<any> {
    const r = await fetch(B + '/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async listFaqs(categoryId?: string): Promise<any[]> {
    const q = categoryId ? '?categoryId=' + categoryId : '';
    const r = await fetch(B + '/faqs' + q);
    return r.json();
  },
  async createFaq(d: any): Promise<any> {
    const r = await fetch(B + '/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async vote(id: string, type: 'helpful' | 'notHelpful'): Promise<any> {
    const r = await fetch(B + '/faqs/' + id + '/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    return r.json();
  },
  async search(q: string): Promise<any[]> {
    const r = await fetch(B + '/search?q=' + encodeURIComponent(q));
    return r.json();
  },
  async getAnalytics(): Promise<any> {
    const r = await fetch(B + '/analytics');
    return r.json();
  },
};
