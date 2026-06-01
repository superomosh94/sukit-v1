import type { SukitKernel } from '@sukit/core';
import type { FileDescriptor, CommandResult } from '../../types';

import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  cloneUrl: string;
  htmlUrl: string;
  defaultBranch: string;
}
interface GitHubPR {
  number: number;
  htmlUrl: string;
  state: string;
  title: string;
}
interface GitHubBranch {
  name: string;
  sha: string;
  protected: boolean;
}

interface BranchProtectionRules {
  required_status_checks?: {
    strict: boolean;
    contexts: string[];
  } | null;
  enforce_admins?: boolean | null;
  required_pull_request_reviews?: {
    dismiss_stale_reviews?: boolean;
    require_code_owner_reviews?: boolean;
    required_approving_review_count?: number;
  } | null;
  restrictions?: {
    users: string[];
    teams: string[];
    apps?: string[];
  } | null;
}

interface CommitStatusOptions {
  state: 'pending' | 'success' | 'failure' | 'error';
  description?: string;
  context?: string;
}

interface WebhookHook {
  id: number;
  url: string;
  active: boolean;
  events: string[];
  config: {
    url?: string;
    content_type?: string;
    secret?: string;
    insecure_ssl?: string;
  };
  created_at: string;
  updated_at: string;
}

interface WebhookConfig {
  url: string;
  contentType?: string;
  secret?: string;
  insecureSsl?: string;
}

interface DeployEnvironmentOptions {
  waitTimer?: number;
  reviewers?: Array<{ type: 'User' | 'Team'; id: number }>;
  deploymentBranchPolicy?: {
    protected_branches: boolean;
    custom_branch_policies: boolean;
  };
}

interface CreateReleaseOptions {
  targetCommitish?: string;
  name?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
}

interface Release {
  id: number;
  tagName: string;
  targetCommitish: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  htmlUrl: string;
  createdAt: string;
  publishedAt: string;
}

interface PagesStatus {
  htmlUrl: string;
  status: string;
  cname: string | null;
  custom404: boolean;
  source: {
    branch: string;
    path: string;
  };
  public: boolean;
  httpsEnforced: boolean;
  url: string;
}

interface RepoSecret {
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CodeScanningAlert {
  number: number;
  rule: {
    id: string;
    severity: string;
    description: string;
  };
  tool: {
    name: string;
    version: string;
  };
  mostRecentInstance: {
    ref: string;
    location: {
      path: string;
      startLine: number;
      endLine: number;
      startColumn: number;
      endColumn: number;
    };
  };
  state: string;
  createdAt: string;
}

interface DependabotOptions {
  packageEcosystem: 'npm' | 'docker' | 'github_actions';
  interval: 'daily' | 'weekly' | 'monthly';
  day?: string;
  timezone?: string;
  openPullRequestsLimit?: number;
  labels?: string[];
  directory?: string;
  targetBranch?: string;
  allow?: Array<{ dependencyType: string }>;
  ignore?: Array<{ dependencyName: string }>;
  versioningStrategy?:
    | 'auto'
    | 'increase'
    | 'increase-if-necessary'
    | 'lockfile-only';
}

interface PRTemplateOptions {
  description?: string;
  type?: string;
  testing?: string;
  checklist?: string[];
  additionalSections?: string;
}

export class GitHubIntegration {
  private kernel: SukitKernel;
  private token: string = '';
  private apiBase = 'https://api.github.com';

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  setToken(token: string) {
    this.token = token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async getAuthUrl(redirectUri: string): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID || '';
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
  }

  async authenticate(
    code: string
  ): Promise<{ accessToken: string; user: any }> {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await res.json();
    this.token = data.access_token;
    const userRes = await this.ghFetch('/user');
    const user = await userRes.json();
    return { accessToken: data.access_token, user };
  }

  async createRepo(
    name: string,
    description: string,
    isPrivate = false
  ): Promise<GitHubRepo> {
    const res = await this.ghFetch('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true,
        license_template: 'mit',
      }),
    });
    return res.json();
  }

  async getRepo(fullName: string): Promise<GitHubRepo | null> {
    const res = await this.ghFetch(`/repos/${fullName}`);
    if (!res.ok) return null;
    return res.json();
  }

  async listRepos(): Promise<GitHubRepo[]> {
    const res = await this.ghFetch('/user/repos?per_page=100&sort=updated');
    return res.json();
  }

  async pushSite(
    siteId: string,
    repoName: string,
    branch = 'main'
  ): Promise<CommandResult> {
    const site = await this.kernel.sites.get(siteId);
    const pages = await this.kernel.pages.list(siteId);
    const owner = await this.getCurrentUser();

    let repo = await this.getRepo(`${owner}/${repoName}`);
    if (!repo)
      repo = await this.createRepo(
        repoName,
        `Site "${site.name}" generated by SUKIT`
      );

    const files = this.buildSiteFiles(site, pages);
    const ref = await this.getRef(repo.fullName, `heads/${branch}`);

    if (!ref) {
      const masterRef = await this.getRef(repo.fullName, 'heads/master');
      if (masterRef)
        await this.createBranch(repo.fullName, branch, masterRef.object.sha);
    }

    const latestSha =
      ref?.object.sha ||
      (await this.getRef(repo.fullName, 'heads/master'))?.object.sha;
    const treeItems = files.map((f) => ({
      path: f.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: f.content.toString(),
    }));
    const treeRes = await this.ghFetch(`/repos/${repo.fullName}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        tree: treeItems,
        base_tree: latestSha || undefined,
      }),
    });
    const tree = await treeRes.json();
    const commitRes = await this.ghFetch(
      `/repos/${repo.fullName}/git/commits`,
      {
        method: 'POST',
        body: JSON.stringify({
          message: `Update site "${site.name}"`,
          tree: tree.sha,
          parents: latestSha ? [latestSha] : [],
        }),
      }
    );
    const commit = await commitRes.json();
    await this.ghFetch(`/repos/${repo.fullName}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha }),
    });

    return {
      success: true,
      message: `Site pushed to ${repo.fullName}`,
      data: {
        repo: repo.fullName,
        branch,
        commit: commit.sha,
        files: files.length,
      },
    };
  }

  async createPR(
    repoFullName: string,
    title: string,
    body: string,
    head: string,
    base = 'main'
  ): Promise<GitHubPR> {
    const res = await this.ghFetch(`/repos/${repoFullName}/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, body, head, base }),
    });
    return res.json();
  }

  async listPRs(
    repoFullName: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubPR[]> {
    const res = await this.ghFetch(
      `/repos/${repoFullName}/pulls?state=${state}`
    );
    return res.json();
  }

  async listBranches(repoFullName: string): Promise<GitHubBranch[]> {
    const res = await this.ghFetch(`/repos/${repoFullName}/branches`);
    return res.json();
  }

  async createBranch(
    repoFullName: string,
    branchName: string,
    sha: string
  ): Promise<void> {
    await this.ghFetch(`/repos/${repoFullName}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha }),
    });
  }

  async getCommitHistory(
    repoFullName: string
  ): Promise<{ sha: string; message: string; author: string; date: string }[]> {
    const res = await this.ghFetch(
      `/repos/${repoFullName}/commits?per_page=20`
    );
    const commits = await res.json();
    return commits.map((c: any) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
    }));
  }

  async createIssue(
    repoFullName: string,
    title: string,
    body: string,
    labels?: string[]
  ): Promise<any> {
    const res = await this.ghFetch(`/repos/${repoFullName}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title, body, labels }),
    });
    return res.json();
  }

  async enableActions(repoFullName: string): Promise<void> {
    const workflow = Buffer.from(
      `
name: Deploy SUKIT Site
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - run: npm run export
    `
    ).toString('base64');

    await this.ghFetch(
      `/repos/${repoFullName}/contents/.github/workflows/deploy.yml`,
      {
        method: 'PUT',
        body: JSON.stringify({
          message: 'Add GitHub Actions deploy workflow',
          content: workflow,
        }),
      }
    );
  }

  async protectBranch(
    repoFullName: string,
    branch: string,
    rules: BranchProtectionRules
  ): Promise<any> {
    const res = await this.ghFetch(
      `/repos/${repoFullName}/branches/${branch}/protection`,
      {
        method: 'PUT',
        body: JSON.stringify({
          required_status_checks: rules.required_status_checks ?? null,
          enforce_admins: rules.enforce_admins ?? null,
          required_pull_request_reviews:
            rules.required_pull_request_reviews ?? null,
          restrictions: rules.restrictions ?? null,
        }),
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    return res.json();
  }

  async setCommitStatus(
    repoFullName: string,
    sha: string,
    state: CommitStatusOptions['state'],
    description?: string,
    context?: string
  ): Promise<any> {
    const res = await this.ghFetch(`/repos/${repoFullName}/statuses/${sha}`, {
      method: 'POST',
      body: JSON.stringify({
        state,
        description: description || '',
        context: context || 'default',
      }),
    });
    return res.json();
  }

  async listWebhooks(repoFullName: string): Promise<WebhookHook[]> {
    const res = await this.ghFetch(`/repos/${repoFullName}/hooks`);
    return res.json();
  }

  async createWebhook(
    repoFullName: string,
    config: WebhookConfig,
    events?: string[]
  ): Promise<WebhookHook> {
    const res = await this.ghFetch(`/repos/${repoFullName}/hooks`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: events || ['push'],
        config: {
          url: config.url,
          content_type: config.contentType || 'json',
          secret: config.secret || '',
          insecure_ssl: config.insecureSsl || '0',
        },
      }),
    });
    return res.json();
  }

  async syncWebhooks(
    repoFullName: string
  ): Promise<{ created: number; existing: number }> {
    const expectedEvents = ['push', 'pull_request', 'issues'];
    const sukitHookUrl = `${process.env.SUKIT_URL || 'https://sukit.app'}/api/webhooks/github`;

    const existing = await this.listWebhooks(repoFullName);
    const hasMatching = existing.some(
      (h) => h.config.url === sukitHookUrl && h.active
    );

    if (!hasMatching) {
      await this.createWebhook(
        repoFullName,
        { url: sukitHookUrl, contentType: 'json' },
        expectedEvents
      );
      return { created: 1, existing: existing.length };
    }

    return { created: 0, existing: existing.length };
  }

  async createEnvironment(
    repoFullName: string,
    name: string,
    options?: DeployEnvironmentOptions
  ): Promise<any> {
    const body: Record<string, any> = {};
    if (options?.waitTimer !== undefined) body.wait_timer = options.waitTimer;
    if (options?.reviewers) body.reviewers = options.reviewers;
    if (options?.deploymentBranchPolicy)
      body.deployment_branch_policy = options.deploymentBranchPolicy;

    const res = await this.ghFetch(
      `/repos/${repoFullName}/environments/${encodeURIComponent(name)}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );
    return res.json();
  }

  async createRelease(
    repoFullName: string,
    tagName: string,
    options?: CreateReleaseOptions
  ): Promise<Release> {
    const res = await this.ghFetch(`/repos/${repoFullName}/releases`, {
      method: 'POST',
      body: JSON.stringify({
        tag_name: tagName,
        target_commitish: options?.targetCommitish,
        name: options?.name,
        body: options?.body,
        draft: options?.draft ?? false,
        prerelease: options?.prerelease ?? false,
      }),
    });
    const data = await res.json();
    return this.mapRelease(data);
  }

  async listReleases(repoFullName: string): Promise<Release[]> {
    const res = await this.ghFetch(
      `/repos/${repoFullName}/releases?per_page=30`
    );
    const data = await res.json();
    return data.map(this.mapRelease);
  }

  async enableGitHubPages(
    repoFullName: string,
    branch: string,
    sourcePath: string
  ): Promise<any> {
    const res = await this.ghFetch(`/repos/${repoFullName}/pages`, {
      method: 'POST',
      body: JSON.stringify({
        source: {
          branch,
          path: sourcePath,
        },
      }),
    });
    return res.json();
  }

  async getPagesStatus(repoFullName: string): Promise<PagesStatus | null> {
    const res = await this.ghFetch(`/repos/${repoFullName}/pages`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      htmlUrl: data.html_url,
      status: data.status,
      cname: data.cname,
      custom404: data.custom_404,
      source: data.source,
      public: data.public,
      httpsEnforced: data.https_enforced,
      url: data.url,
    };
  }

  async setRepoSecret(
    repoFullName: string,
    name: string,
    value: string
  ): Promise<void> {
    const pkRes = await this.ghFetch(
      `/repos/${repoFullName}/actions/secrets/public-key`
    );
    const pk = await pkRes.json();

    const keyBytes = naclUtil.decodeBase64(pk.key);
    const secretBytes = naclUtil.decodeUTF8(value);

    const epk = nacl.box.keyPair();
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const shared = new Uint8Array(32);
    (nacl as any).lowlevel.crypto_box_beforenm(shared, keyBytes, epk.secretKey);
    const ciphertext = nacl.secretbox(secretBytes, nonce, shared);

    const result = new Uint8Array(
      epk.publicKey.length + nonce.length + ciphertext.length
    );
    result.set(epk.publicKey);
    result.set(nonce, epk.publicKey.length);
    result.set(ciphertext, epk.publicKey.length + nonce.length);

    const encryptedValue = naclUtil.encodeBase64(result);

    await this.ghFetch(
      `/repos/${repoFullName}/actions/secrets/${encodeURIComponent(name)}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          encrypted_value: encryptedValue,
          key_id: pk.key_id,
        }),
      }
    );
  }

  async listRepoSecrets(repoFullName: string): Promise<RepoSecret[]> {
    const res = await this.ghFetch(
      `/repos/${repoFullName}/actions/secrets?per_page=100`
    );
    const data = await res.json();
    return (data.secrets || []).map((s: any) => ({
      name: s.name,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
  }

  async getCodeScanningAlerts(
    repoFullName: string
  ): Promise<CodeScanningAlert[]> {
    const res = await this.ghFetch(
      `/repos/${repoFullName}/code-scanning/alerts?per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((a: any) => ({
      number: a.number,
      rule: {
        id: a.rule.id,
        severity: a.rule.severity,
        description: a.rule.description,
      },
      tool: {
        name: a.tool.name,
        version: a.tool.version,
      },
      mostRecentInstance: {
        ref: a.most_recent_instance.ref,
        location: {
          path: a.most_recent_instance.location.path,
          startLine: a.most_recent_instance.location.start_line,
          endLine: a.most_recent_instance.location.end_line,
          startColumn: a.most_recent_instance.location.start_column,
          endColumn: a.most_recent_instance.location.end_column,
        },
      },
      state: a.state,
      createdAt: a.created_at,
    }));
  }

  generateDependabotConfig(options: DependabotOptions): string {
    const lines: string[] = [];
    lines.push('version: 2');
    lines.push('updates:');
    lines.push(`  - package-ecosystem: "${options.packageEcosystem}"`);
    lines.push(`    directory: "${options.directory || '/'}"`);
    lines.push(`    schedule:`);
    lines.push(`      interval: "${options.interval}"`);
    if (options.day) lines.push(`      day: "${options.day}"`);
    if (options.timezone) lines.push(`      timezone: "${options.timezone}"`);
    if (options.openPullRequestsLimit !== undefined)
      lines.push(
        `    open-pull-requests-limit: ${options.openPullRequestsLimit}`
      );
    if (options.labels && options.labels.length > 0) {
      lines.push(`    labels:`);
      options.labels.forEach((l) => lines.push(`      - "${l}"`));
    }
    if (options.targetBranch)
      lines.push(`    target-branch: "${options.targetBranch}"`);
    if (options.versioningStrategy)
      lines.push(`    versioning-strategy: ${options.versioningStrategy}`);
    if (options.allow && options.allow.length > 0) {
      lines.push(`    allow:`);
      options.allow.forEach((a) => {
        lines.push(`      - dependency-type: "${a.dependencyType}"`);
      });
    }
    if (options.ignore && options.ignore.length > 0) {
      lines.push(`    ignore:`);
      options.ignore.forEach((i) => {
        lines.push(`      - dependency-name: "${i.dependencyName}"`);
      });
    }
    return lines.join('\n') + '\n';
  }

  async createPRTemplate(
    repoFullName: string,
    template?: Partial<PRTemplateOptions>
  ): Promise<void> {
    const opts: PRTemplateOptions = {
      description:
        template?.description ||
        'Please include a summary of the change and which issue is fixed.',
      type: template?.type || 'feat, fix, docs, refactor, test, chore',
      testing: template?.testing || 'Describe the tests you ran.',
      checklist: template?.checklist || [
        'My code follows the style guidelines of this project',
        'I have performed a self-review of my own code',
        'I have commented my code in hard-to-understand areas',
        'I have made corresponding changes to the documentation',
        'My changes generate no new warnings',
        'I have added tests that prove my fix is effective or that my feature works',
      ],
      additionalSections: template?.additionalSections,
    };

    const sections: string[] = [
      '## Description',
      '',
      `${opts.description}`,
      '',
      'Fixes #(issue)',
      '',
      '## Type of change',
      '',
      opts.type
        .split(',')
        .map((t) => `- [ ] ${t.trim()}`)
        .join('\n'),
      '',
      '## How Has This Been Tested?',
      '',
      `${opts.testing}`,
      '',
      '## Checklist:',
      '',
    ];

    if (opts.checklist) {
      opts.checklist.forEach((item) => {
        sections.push(`- [ ] ${item}`);
      });
    }

    sections.push('');

    if (opts.additionalSections) {
      sections.push('');
      sections.push(opts.additionalSections);
      sections.push('');
    }

    const content = sections.join('\n');
    const encoded = Buffer.from(content).toString('base64');

    await this.ghFetch(
      `/repos/${repoFullName}/contents/.github/PULL_REQUEST_TEMPLATE.md`,
      {
        method: 'PUT',
        body: JSON.stringify({
          message: 'Add pull request template',
          content: encoded,
        }),
      }
    );
  }

  private async getRef(
    repo: string,
    ref: string
  ): Promise<{ ref: string; object: { sha: string; type: string } } | null> {
    const res = await this.ghFetch(`/repos/${repo}/git/refs/${ref}`);
    if (!res.ok) return null;
    return res.json();
  }

  private async getCurrentUser(): Promise<string> {
    const res = await this.ghFetch('/user');
    const user = await res.json();
    return user.login;
  }

  private async ghFetch(
    path: string,
    options?: RequestInit
  ): Promise<Response> {
    return fetch(`${this.apiBase}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  private buildSiteFiles(site: any, pages: any[]): FileDescriptor[] {
    return [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: site.name,
          version: '1.0.0',
          private: true,
          scripts: { build: 'sukit build', export: 'sukit export' },
        }),
      },
      {
        path: 'sukit.config.json',
        content: JSON.stringify(
          { siteId: site.id, domain: site.domain },
          null,
          2
        ),
      },
      {
        path: 'README.md',
        content: `# ${site.name}\n\nSite generated by SUKIT.\n`,
      },
      ...pages.map((page, i) => ({
        path: `pages/${page.slug || `page-${i}`}.json`,
        content: JSON.stringify(page, null, 2),
      })),
    ];
  }

  private mapRelease(data: any): Release {
    return {
      id: data.id,
      tagName: data.tag_name,
      targetCommitish: data.target_commitish,
      name: data.name,
      body: data.body,
      draft: data.draft,
      prerelease: data.prerelease,
      htmlUrl: data.html_url,
      createdAt: data.created_at,
      publishedAt: data.published_at,
    };
  }
}
