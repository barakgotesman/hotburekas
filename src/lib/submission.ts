// Visitor recipe submissions: payload validation and conversion to a Keystatic recipe file.
// Server-side only (used by src/pages/api/submit-recipe.ts). The generated file must match the
// schema in src/keystatic/recipes.ts, otherwise the admin and the reader would choke on it.
import { difficultyOptions, kashrutOptions, unitOptions, groupOptions, tagOptions } from './labels';

export interface SubmittedIngredient {
  group: string;
  amount: string;
  unit: string;
  name: string;
  note: string;
}

export interface SubmittedStep {
  title: string;
  text: string;
}

export interface Submission {
  submitterName: string;
  submitterEmail: string;
  title: string;
  summary: string;
  /** Category slug, e.g. "meshulashim". */
  category: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  difficulty: string;
  kashrut: string;
  tags: string[];
  ingredients: SubmittedIngredient[];
  chefTip: string;
  steps: SubmittedStep[];
  /** Raw JPEG bytes of the cover photo, already decoded from base64. */
  photo: Buffer;
}

/** Max size of the decoded photo. Vercel functions accept ~4.5MB bodies, base64 adds ~33%. */
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

const values = (o: readonly { value: string }[]) => o.map((x) => x.value);

/** Result of validating a payload: either clean data or Hebrew error messages for the visitor. */
export type ValidationResult = { ok: true; data: Submission } | { ok: false; errors: string[] };

/**
 * Trims a value and strips control characters.
 * @param v Any value from the request body.
 * @param max Maximum length; longer text is cut.
 * @returns A clean single string ('' for non-strings).
 */
function clean(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

/**
 * Makes text safe to embed in a Markdoc body: removes `{%` / `%}` / `{$` so a visitor cannot
 * inject Markdoc tags or variables, and flattens line breaks so a step stays one list item.
 * @param s Text from the form.
 */
function markdocSafe(s: string): string {
  return s.replace(/\{%|%\}|\{\$/g, '').replace(/\s*\n\s*/g, ' ');
}

/**
 * Parses an integer field within a range.
 * @param v Value from the request body.
 * @param min Smallest allowed value.
 * @param max Largest allowed value.
 * @returns The integer, or null when missing or out of range.
 */
function toInt(v: unknown, min: number, max: number): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

/**
 * Validates an untrusted request body against the recipe schema limits.
 * @param body Parsed JSON from the form.
 * @returns Clean data on success, otherwise a list of Hebrew messages.
 */
export function validateSubmission(body: unknown): ValidationResult {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const errors: string[] = [];

  const title = clean(b.title, 80);
  if (title.length < 2) errors.push('יש להזין שם למתכון.');

  const summary = clean(b.summary, 300);
  if (summary.length < 20) errors.push('התיאור הקצר צריך להכיל לפחות 20 תווים.');

  const category = clean(b.category, 60);
  // Category slugs are validated by shape only: the reviewer sees the real relationship in the pull request.
  if (!/^[a-z0-9-]+$/.test(category)) errors.push('יש לבחור קטגוריה.');

  const prepMinutes = toInt(b.prepMinutes, 0, 600);
  const cookMinutes = toInt(b.cookMinutes, 0, 600);
  const servings = toInt(b.servings, 1, 100);
  if (prepMinutes === null) errors.push('זמן ההכנה חייב להיות בין 0 ל-600 דקות.');
  if (cookMinutes === null) errors.push('זמן הבישול חייב להיות בין 0 ל-600 דקות.');
  if (servings === null) errors.push('מספר המנות חייב להיות בין 1 ל-100.');

  const difficulty = clean(b.difficulty, 20);
  if (!values(difficultyOptions).includes(difficulty)) errors.push('יש לבחור רמת קושי.');
  const kashrut = clean(b.kashrut, 20);
  if (!values(kashrutOptions).includes(kashrut)) errors.push('יש לבחור כשרות.');

  const tags = Array.isArray(b.tags)
    ? [...new Set(b.tags.map((t) => clean(t, 20)).filter((t) => values(tagOptions).includes(t)))]
    : [];

  const ingredients: SubmittedIngredient[] = [];
  if (Array.isArray(b.ingredients)) {
    for (const raw of b.ingredients.slice(0, 40)) {
      const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      const name = clean(r.name, 80);
      if (!name) continue; // empty rows are ignored
      const group = clean(r.group, 20);
      const unit = clean(r.unit, 20);
      ingredients.push({
        group: values(groupOptions).includes(group) ? group : 'other',
        amount: clean(r.amount, 20),
        unit: values(unitOptions).includes(unit) ? unit : 'none',
        name,
        note: clean(r.note, 80),
      });
    }
  }
  if (ingredients.length === 0) errors.push('יש להוסיף לפחות מצרך אחד.');

  const steps: SubmittedStep[] = [];
  if (Array.isArray(b.steps)) {
    for (const raw of b.steps.slice(0, 30)) {
      const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      const text = clean(r.text, 800);
      if (!text) continue;
      steps.push({ title: clean(r.title, 60), text });
    }
  }
  if (steps.length === 0) errors.push('יש להוסיף לפחות שלב הכנה אחד.');

  // Photo: a base64 data URL produced by the browser (always re-encoded to JPEG there).
  let photo: Buffer = Buffer.alloc(0);
  const dataUrl = typeof b.photo === 'string' ? b.photo : '';
  const m = dataUrl.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (m) {
    photo = Buffer.from(m[1], 'base64');
    // JPEG files start with the bytes FF D8 FF.
    if (photo.length < 1000 || photo[0] !== 0xff || photo[1] !== 0xd8 || photo[2] !== 0xff) photo = Buffer.alloc(0);
  }
  if (photo.length === 0) errors.push('יש להעלות תמונה של המנה.');
  else if (photo.length > MAX_PHOTO_BYTES) errors.push('התמונה גדולה מדי.');

  if (errors.length || prepMinutes === null || cookMinutes === null || servings === null) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    data: {
      submitterName: clean(b.submitterName, 80),
      submitterEmail: clean(b.submitterEmail, 120),
      title,
      summary,
      category,
      prepMinutes,
      cookMinutes,
      servings,
      difficulty,
      kashrut,
      tags,
      ingredients,
      chefTip: clean(b.chefTip, 400),
      steps,
      photo,
    },
  };
}

/**
 * Builds a unique Latin slug. Hebrew titles can't be turned into a meaningful Latin slug automatically,
 * so submissions get a neutral one that the reviewer renames in Keystatic.
 * @returns A slug like "submission-k3f9x2".
 */
export function makeSlug(): string {
  return `submission-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Renders the .mdoc file Keystatic would write for this recipe: YAML frontmatter plus a numbered Markdoc list.
 * Strings go through JSON.stringify, which is valid YAML and matches how Keystatic writes the existing files.
 * @param s Validated submission.
 * @param slug The entry slug (also the image folder name).
 * @param today Publish date as YYYY-MM-DD.
 */
export function buildRecipeFile(s: Submission, slug: string, today: string): string {
  const q = (v: string) => JSON.stringify(v);
  const frontmatter = [
    `title: ${q(s.title)}`,
    `summary: ${q(s.summary)}`,
    // Keystatic stores a collection entry's images in a subfolder named after the slug.
    `cover: ${q(`../../assets/images/recipes/${slug}/cover.jpg`)}`,
    `coverAlt: ${q(`תמונה של ${s.title}`)}`,
    `category: ${q(s.category)}`,
    `prepMinutes: ${s.prepMinutes}`,
    `cookMinutes: ${s.cookMinutes}`,
    `servings: ${s.servings}`,
    `difficulty: ${q(s.difficulty)}`,
    `kashrut: ${q(s.kashrut)}`,
    `tags: ${JSON.stringify(s.tags)}`,
    `ingredients: ${JSON.stringify(s.ingredients)}`,
    `chefTip: ${q(s.chefTip)}`,
    `publishedAt: ${q(today)}`,
    // Always a draft: nothing a visitor sends is visible until a reviewer unticks this in Keystatic.
    'draft: true',
  ].join('\n');

  const steps = s.steps
    .map((step, i) => {
      const title = markdocSafe(step.title).replace(/[*_]/g, '');
      const text = markdocSafe(step.text);
      return `${i + 1}. ${title ? `**${title.replace(/\.$/, '')}.** ` : ''}${text}`;
    })
    .join('\n');

  return `---\n${frontmatter}\n---\n\n${steps}\n`;
}
