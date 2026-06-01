import type { SukitKernel } from '@sukit/core';
import type { ProductionLayer } from '@sukit/production';

interface IPAllowlistEntry {
  cidr: string;
  description: string;
  addedBy: string;
  addedAt: string;
}
interface GeoFenceRule {
  countryCode: string;
  action: 'allow' | 'block';
  description: string;
}
interface TimeAccessPolicy {
  name: string;
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
}
interface DeviceTrustPolicy {
  requireCertificate: boolean;
  requireMDM: boolean;
  allowedOS: string[];
  minVersion: string;
}
interface DLPRecord {
  rule: string;
  content: string;
  action: 'blocked' | 'flagged' | 'logged';
  userId: string;
  timestamp: string;
}

export class AdvancedSecurity {
  private kernel: SukitKernel;
  private production: ProductionLayer;
  private ipAllowlists: Map<string, IPAllowlistEntry[]> = new Map();
  private geoFences: Map<string, GeoFenceRule[]> = new Map();
  private dlpRecords: DLPRecord[] = [];

  constructor(kernel: SukitKernel, production: ProductionLayer) {
    this.kernel = kernel;
    this.production = production;
  }

  // ─── IP Allowlisting ────────────────────────────────────────────

  setIPAllowlist(orgId: string, entries: IPAllowlistEntry[]): void {
    this.ipAllowlists.set(orgId, entries);
  }

  getIPAllowlist(orgId: string): IPAllowlistEntry[] {
    return this.ipAllowlists.get(orgId) || [];
  }

  addIPAllowlistEntry(
    orgId: string,
    cidr: string,
    description: string,
    addedBy: string
  ): void {
    const entries = this.getIPAllowlist(orgId);
    entries.push({
      cidr,
      description,
      addedBy,
      addedAt: new Date().toISOString(),
    });
    this.ipAllowlists.set(orgId, entries);
  }

  removeIPAllowlistEntry(orgId: string, cidr: string): void {
    this.ipAllowlists.set(
      orgId,
      this.getIPAllowlist(orgId).filter((e) => e.cidr !== cidr)
    );
  }

  checkIP(orgId: string, ip: string): boolean {
    const entries = this.getIPAllowlist(orgId);
    if (entries.length === 0) return true;
    return entries.some((e) => ip.startsWith(e.cidr.replace(/\/\d+$/, '')));
  }

  // ─── Geo-Fencing ───────────────────────────────────────────────

  setGeoFenceRules(orgId: string, rules: GeoFenceRule[]): void {
    this.geoFences.set(orgId, rules);
  }

  getGeoFenceRules(orgId: string): GeoFenceRule[] {
    return this.geoFences.get(orgId) || [];
  }

  addGeoFenceRule(orgId: string, rule: GeoFenceRule): void {
    const rules = this.getGeoFenceRules(orgId);
    rules.push(rule);
    this.geoFences.set(orgId, rules);
  }

  checkGeoFence(orgId: string, countryCode: string): boolean {
    const rules = this.getGeoFenceRules(orgId);
    if (rules.length === 0) return true;
    const matchedRule = rules.find((r) => r.countryCode === countryCode);
    if (!matchedRule) return rules.every((r) => r.action === 'allow');
    return matchedRule.action === 'allow';
  }

  // ─── Time-Based Access ─────────────────────────────────────────

  setTimeAccessPolicy(orgId: string, policy: TimeAccessPolicy): void {
    this.kernel.settings.set(
      `security:time-access:${orgId}`,
      JSON.stringify(policy)
    );
  }

  checkTimeAccess(orgId: string): boolean {
    const now = new Date();
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const policyStr = this.kernel.settings.get(
      `security:time-access:${orgId}`
    ) as string | null;
    if (!policyStr) return true;
    try {
      const policy = JSON.parse(policyStr);
      if (!policy.days.includes(currentDay)) return false;
      return currentTime >= policy.startTime && currentTime <= policy.endTime;
    } catch {
      return true;
    }
  }

  // ─── Device Trust ──────────────────────────────────────────────

  setDeviceTrustPolicy(orgId: string, policy: DeviceTrustPolicy): void {
    this.kernel.settings.set(
      `security:device-trust:${orgId}`,
      JSON.stringify(policy)
    );
  }

  checkDeviceTrust(
    orgId: string,
    deviceInfo: {
      os: string;
      version: string;
      hasCertificate: boolean;
      hasMDM: boolean;
    }
  ): { trusted: boolean; reasons: string[] } {
    const policyStr = this.kernel.settings.get(
      `security:device-trust:${orgId}`
    ) as string | null;
    if (!policyStr) return { trusted: true, reasons: [] };
    const policy = JSON.parse(policyStr);
    const reasons: string[] = [];
    if (policy.requireCertificate && !deviceInfo.hasCertificate)
      reasons.push('Device certificate required');
    if (policy.requireMDM && !deviceInfo.hasMDM)
      reasons.push('MDM enrollment required');
    if (
      policy.allowedOS.length > 0 &&
      !policy.allowedOS.includes(deviceInfo.os)
    )
      reasons.push(`OS ${deviceInfo.os} not allowed`);
    return { trusted: reasons.length === 0, reasons };
  }

  // ─── Data Loss Prevention ──────────────────────────────────────

  getDLPRules(): {
    id: string;
    name: string;
    pattern: string;
    action: string;
    enabled: boolean;
  }[] {
    return [
      {
        id: 'dlp-ssn',
        name: 'Social Security Numbers',
        pattern: '\\d{3}-\\d{2}-\\d{4}',
        action: 'block',
        enabled: true,
      },
      {
        id: 'dlp-cc',
        name: 'Credit Card Numbers',
        pattern: '\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}',
        action: 'block',
        enabled: true,
      },
      {
        id: 'dlp-api-key',
        name: 'API Keys',
        pattern: 'suk_[a-f0-9]{32,}',
        action: 'flag',
        enabled: true,
      },
      {
        id: 'dlp-email',
        name: 'Email Lists',
        pattern: '[\\w.-]+@[\\w.-]+\\.\\w{2,}',
        action: 'flag',
        enabled: false,
      },
    ];
  }

  checkDLP(content: string, userId: string): DLPRecord[] {
    const results: DLPRecord[] = [];
    for (const rule of this.getDLPRules()) {
      if (!rule.enabled) continue;
      const matches = content.match(new RegExp(rule.pattern, 'g'));
      if (matches) {
        const record: DLPRecord = {
          rule: rule.name,
          content: matches[0],
          action: rule.action as any,
          userId,
          timestamp: new Date().toISOString(),
        };
        results.push(record);
        this.dlpRecords.push(record);
      }
    }
    return results;
  }

  getDLPLogs(limit = 100): DLPRecord[] {
    return this.dlpRecords.slice(-limit).reverse();
  }

  // ─── Session Recording ─────────────────────────────────────────

  recordAdminAction(
    userId: string,
    action: string,
    details: Record<string, any>
  ): { recordingId: string; sessionId: string } {
    return {
      recordingId: crypto.randomUUID(),
      sessionId: `sess_${crypto.randomUUID().substring(0, 12)}`,
    };
  }

  // ─── Anomaly Detection ─────────────────────────────────────────

  detectAnomalies(
    userId: string,
    event: {
      type: string;
      ip: string;
      location: string;
      device: string;
      timestamp: string;
    }
  ): { isAnomaly: boolean; riskScore: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;
    if (event.location && event.location !== 'known') {
      score += 30;
      reasons.push('New location detected');
    }
    if (event.device && event.device !== 'known') {
      score += 20;
      reasons.push('New device detected');
    }
    if (event.ip && !this.checkIP('org_default', event.ip)) {
      score += 40;
      reasons.push('IP not in allowlist');
    }
    return { isAnomaly: score >= 50, riskScore: score, reasons };
  }

  // ─── Zero-Trust Network Architecture ───────────────────────

  private zeroTrustPolicies: Map<string, { enforce: boolean; mfaRequired: boolean; deviceTrustRequired: boolean; continuousVerification: boolean; microsegmentation: boolean; sessionDuration: number; leastPrivilege: boolean; justInTimeAccess: boolean }> = new Map();

  setZeroTrustPolicy(orgId: string, policy: {
    enforce: boolean;
    mfaRequired?: boolean;
    deviceTrustRequired?: boolean;
    continuousVerification?: boolean;
    microsegmentation?: boolean;
    sessionDuration?: number;
    leastPrivilege?: boolean;
    justInTimeAccess?: boolean;
  }): void {
    const existing = this.zeroTrustPolicies.get(orgId) || {
      enforce: false, mfaRequired: true, deviceTrustRequired: true,
      continuousVerification: true, microsegmentation: true,
      sessionDuration: 28800, leastPrivilege: true, justInTimeAccess: false,
    };
    this.zeroTrustPolicies.set(orgId, { ...existing, ...policy });
  }

  getZeroTrustPolicy(orgId: string): {
    enforce: boolean; mfaRequired: boolean; deviceTrustRequired: boolean;
    continuousVerification: boolean; microsegmentation: boolean;
    sessionDuration: number; leastPrivilege: boolean; justInTimeAccess: boolean;
  } {
    return this.zeroTrustPolicies.get(orgId) || {
      enforce: false, mfaRequired: true, deviceTrustRequired: true,
      continuousVerification: true, microsegmentation: true,
      sessionDuration: 28800, leastPrivilege: true, justInTimeAccess: false,
    };
  }

  evaluateZeroTrust(orgId: string, context: {
    userId: string; ip: string; location: string; device: { os: string; version: string; hasCertificate: boolean; hasMDM: boolean };
    mfaVerified: boolean; resource: string; time: string;
  }): { allowed: boolean; requirements: string[]; reason?: string } {
    const policy = this.getZeroTrustPolicy(orgId);
    if (!policy.enforce) return { allowed: true, requirements: [] };
    const requirements: string[] = [];
    if (policy.mfaRequired && !context.mfaVerified) requirements.push('MFA verification required');
    if (policy.deviceTrustRequired) {
      const dt = this.checkDeviceTrust(orgId, context.device);
      if (!dt.trusted) requirements.push(...dt.reasons);
    }
    if (policy.continuousVerification && context.location && context.location !== 'known') {
      requirements.push('Continuous verification: new location detected');
    }
    if (this.checkIP('org_default', context.ip)) {
      const geoCheck = this.checkGeoFence(orgId, context.location);
      if (!geoCheck) requirements.push('Location blocked by geo-fencing policy');
    }
    if (!this.checkTimeAccess(orgId)) requirements.push('Access outside allowed time window');
    return {
      allowed: requirements.length === 0,
      requirements,
      reason: requirements.length > 0 ? `Zero-trust blocked: ${requirements.join('; ')}` : undefined,
    };
  }

  generateZeroTrustReport(orgId: string): { status: string; policies: any; activeViolations: number; lastEvaluated: string } {
    const policy = this.getZeroTrustPolicy(orgId);
    return {
      status: policy.enforce ? 'enforcing' : 'disabled',
      policies: policy,
      activeViolations: 0,
      lastEvaluated: new Date().toISOString(),
    };
  }

  // ─── DLP Network-Level Enforcement ──────────────────────────

  private dlpNetworkRules: Map<string, { enabled: boolean; inspectHttpBody: boolean; inspectHttpHeaders: boolean; inspectWebSocket: boolean; blockActions: boolean; patterns: { regex: string; action: 'block' | 'alert' | 'mask'; maskChar: string }[]; allowedDomains: string[]; excludedPaths: string[] }> = new Map();

  setDlpNetworkRule(orgId: string, rule: {
    enabled?: boolean;
    inspectHttpBody?: boolean;
    inspectHttpHeaders?: boolean;
    inspectWebSocket?: boolean;
    blockActions?: boolean;
    patterns?: { regex: string; action: 'block' | 'alert' | 'mask'; maskChar?: string }[];
    allowedDomains?: string[];
    excludedPaths?: string[];
  }): void {
    const existing = this.dlpNetworkRules.get(orgId) || {
      enabled: false, inspectHttpBody: true, inspectHttpHeaders: true,
      inspectWebSocket: false, blockActions: true,
      patterns: [
        { regex: '\\b\\d{3}-\\d{2}-\\d{4}\\b', action: 'block', maskChar: '*' },
        { regex: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\\b', action: 'mask', maskChar: '*' },
        { regex: 'sk_live_[a-zA-Z0-9]{24,}', action: 'block', maskChar: '*' },
        { regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', action: 'alert', maskChar: '*' },
      ],
      allowedDomains: ['*.sukit.dev', '*.stripe.com', 'api.github.com'],
      excludedPaths: ['/api/health', '/metrics', '/favicon.ico'],
    };
    this.dlpNetworkRules.set(orgId, { ...existing, ...rule });
  }

  getDlpNetworkRule(orgId: string): { enabled: boolean; inspectHttpBody: boolean; inspectHttpHeaders: boolean; inspectWebSocket: boolean; blockActions: boolean; patterns: { regex: string; action: string; maskChar: string }[]; allowedDomains: string[]; excludedPaths: string[] } {
    return this.dlpNetworkRules.get(orgId) || {
      enabled: false, inspectHttpBody: true, inspectHttpHeaders: true,
      inspectWebSocket: false, blockActions: true,
      patterns: [
        { regex: '\\b\\d{3}-\\d{2}-\\d{4}\\b', action: 'block', maskChar: '*' },
        { regex: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\\b', action: 'mask', maskChar: '*' },
        { regex: 'sk_live_[a-zA-Z0-9]{24,}', action: 'block', maskChar: '*' },
      ],
      allowedDomains: ['*.sukit.dev'],
      excludedPaths: [],
    };
  }

  evaluateDlpNetwork(orgId: string, request: { method: string; path: string; body: string; headers: Record<string, string>; destination: string }): { blocked: boolean; matchedPatterns: string[]; actions: string[] } {
    const rule = this.getDlpNetworkRule(orgId);
    if (!rule.enabled) return { blocked: false, matchedPatterns: [], actions: [] };

    const matchedPatterns: string[] = [];
    const actions: string[] = [];

    if (rule.excludedPaths.some(p => request.path.startsWith(p))) {
      return { blocked: false, matchedPatterns: [], actions: [] };
    }

    const domainAllowed = rule.allowedDomains.some(d => {
      const pattern = d.replace(/\./g, '\\.').replace(/\*/g, '.*');
      return new RegExp(pattern).test(request.destination);
    });

    for (const pattern of rule.patterns) {
      const regex = new RegExp(pattern.regex, 'gi');
      if (rule.inspectHttpBody && regex.test(request.body)) {
        matchedPatterns.push(pattern.regex);
        actions.push(pattern.action);
      }
      if (rule.inspectHttpHeaders) {
        for (const [key, value] of Object.entries(request.headers)) {
          regex.lastIndex = 0;
          if (regex.test(value)) {
            matchedPatterns.push(`${pattern.regex} (header: ${key})`);
            actions.push(pattern.action);
          }
        }
      }
    }

    const blocked = rule.blockActions && actions.includes('block');
    return { blocked, matchedPatterns: [...new Set(matchedPatterns)], actions: [...new Set(actions)] };
  }

  generateDlpMiddlewareCode(): string {
    return `import { createHash } from 'crypto';

const SSN_REGEX = /\\b\\d{3}-\\d{2}-\\d{4}\\b/g;
const CC_REGEX = /\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\\b/g;
const API_KEY_REGEX = /sk_live_[a-zA-Z0-9]{24,}|suk_[a-zA-Z0-9]{32,}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;

export function dlpMiddleware(req: { method: string; url: string; body: string; headers: Record<string, string> }, patterns?: { regex: RegExp; action: string }[]) {
  const defaultPatterns = patterns || [
    { regex: SSN_REGEX, action: 'block' },
    { regex: CC_REGEX, action: 'mask' },
    { regex: API_KEY_REGEX, action: 'block' },
    { regex: EMAIL_REGEX, action: 'alert' },
  ];
  const violations: { pattern: string; location: string }[] = [];
  for (const p of defaultPatterns) {
    p.regex.lastIndex = 0;
    let match;
    while ((match = p.regex.exec(req.body)) !== null) {
      violations.push({ pattern: p.regex.source.substring(0, 20), location: 'body' });
    }
    for (const [key, value] of Object.entries(req.headers)) {
      p.regex.lastIndex = 0;
      while ((match = p.regex.exec(value)) !== null) {
        violations.push({ pattern: p.regex.source.substring(0, 20), location: 'header:' + key });
      }
    }
  }
  return { blocked: violations.some(v => v.pattern.includes('block')), violations };
}`;
  }
}
