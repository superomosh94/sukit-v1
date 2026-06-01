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
    return true;
  }

  updateMemberRole(orgId: string, userId: string, role: OrgRole): boolean {
    const org = this.orgs.get(orgId);
    if (!org) return false;
    const member = org.members.find((m) => m.userId === userId);
    if (!member) return false;
    member.role = role;
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
    return team;
  }

  addMemberToTeam(orgId: string, teamId: string, userId: string): boolean {
    const org = this.orgs.get(orgId);
    const team = org?.teams.find((t) => t.id === teamId);
    const member = org?.members.find((m) => m.userId === userId);
    if (!team || !member || team.memberIds.includes(userId)) return false;
    team.memberIds.push(userId);
    if (!member.teams.includes(teamId)) member.teams.push(teamId);
    return true;
  }

  configureSSO(orgId: string, config: SSOConfig): boolean {
    const org = this.orgs.get(orgId);
    if (!org) return false;
    org.sso = config;
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
}
