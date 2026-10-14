// Minimal GitHub REST client for opening a draft pull request with a submitted recipe.
// Only the calls we need, using fetch, so no extra dependency.

interface RepoConfig {
  token: string;
  /** "owner/name" */
  repo: string;
  baseBranch: string;
}

/**
 * Reads the GitHub settings from environment variables (set in Vercel Project Settings, or .env locally).
 * @returns The config, or null when something is missing.
 */
export function getRepoConfig(): RepoConfig | null {
  // process.env covers the Vercel runtime; import.meta.env covers `astro dev` reading .env.
  const env = (k: string): string | undefined => process.env[k] ?? (import.meta.env as Record<string, string | undefined>)[k];
  const token = env('SUBMISSIONS_GITHUB_TOKEN');
  const repo = env('SUBMISSIONS_GITHUB_REPO');
  if (!token || !repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { token, repo, baseBranch: env('SUBMISSIONS_BASE_BRANCH') || 'main' };
}

/**
 * Calls the GitHub API and throws with the status and message on failure.
 * @param cfg Repository settings.
 * @param path API path starting with "/repos/...".
 * @param init Fetch options (method, body).
 * @returns The parsed JSON response.
 */
async function gh(cfg: RepoConfig, path: string, init: { method?: string; body?: unknown } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'burekas-lohet-submissions',
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`GitHub ${res.status}: ${json.message ?? 'request failed'}`), { status: res.status });
  return json;
}

export interface SubmissionFile {
  path: string;
  /** UTF-8 text or raw bytes. */
  content: string | Buffer;
}

/**
 * Creates a branch with the given files and opens a pull request for it.
 * Tries a draft PR first; private repos on the free plan reject drafts, so it falls back to a normal PR.
 * @param cfg Repository settings.
 * @param opts Branch name, files to commit, and the PR title and body.
 * @returns The pull request URL.
 */
export async function openSubmissionPullRequest(
  cfg: RepoConfig,
  opts: { branch: string; files: SubmissionFile[]; title: string; body: string },
): Promise<string> {
  const base = await gh(cfg, `/repos/${cfg.repo}/git/ref/heads/${cfg.baseBranch}`);
  await gh(cfg, `/repos/${cfg.repo}/git/refs`, { method: 'POST', body: { ref: `refs/heads/${opts.branch}`, sha: base.object.sha } });

  // Sequential on purpose: parallel commits to one branch can fail with 409 conflicts.
  for (const file of opts.files) {
    const bytes = typeof file.content === 'string' ? Buffer.from(file.content, 'utf-8') : file.content;
    await gh(cfg, `/repos/${cfg.repo}/contents/${file.path}`, {
      method: 'PUT',
      body: { message: `content: submitted recipe (${file.path.split('/').pop()})`, content: bytes.toString('base64'), branch: opts.branch },
    });
  }

  const pr = { title: opts.title, head: opts.branch, base: cfg.baseBranch, body: opts.body };
  try {
    return (await gh(cfg, `/repos/${cfg.repo}/pulls`, { method: 'POST', body: { ...pr, draft: true } })).html_url;
  } catch (e) {
    if ((e as { status?: number }).status !== 422) throw e;
    return (await gh(cfg, `/repos/${cfg.repo}/pulls`, { method: 'POST', body: pr })).html_url;
  }
}
