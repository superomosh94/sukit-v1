import type { SukitKernel } from '@sukit/core';

type OrgRole = 'owner' | 'admin' | 'member' | 'viewer' | 'custom';
type OrgPlan = 'starter' | 'growth' | 'enterprise' | 'reseller';

interface OrgConfig {
  maxTeams: number;
  maxMembers: number;
  ssoRequired: boolean;
  scimEnabled: boolean;
  directorySync: boolean;
  allowedDomains: string[];
  sessionTimeout: number;
  mfaRequired: boolean;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo: string | null;
  plan: OrgPlan;
  config: OrgConfig;
  members: OrgMember[];
  teams: OrgTeam[];
  sso?: SSOConfig;
  createdAt: string;
  updatedAt: string;
}

interface OrgMember {
  userId: string;
  email: string;
  name: string;
  role: OrgRole;
  teams: string[];
  joinedAt: string;
  lastActive: string;
  mfaEnabled: boolean;
}

interface OrgTeam {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  permissions: string[];
  createdAt: string;
}

interface SSOConfig {
  provider: 'saml' | 'oidc' | 'okta' | 'azure-ad' | 'google' | 'auth0';
  issuer: string;
  entryPoint: string;
  certificate: string | null;
  clientId: string | null;
  clientSecret: string | null;
  mapping: Record<string, string>;
  jitProvisioning: boolean;
  scimEndpoint: string | null;
  enabled: boolean;
}

export class OrganizationManager {
  private kernel: SukitKernel;
  private orgs: Map<string, Organization> = new Map();
  private userOrgs: Map<string, string[]> = new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  createOrg(
    name: string,
    ownerUserId: string,
    plan: OrgPlan = 'starter'
  ): Organization {
    const id = `org_${crypto.randomUUID().substring(0, 12)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const org: Organization = {
      id,
      name,
      slug,
      domain: null,
      logo: null,
      plan,
      config: {
        maxTeams: 10,
        maxMembers: plan === 'enterprise' ? 1000 : 25,
        ssoRequired: plan === 'enterprise',
        scimEnabled: plan === 'enterprise',
        directorySync: false,
        allowedDomains: [],
        sessionTimeout: 28800,
        mfaRequired: plan === 'enterprise',
      },
      members: [
        {
          userId: ownerUserId,
          email: '',
          name: 'Owner',
          role: 'owner',
          teams: [],
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          mfaEnabled: false,
        },
      ],
      teams: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orgs.set(id, org);
    this.userOrgs.set(ownerUserId, [
      ...(this.userOrgs.get(ownerUserId) || []),
      id,
    ]);
    this.triggerAutoPersist();
    return org;
  }

  getOrg(orgId: string): Organization | undefined {
    return this.orgs.get(orgId);
  }

  getOrgsForUser(userId: string): Organization[] {
    return (this.userOrgs.get(userId) || [])
      .map((id) => this.orgs.get(id)!)
      .filter(Boolean);
  }

  updateOrg(
    orgId: string,
    updates: Partial<Organization>
  ): Organization | null {
    const org = this.orgs.get(orgId);
    if (!org) return null;
    Object.assign(org, updates, { updatedAt: new Date().toISOString() });
    this.triggerAutoPersist();
    return org;
  }

  deleteOrg(orgId: string): boolean {
    const org = this.orgs.get(orgId);
    if (!org) return false;
    for (const m of org.members) {
      const userOrgs = this.userOrgs.get(m.userId) || [];
      this.userOrgs.set(
        m.userId,
      userOrgs.filter((id) => id !== orgId)
    );
    const result = this.orgs.delete(orgId);
    this.triggerAutoPersist();
    return result;
  }
    return this.orgs.delete(orgId);
  }

  addMember(
    orgId: string,
    email: string,
    name: string,
    role: OrgRole = 'member'
  ): OrgMember | null {
    const org = this.orgs.get(orgId);
    if (!org || org.members.length >= org.config.maxMembers) return null;
    if (org.config.allowedDomains.length > 0) {
      const emailDomain = email.split('@')[1];
      if (!org.config.allowedDomains.includes(emailDomain)) return null;
    }
    const member: OrgMember = {
      userId: `user_${crypto.randomUUID().substring(0, 8)}`,
      email,
      name,
      role,
      teams: [],
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      mfaEnabled: false,
    };
    org.members.push(member);
    this.userOrgs.set(member.userId, [
      ...(this.userOrgs.get(member.userId) || []),
      orgId,
    ]);
    this.triggerAutoPersist();
    return member;
  }

  removeMember(orgId: string, userId: string): boolean {
    const org = this.orgs.get(orgId);
    if (!org) return false;
    const ownerCount = org.members.filter((m) => m.role === 'owner').length;
    const member = org.members.find((m) => m.userId === userId);
    if (!member || (member.role === 'owner' && ownerCount <= 1)) return false;
    org.members = org.members.filter((m) => m.userId !== userId);
    const userOrgs = this.userOrgs.get(userId) || [];
    this.userOrgs.set(
      userId,
      userOrgs.filter((id) => id !== orgId)
    );
    this.triggerAutoPersist();
    return true;
  }

  updateMemberRole(orgId: string, userId: string, role: OrgRole): boolean {
    const org = this.orgs.get(orgId);
    if (!org) return false;
    const member = org.members.find((m) => m.userId === userId);
    if (!member) return false;
    member.role = role;
    this.triggerAutoPersist();
    return true;
  }

  createTeam(orgId: string, name: string, description: string): OrgTeam | null {
    const org = this.orgs.get(orgId);
    if (!org || org.teams.length >= org.config.maxTeams) return null;
    const team: OrgTeam = {
      id: `team_${crypto.randomUUID().substring(0, 8)}`,
      name,
      description,
      memberIds: [],
      permissions: [],
      createdAt: new Date().toISOString(),
    };
    org.teams.push(team);
    this.triggerAutoPersist();
    return team;
  }

  addMemberToTeam(orgId: string, teamId: string, userId: string): boolean {
    const org = this.orgs.get(orgId);
    const team = org?.teams.find((t) => t.id === teamId);
    const member = org?.members.find((m) => m.userId === userId);
    if (!team || !member || team.memberIds.includes(userId)) return false;
    team.memberIds.push(userId);
    if (!member.teams.includes(teamId)) member.teams.push(teamId);
    this.triggerAutoPersist();
    return true;
  }

  configureSSO(orgId: string, config: SSOConfig): boolean {
    const org = this.orgs.get(orgId);
    if (!org) return false;
    org.sso = config;
    this.triggerAutoPersist();
    return true;
  }

  generateSCIMConfig(
    orgId: string
  ): { endpoint: string; token: string; schema: string } | null {
    const org = this.orgs.get(orgId);
    if (!org || !org.config.scimEnabled) return null;
    return {
      endpoint: `https://api.sukit.dev/api/scim/v2/${orgId}`,
      token: `scim_${crypto.randomUUID().replace(/-/g, '').substring(0, 32)}`,
      schema: 'urn:ietf:params:scim:schemas:core:2.0:User',
    };
  }

  getSAMLMetaData(orgId: string): Record<string, any> | null {
    const org = this.orgs.get(orgId);
    if (!org?.sso || org.sso.provider !== 'saml') return null;
    return {
      entityId: org.sso.issuer,
      entryPoint: org.sso.entryPoint,
      certificate: org.sso.certificate,
      assertionUrl: `https://app.sukit.dev/api/auth/saml/${orgId}/callback`,
      logoutUrl: `https://app.sukit.dev/api/auth/saml/${orgId}/logout`,
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      attributeMapping: org.sso.mapping,
    };
  }

  getOrgStats(orgId: string): Record<string, any> {
    const org = this.orgs.get(orgId);
    if (!org) return {};
    return {
      totalMembers: org.members.length,
      totalTeams: org.teams.length,
      roleDistribution: org.members.reduce(
        (acc, m) => {
          acc[m.role] = (acc[m.role] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      ssoEnabled: !!org.sso?.enabled,
      plan: org.plan,
    };
  }

  inviteMember(
    orgId: string,
    email: string,
    role: OrgRole
  ): { inviteId: string; link: string } | null {
    const org = this.orgs.get(orgId);
    if (!org) return null;
    const inviteId = `inv_${crypto.randomUUID().substring(0, 8)}`;
    return {
      inviteId,
      link: `https://app.sukit.dev/invite/${inviteId}?org=${orgId}&email=${encodeURIComponent(email)}&role=${role}`,
    };
  }

  // ─── JIT Provisioning ────────────────────────────────────────

  jitProvision(
    orgId: string,
    ssoEmail: string,
    ssoAttributes: Record<string, string>,
    defaultRole: OrgRole = 'member'
  ): { created: boolean; member: OrgMember } | null {
    const org = this.orgs.get(orgId);
    if (!org) return null;
    const existing = org.members.find(m => m.email === ssoEmail);
    if (existing) return { created: false, member: existing };
    const member: OrgMember = {
      userId: `user_${crypto.randomUUID().substring(0, 8)}`,
      email: ssoEmail,
      name: ssoAttributes.displayName || ssoAttributes.name || ssoEmail.split('@')[0],
      role: defaultRole,
      teams: ssoAttributes.groups ? ssoAttributes.groups.split(',').filter((g: string) => org.teams.some(t => t.name === g.trim())) : [],
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      mfaEnabled: false,
    };
    org.members.push(member);
    this.userOrgs.set(member.userId, [...(this.userOrgs.get(member.userId) || []), orgId]);
    this.addAuditEntry(orgId, 'jit_provision', `User ${ssoEmail} auto-provisioned via SSO`, 'system');
    this.triggerAutoPersist();
    return { created: true, member };
  }

  // ─── Cross-Org Analytics ─────────────────────────────────────

  getCrossOrgAnalytics(): {
    totalOrgs: number;
    totalMembers: number;
    totalTeams: number;
    avgMembersPerOrg: number;
    avgTeamsPerOrg: number;
    planDistribution: Record<string, number>;
    growthRate: number;
    activeOrgs30d: number;
  } {
    const orgs = Array.from(this.orgs.values());
    const totalMembers = orgs.reduce((s, o) => s + o.members.length, 0);
    const totalTeams = orgs.reduce((s, o) => s + o.teams.length, 0);
    const planDist: Record<string, number> = {};
    for (const o of orgs) planDist[o.plan] = (planDist[o.plan] || 0) + 1;
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const activeOrgs = orgs.filter(o => o.members.some(m => new Date(m.lastActive).getTime() > thirtyDaysAgo)).length;
    return {
      totalOrgs: orgs.length,
      totalMembers,
      totalTeams,
      avgMembersPerOrg: orgs.length > 0 ? Math.round(totalMembers / orgs.length) : 0,
      avgTeamsPerOrg: orgs.length > 0 ? Math.round(totalTeams / orgs.length) : 0,
      planDistribution: planDist,
      growthRate: orgs.length > 0 ? Math.round((orgs.filter(o => new Date(o.createdAt).getTime() > thirtyDaysAgo).length / orgs.length) * 100) : 0,
      activeOrgs30d: activeOrgs,
    };
  }

  // ─── Org Audit Trail ─────────────────────────────────────────

  private auditLog: { orgId: string; action: string; details: string; userId: string; timestamp: string }[] = [];

  private addAuditEntry(orgId: string, action: string, details: string, userId: string): void {
    this.auditLog.push({ orgId, action, details, userId, timestamp: new Date().toISOString() });
    if (this.auditLog.length > 1000) this.auditLog = this.auditLog.slice(-500);
    this.kernel.events.emit('org:audit', { orgId, action, details, userId });
  }

  getAuditLog(orgId: string, limit = 50): { orgId: string; action: string; details: string; userId: string; timestamp: string }[] {
    return this.auditLog.filter(e => e.orgId === orgId).slice(-limit).reverse();
  }

  getGlobalAuditLog(limit = 100): { orgId: string; action: string; details: string; userId: string; timestamp: string }[] {
    return this.auditLog.slice(-limit).reverse();
  }

  // ─── Org Deletion with Data Export ──────────────────────────

  deleteOrgWithExport(orgId: string): { deleted: boolean; exportData: Record<string, any> } {
    const org = this.orgs.get(orgId);
    if (!org) return { deleted: false, exportData: {} };
    const exportData = {
      org: { ...org },
      exportDate: new Date().toISOString(),
      format: 'sukit-org-export-v1',
    };
    for (const m of org.members) {
      const userOrgs = this.userOrgs.get(m.userId) || [];
      this.userOrgs.set(m.userId, userOrgs.filter(id => id !== orgId));
    }
    this.orgs.delete(orgId);
    this.addAuditEntry(orgId, 'org_deleted', `Organization ${org.name} deleted with data export`, 'system');
    this.triggerAutoPersist();
    return { deleted: true, exportData };
  }

  // ─── Custom Role Definitions ─────────────────────────────────

  private customRoles: Map<string, { name: string; permissions: string[]; editable: boolean }[]> = new Map();

  defineCustomRole(orgId: string, name: string, permissions: string[]): boolean {
    const roles = this.customRoles.get(orgId) || [];
    if (roles.some(r => r.name === name)) return false;
    roles.push({ name, permissions, editable: true });
    this.customRoles.set(orgId, roles);
    this.addAuditEntry(orgId, 'role_defined', `Custom role '${name}' created with ${permissions.length} permissions`, 'system');
    this.triggerAutoPersist();
    return true;
  }

  getCustomRoles(orgId: string): { name: string; permissions: string[]; editable: boolean }[] {
    return this.customRoles.get(orgId) || [];
  }

  deleteCustomRole(orgId: string, name: string): boolean {
    const roles = this.customRoles.get(orgId);
    if (!roles) return false;
    const idx = roles.findIndex(r => r.name === name);
    if (idx < 0 || !roles[idx].editable) return false;
    roles.splice(idx, 1);
    this.addAuditEntry(orgId, 'role_deleted', `Custom role '${name}' deleted`, 'system');
    this.triggerAutoPersist();
    return true;
  }

  // ─── Database Persistence ──────────────────────────────────────

  private persistenceAdapter: { save: (data: string) => Promise<void>; load: () => Promise<string | null> } | null = null;
  private autoPersist = false;

  setPersistenceAdapter(adapter: { save: (data: string) => Promise<void>; load: () => Promise<string | null> }, autoPersist = false): void {
    this.persistenceAdapter = adapter;
    this.autoPersist = autoPersist;
  }

  private async triggerAutoPersist(): Promise<void> {
    if (this.autoPersist && this.persistenceAdapter) {
      const data = this.serializeState();
      await this.persistenceAdapter.save(data);
    }
  }

  private serializeState(): string {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      orgs: Array.from(this.orgs.entries()),
      userOrgs: Array.from(this.userOrgs.entries()),
      customRoles: Array.from(this.customRoles.entries()),
      auditLog: this.auditLog,
    });
  }

  async persistToDisk(): Promise<boolean> {
    if (!this.persistenceAdapter) return false;
    try {
      const data = this.serializeState();
      await this.persistenceAdapter.save(data);
      return true;
    } catch {
      return false;
    }
  }

  async loadFromDisk(): Promise<boolean> {
    if (!this.persistenceAdapter) return false;
    const prevAutoPersist = this.autoPersist;
    this.autoPersist = false;
    try {
      const data = await this.persistenceAdapter.load();
      if (!data) return false;
      const parsed = JSON.parse(data);
      if (parsed.version !== 1) return false;
      this.orgs = new Map(parsed.orgs);
      this.userOrgs = new Map(parsed.userOrgs);
      this.customRoles = new Map(parsed.customRoles);
      this.auditLog = parsed.auditLog || [];
      return true;
    } catch {
      return false;
    } finally {
      this.autoPersist = prevAutoPersist;
    }
  }

  // ─── Team-Based Permission Enforcement ───────────────────────

  setTeamPermissions(orgId: string, teamId: string, permissions: string[]): boolean {
    const org = this.orgs.get(orgId);
    const team = org?.teams.find(t => t.id === teamId);
    if (!team) return false;
    team.permissions = permissions;
    this.triggerAutoPersist();
    return true;
  }

  getUserEffectivePermissions(orgId: string, userId: string): string[] {
    const org = this.orgs.get(orgId);
    if (!org) return [];
    const member = org.members.find(m => m.userId === userId);
    if (!member) return [];
    if (member.role === 'owner') return ['*'];
    const rolePermissions: Record<string, string[]> = {
      admin: ['org:manage', 'members:manage', 'teams:manage', 'billing:read', 'settings:write'],
      member: ['sites:create', 'pages:create', 'media:upload', 'modules:install'],
      viewer: ['sites:read', 'pages:read'],
    };
    const basePerms = rolePermissions[member.role] || [];
    const custom = this.customRoles.get(orgId)?.find(r => r.name === member.role);
    const allPerms = new Set([...basePerms, ...(custom?.permissions || [])]);
    for (const teamId of member.teams) {
      const team = org.teams.find(t => t.id === teamId);
      if (team) team.permissions.forEach(p => allPerms.add(p));
    }
    return Array.from(allPerms);
  }

  checkPermission(orgId: string, userId: string, requiredPermission: string): boolean {
    const perms = this.getUserEffectivePermissions(orgId, userId);
    return perms.includes('*') || perms.includes(requiredPermission);
  }
}
