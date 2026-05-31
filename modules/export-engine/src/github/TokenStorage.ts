import { prisma } from '../db.js';

export class GitHubTokenStorage {
  async storeToken(userId: string, token: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new Error('User not found');

    const site = await prisma.site.findFirst({ where: { userId } });
    if (!site) throw new Error('No site found for user');

    const settings = (site.settings as Record<string, unknown>) || {};
    await prisma.site.update({
      where: { id: site.id },
      data: { settings: { ...settings, githubToken: token } as any },
    });
  }

  async getToken(userId: string): Promise<string | null> {
    const site = await prisma.site.findFirst({
      where: { userId },
      select: { settings: true },
    });
    if (!site) return null;
    const settings = site.settings as Record<string, unknown>;
    return (settings.githubToken as string) || null;
  }

  async deleteToken(userId: string): Promise<void> {
    const site = await prisma.site.findFirst({ where: { userId } });
    if (!site) return;
    const settings = (site.settings as Record<string, unknown>) || {};
    const { githubToken: _, ...rest } = settings;
    await prisma.site.update({
      where: { id: site.id },
      data: { settings: rest as any },
    });
  }

  async refreshIfNeeded(userId: string): Promise<string> {
    const token = await this.getToken(userId);
    if (!token) throw new Error('No GitHub token found');
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return token;
      throw new Error('Token expired');
    } catch {
      await this.deleteToken(userId);
      throw new Error('GitHub token expired. Please reconnect.');
    }
  }

  async getGitHubUser(userId: string): Promise<string | null> {
    const site = await prisma.site.findFirst({
      where: { userId },
      select: { settings: true },
    });
    if (!site) return null;
    const settings = site.settings as Record<string, unknown>;
    return (settings.githubUser as string) || null;
  }
}

export const tokenStorage = new GitHubTokenStorage();
