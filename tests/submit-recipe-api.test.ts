// Tests for POST /api/submit-recipe with the GitHub client mocked: no real branch or pull request is ever created.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIContext } from 'astro';

const openPr = vi.fn();
const getConfig = vi.fn();
vi.mock('../src/lib/github', () => ({
  getRepoConfig: () => getConfig(),
  openSubmissionPullRequest: (...args: unknown[]) => openPr(...args),
}));

// Imported after vi.mock so the route picks up the mocked GitHub module.
const { POST } = await import('../src/pages/api/submit-recipe');

const photo = `data:image/jpeg;base64,${Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(2000, 1)]).toString('base64')}`;

/** A payload that passes validation and the anti-spam checks. */
const body = (override: Record<string, unknown> = {}) => ({
  startedAt: Date.now() - 20_000,
  website: '',
  submitterName: 'דנה',
  submitterEmail: 'dana@example.com',
  title: 'בורקס גבינה',
  summary: 'בורקס גבינה ביתי עם בצק עלים פריך ומילוי עשיר.',
  category: 'meshulashim',
  prepMinutes: '20',
  cookMinutes: '30',
  servings: '8',
  difficulty: 'easy',
  kashrut: 'dairy',
  tags: [],
  ingredients: [{ group: 'dough', amount: '2', unit: 'cup', name: 'קמח', note: '' }],
  steps: [{ title: '', text: 'מערבבים ואופים.' }],
  chefTip: '',
  photo,
  ...override,
});

/**
 * Calls the route handler like Astro would.
 * @param payload JSON body (or a raw string to simulate invalid JSON).
 * @returns Response status and parsed JSON.
 */
async function post(payload: unknown) {
  const request = new Request('http://localhost/api/submit-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });
  const res = await POST({ request } as unknown as APIContext);
  return { status: res.status, json: await res.json() };
}

beforeEach(() => {
  openPr.mockReset().mockResolvedValue('https://github.com/o/r/pull/1');
  getConfig.mockReset().mockReturnValue({ token: 't', repo: 'o/r', baseBranch: 'main' });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/submit-recipe', () => {
  it('opens a draft pull request with the recipe file and the photo', async () => {
    const { status, json } = await post(body());
    expect(status).toBe(200);
    expect(json).toEqual({ ok: true });

    expect(openPr).toHaveBeenCalledOnce();
    const [, opts] = openPr.mock.calls[0];
    expect(opts.branch).toMatch(/^submission\/submission-[a-z0-9]+$/);
    expect(opts.title).toBe('Recipe submission: בורקס גבינה');
    expect(opts.files).toHaveLength(2);
    const slug = opts.branch.replace('submission/', '');
    expect(opts.files[0].path).toBe(`src/content/recipes/${slug}.mdoc`);
    expect(opts.files[0].content).toContain('draft: true');
    expect(opts.files[1].path).toBe(`src/assets/images/recipes/${slug}/cover.jpg`);
    expect(Buffer.isBuffer(opts.files[1].content)).toBe(true);
    // Sender details go to the PR description only, never into the recipe file.
    expect(opts.body).toContain('דנה - dana@example.com');
    expect(opts.files[0].content).not.toContain('dana@example.com');
  });

  it('answers 400 with Hebrew messages for invalid input and does not call GitHub', async () => {
    const { status, json } = await post(body({ title: '', ingredients: [] }));
    expect(status).toBe(400);
    expect(json.errors).toEqual(expect.arrayContaining(['יש להזין שם למתכון.', 'יש להוסיף לפחות מצרך אחד.']));
    expect(openPr).not.toHaveBeenCalled();
  });

  it('answers 400 for a body that is not JSON', async () => {
    const { status } = await post('not json');
    expect(status).toBe(400);
    expect(openPr).not.toHaveBeenCalled();
  });

  it('silently accepts bot submissions (filled honeypot) without creating anything', async () => {
    const { status, json } = await post(body({ website: 'http://spam.example' }));
    expect(status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(openPr).not.toHaveBeenCalled();
  });

  it('silently accepts submissions sent faster than a human could fill the form', async () => {
    const { status } = await post(body({ startedAt: Date.now() - 500 }));
    expect(status).toBe(200);
    expect(openPr).not.toHaveBeenCalled();
  });

  it('answers 503 when the GitHub token or repo is not configured', async () => {
    getConfig.mockReturnValue(null);
    const { status, json } = await post(body());
    expect(status).toBe(503);
    expect(json.errors).toHaveLength(1);
    expect(openPr).not.toHaveBeenCalled();
  });

  it('answers 502 when GitHub fails, without leaking the error details', async () => {
    openPr.mockRejectedValue(new Error('GitHub 401: Bad credentials'));
    const { status, json } = await post(body());
    expect(status).toBe(502);
    expect(JSON.stringify(json)).not.toContain('Bad credentials');
  });
});
