// POST /api/submit-recipe: receives the visitor form and opens a draft pull request with the recipe.
// Not pre-rendered: with output 'static' this single route runs as a Vercel function.
import type { APIRoute } from 'astro';
import { validateSubmission, makeSlug, buildRecipeFile } from '../../lib/submission';
import { getRepoConfig, openSubmissionPullRequest } from '../../lib/github';

export const prerender = false;

/**
 * Builds a JSON response.
 * @param body Response payload.
 * @param status HTTP status code.
 */
const json = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/**
 * Handles a recipe submission.
 * @param context Astro API context holding the request.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ errors: ['הבקשה אינה תקינה.'] }, 400);
  }

  // Spam checks: bots fill the hidden field, and humans need a few seconds to fill the form.
  // Pretend success so bots get no signal.
  const tooFast = Date.now() - Number(body.startedAt) < 5000;
  if (body.website || tooFast) return json({ ok: true }, 200);

  const result = validateSubmission(body);
  if (!result.ok) return json({ errors: result.errors }, 400);

  const cfg = getRepoConfig();
  if (!cfg) {
    console.error('Recipe submissions are not configured: set SUBMISSIONS_GITHUB_TOKEN and SUBMISSIONS_GITHUB_REPO.');
    return json({ errors: ['שליחת מתכונים אינה זמינה כרגע. נסו שוב מאוחר יותר.'] }, 503);
  }

  const s = result.data;
  const slug = makeSlug();
  const today = new Date().toISOString().slice(0, 10);
  const submitter = [s.submitterName || 'ללא שם', s.submitterEmail].filter(Boolean).join(' - ');

  try {
    await openSubmissionPullRequest(cfg, {
      // Keystatic's branch picker only lists branches with the `branchPrefix` from keystatic.config.ts
      // (`content/`), so submissions must use that prefix to be reviewable in the admin.
      branch: `content/${slug}`,
      title: `Recipe submission: ${s.title}`,
      files: [
        { path: `src/content/recipes/${slug}.mdoc`, content: buildRecipeFile(s, slug, today) },
        { path: `src/assets/images/recipes/${slug}/cover.jpg`, content: s.photo },
      ],
      body: [
        `A visitor submitted a recipe from the website form.`,
        '',
        `- Submitted by: ${submitter}`,
        `- The recipe is a draft (\`draft: true\`), so it stays hidden after merging until you publish it.`,
        `- To review: open /keystatic, pick branch \`content/${slug}\` in the branch dropdown, fix the text, rename the slug if you like, set the author and alt text, then merge.`,
      ].join('\n'),
    });
  } catch (e) {
    console.error('Recipe submission failed:', e);
    return json({ errors: ['לא הצלחנו לשלוח את המתכון. נסו שוב בעוד כמה דקות.'] }, 502);
  }
  return json({ ok: true }, 200);
};
