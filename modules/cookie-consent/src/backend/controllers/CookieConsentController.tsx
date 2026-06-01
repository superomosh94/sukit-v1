interface CookieBannerConfig {
  id: string;
  layout: 'bar' | 'modal' | 'floating';
  position: string;
  theme: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  cookiePolicyUrl: string;
  createdAt: Date;
}
interface ConsentLog {
  id: string;
  visitorId: string;
  consent: Record<string, boolean>;
  timestamp: Date;
}
const configs: CookieBannerConfig[] = [
  {
    id: 'default',
    layout: 'bar',
    position: 'bottom',
    theme: 'light',
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    cookiePolicyUrl: '/cookies',
    createdAt: new Date(),
  },
];
const logs: ConsentLog[] = [];
let nid = 100;
export class CookieConsentController {
  async getConfig() {
    return configs[0];
  }
  async updateConfig(data: any) {
    Object.assign(configs[0], data);
    return configs[0];
  }
  async logConsent(visitorId: string, consent: Record<string, boolean>) {
    const l: ConsentLog = {
      id: String(nid++),
      visitorId,
      consent,
      timestamp: new Date(),
    };
    logs.push(l);
    return l;
  }
  async getLogs() {
    return [...logs].reverse();
  }
  async getStats() {
    const total = logs.length;
    const acceptedNecessary = logs.filter((l) => l.consent.necessary).length;
    const acceptedAnalytics = logs.filter((l) => l.consent.analytics).length;
    const acceptedMarketing = logs.filter((l) => l.consent.marketing).length;
    return {
      totalConsents: total,
      acceptedNecessary,
      acceptedAnalytics,
      acceptedMarketing,
    };
  }
}
