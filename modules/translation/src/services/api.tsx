const B = '/api/translations';
export const translationApi = {
  async listLanguages(): Promise<any[]> {
    const r = await fetch(B + '/languages');
    return r.json();
  },
  async toggleLanguage(code: string): Promise<any> {
    const r = await fetch(B + '/languages/' + code + '/toggle', {
      method: 'POST',
    });
    return r.json();
  },
  async listKeys(params?: any): Promise<any[]> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const r = await fetch(B + '/keys' + qs);
    return r.json();
  },
  async createKey(d: any): Promise<any> {
    const r = await fetch(B + '/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async updateKey(id: string, d: any): Promise<any> {
    const r = await fetch(B + '/keys/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async deleteKey(id: string): Promise<void> {
    await fetch(B + '/keys/' + id, { method: 'DELETE' });
  },
  async updateTranslation(
    keyId: string,
    langCode: string,
    value: string
  ): Promise<any> {
    const r = await fetch(B + '/keys/' + keyId + '/translate/' + langCode, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    return r.json();
  },
};
