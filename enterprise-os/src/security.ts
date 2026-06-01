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
}
