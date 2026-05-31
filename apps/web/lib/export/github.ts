export interface GitHubConfig {
  token: string;
  repo: string;
  owner: string;
  branch?: string;
}

interface GitHubFile {
  path: string;
  content: string;
}

interface GitHubCommitResponse {
  commit: {
    sha: string;
  };
}

export async function pushToGitHub(
  config: GitHubConfig,
  files: GitHubFile[],
  message: string = "Update from SUKIT",
): Promise<string> {
  const { token, repo, owner, branch = "main" } = config;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "User-Agent": "sukit-builder",
  };

  const latestSha = await getLatestCommitSha(config);
  const treeSha = await createTree(config, files, latestSha);
  const commitSha = await createCommit(config, message, treeSha, latestSha);
  await updateRef(config, branch, commitSha);

  return `https://github.com/${owner}/${repo}/commit/${commitSha}`;
}

async function getLatestCommitSha(config: GitHubConfig): Promise<string> {
  const { token, repo, owner, branch = "main" } = config;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await res.json();
  return data.object.sha;
}

async function createTree(
  config: GitHubConfig,
  files: GitHubFile[],
  baseTreeSha: string,
): Promise<string> {
  const { token, repo, owner } = config;
  const tree = files.map((f) => ({
    path: f.path,
    mode: "100644" as const,
    type: "blob" as const,
    content: f.content,
  }));

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base_tree: baseTreeSha, tree }),
    },
  );
  const data = await res.json();
  return data.sha;
}

async function createCommit(
  config: GitHubConfig,
  message: string,
  treeSha: string,
  parentSha: string,
): Promise<string> {
  const { token, repo, owner } = config;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        tree: treeSha,
        parents: [parentSha],
      }),
    },
  );
  const data: GitHubCommitResponse = await res.json();
  return data.commit.sha;
}

async function updateRef(
  config: GitHubConfig,
  branch: string,
  sha: string,
): Promise<void> {
  const { token, repo, owner } = config;
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sha, force: false }),
    },
  );
}

export async function createDeployHook(
  config: GitHubConfig,
): Promise<string> {
  const { token, repo, owner } = config;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/hooks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "web",
        active: true,
        events: ["push"],
        config: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`,
          content_type: "json",
        },
      }),
    },
  );
  const data = await res.json();
  return data.id.toString();
}
