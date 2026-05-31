import { readJson, writeJson, pathExists, ensureDir } from 'fs-extra';
import { join } from 'path';
import { randomBytes } from 'crypto';

export interface Team {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  owner: string;
  createdAt: string;
  updatedAt: string;
  settings: { allowPublicAccess: boolean; require2FA: boolean; defaultRole: string };
}

export interface TeamMember {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  invitedBy: string;
}

export class TeamManager {
  private projectPath: string;
  private teamDir: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.teamDir = join(projectPath, '.sukit', 'team');
  }

  private get teamFile(): string { return join(this.teamDir, 'team.json'); }
  private get membersFile(): string { return join(this.teamDir, 'members.json'); }

  async initTeam(teamData: { teamName: string; teamSlug: string; plan: string }): Promise<Team> {
    await ensureDir(this.teamDir);

    const { v4: uuidv4 } = await import('uuid');
    const team: Team = {
      id: uuidv4(),
      name: teamData.teamName,
      slug: teamData.teamSlug,
      plan: teamData.plan === 'Free' ? 'free' : teamData.plan === 'Pro ($29/month)' ? 'pro' : 'enterprise',
      owner: await this.getCurrentUser(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: { allowPublicAccess: false, require2FA: false, defaultRole: 'member' },
    };

    await writeJson(this.teamFile, team, { spaces: 2 });

    const member: TeamMember = {
      id: uuidv4(),
      email: team.owner,
      role: 'admin',
      joinedAt: new Date().toISOString(),
      invitedBy: team.owner,
    };
    await writeJson(this.membersFile, [member], { spaces: 2 });

    return team;
  }

  async getCurrentTeam(): Promise<Team> {
    if (!await pathExists(this.teamFile)) {
      throw new Error('No team initialized. Run: sukit team init');
    }
    return readJson(this.teamFile);
  }

  async addMember(email: string, role: TeamMember['role'] = 'member'): Promise<TeamMember> {
    if (!await pathExists(this.membersFile)) throw new Error('Team not initialized');

    const members: TeamMember[] = await readJson(this.membersFile);
    if (members.find(m => m.email === email)) {
      throw new Error(`User ${email} is already a team member`);
    }

    const { v4: uuidv4 } = await import('uuid');
    const newMember: TeamMember = {
      id: uuidv4(),
      email,
      role,
      joinedAt: new Date().toISOString(),
      invitedBy: await this.getCurrentUser(),
    };

    members.push(newMember);
    await writeJson(this.membersFile, members, { spaces: 2 });
    return newMember;
  }

  async removeMember(userId: string): Promise<boolean> {
    const members: TeamMember[] = await readJson(this.membersFile);
    const team = await this.getCurrentTeam();

    const member = members.find(m => m.id === userId);
    if (!member) throw new Error('User not found');
    if (member.email === team.owner) throw new Error('Cannot remove team owner');

    await writeJson(this.membersFile, members.filter(m => m.id !== userId), { spaces: 2 });
    return true;
  }

  async listMembers(): Promise<TeamMember[]> {
    if (!await pathExists(this.membersFile)) return [];
    return readJson(this.membersFile);
  }

  async generateInvite(userId: string): Promise<string> {
    await ensureDir(this.teamDir);
    const invitesFile = join(this.teamDir, 'invites.json');

    let invites: any[] = [];
    if (await pathExists(invitesFile)) {
      invites = await readJson(invitesFile);
    }

    const token = randomBytes(32).toString('hex');
    invites.push({
      userId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    await writeJson(invitesFile, invites, { spaces: 2 });
    return `https://sukit.dev/join/${token}`;
  }

  async getCurrentUser(): Promise<string> {
    try {
      const { execSync } = await import('child_process');
      const email = execSync('git config user.email', { stdio: 'pipe' }).toString().trim();
      return email || 'unknown@user.com';
    } catch {
      return 'unknown@user.com';
    }
  }
}
