const B = '/api/cookie-consent';
export const cookieConsentApi = {
  async getConfig(): Promise<any> {
    const r = await fetch(B + '/config');
    return r.json();
  },
  async updateConfig(d: any): Promise<any> {
    const r = await fetch(B + '/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async logConsent(
    visitorId: string,
    consent: Record<string, boolean>
  ): Promise<any> {
    const r = await fetch(B + '/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, consent }),
    });
    return r.json();
  },
  async getLogs(): Promise<any[]> {
    const r = await fetch(B + '/logs');
    return r.json();
  },
  async getStats(): Promise<any> {
    const r = await fetch(B + '/stats');
    return r.json();
  },
};
