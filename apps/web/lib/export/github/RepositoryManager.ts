export interface Repo {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  cloneUrl: string;
  private: boolean;
  description: string | null;
}

export interface RepoInfo {
  name: string;
  description: string | null;
  private: boolean;
  defaultBranch: string;
  htmlUrl: string;
  cloneUrl: string;
  size: number;
  updatedAt: string;
}

export class GitHubRepositoryManager {
  private apiBase = 'https://api.github.com';

  private async request(
    token: string,
    path: string,
    options?: RequestInit
  ): Promise<any> {
    const res = await fetch(`${this.apiBase}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(`GitHub API error: ${err.message}`);
    }
    return res.json();
  }

  async createRepository(
    token: string,
    name: string,
    description: string,
    isPrivate: boolean
  ): Promise<Repo> {
    const data = await this.request(token, '/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: false,
      }),
    });
    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      htmlUrl: data.html_url,
      cloneUrl: data.clone_url,
      private: data.private,
      description: data.description,
    };
  }

  async checkRepositoryExists(token: string, name: string): Promise<boolean> {
    try {
      await this.request(token, `/repos/${encodeURIComponent(name)}`);
      return true;
    } catch {
      return false;
    }
  }

  async deleteRepository(
    token: string,
    owner: string,
    name: string
  ): Promise<void> {
    await this.request(token, `/repos/${owner}/${name}`, { method: 'DELETE' });
  }

  async getRepositoryInfo(
    token: string,
    owner: string,
    name: string
  ): Promise<RepoInfo> {
    const data = await this.request(token, `/repos/${owner}/${name}`);
    return {
      name: data.name,
      description: data.description,
      private: data.private,
      defaultBranch: data.default_branch,
      htmlUrl: data.html_url,
      cloneUrl: data.clone_url,
      size: data.size,
      updatedAt: data.updated_at,
    };
  }

  async listRepositories(
    token: string,
    type: 'owner' | 'all' = 'owner'
  ): Promise<Repo[]> {
    const data = await this.request(
      token,
      `/user/repos?type=${type}&per_page=100&sort=updated`
    );
    return data.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      htmlUrl: r.html_url,
      cloneUrl: r.clone_url,
      private: r.private,
      description: r.description,
    }));
  }

  async getDefaultBranch(
    token: string,
    owner: string,
    name: string
  ): Promise<string> {
    const data = await this.request(token, `/repos/${owner}/${name}`);
    return data.default_branch;
  }
}

export const repoManager = new GitHubRepositoryManager();
