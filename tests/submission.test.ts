// Unit tests for the recipe submission logic: validation and conversion to a Keystatic .mdoc file.
import { describe, it, expect } from 'vitest';
import { validateSubmission, buildRecipeFile, makeSlug, MAX_PHOTO_BYTES } from '../src/lib/submission';

/**
 * Builds a fake JPEG data URL: the right magic bytes (FF D8 FF) and enough padding to pass the size check.
 * @param bytes Total size of the decoded image.
 * @param magic Leading bytes, overridable to simulate a non-JPEG file.
 */
function fakePhoto(bytes = 2000, magic = [0xff, 0xd8, 0xff]) {
  const buf = Buffer.concat([Buffer.from(magic), Buffer.alloc(bytes - magic.length, 1)]);
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

/** A payload that passes validation; tests override single fields to break it. */
const valid = () => ({
  title: 'בורקס גבינה',
  summary: 'בורקס גבינה ביתי עם בצק עלים פריך ומילוי עשיר.',
  category: 'meshulashim',
  prepMinutes: '20',
  cookMinutes: '30',
  servings: '8',
  difficulty: 'easy',
  kashrut: 'dairy',
  tags: ['quick'],
  ingredients: [{ group: 'dough', amount: '2', unit: 'cup', name: 'קמח', note: '' }],
  steps: [{ title: 'מערבבים', text: 'מערבבים את כל החומרים בקערה.' }],
  chefTip: '',
  photo: fakePhoto(),
});

/**
 * Validates a payload and returns the Hebrew error messages (empty array when valid).
 * @param body Payload to validate.
 */
const errorsOf = (body: unknown) => {
  const r = validateSubmission(body);
  return r.ok ? [] : r.errors;
};

describe('validateSubmission', () => {
  it('accepts a complete payload and converts numbers', () => {
    const r = validateSubmission(valid());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.prepMinutes).toBe(20);
      expect(r.data.servings).toBe(8);
      expect(r.data.photo.length).toBe(2000);
    }
  });

  it('reports every missing required field for an empty body', () => {
    // title, summary, category, 3 numbers, difficulty, kashrut, ingredients, steps, photo
    expect(errorsOf({})).toHaveLength(11);
    expect(errorsOf(null)).toHaveLength(11);
  });

  it.each([
    ['title too short', { title: 'א' }],
    ['summary under 20 characters', { summary: 'קצר מדי' }],
    ['category with Hebrew or capitals', { category: 'Bad Category' }],
    ['negative prep time', { prepMinutes: '-1' }],
    ['cook time over 600', { cookMinutes: '601' }],
    ['servings zero', { servings: '0' }],
    ['servings not an integer', { servings: '2.5' }],
    ['unknown difficulty', { difficulty: 'extreme' }],
    ['unknown kashrut', { kashrut: 'vegan' }],
  ])('rejects %s', (_name, override) => {
    expect(errorsOf({ ...valid(), ...override }).length).toBeGreaterThan(0);
  });

  it('requires at least one ingredient with a name', () => {
    expect(errorsOf({ ...valid(), ingredients: [] })).toContain('יש להוסיף לפחות מצרך אחד.');
    expect(errorsOf({ ...valid(), ingredients: [{ name: '   ' }] })).toContain('יש להוסיף לפחות מצרך אחד.');
  });

  it('requires at least one step with text', () => {
    expect(errorsOf({ ...valid(), steps: [{ title: 'רק כותרת', text: '' }] })).toContain('יש להוסיף לפחות שלב הכנה אחד.');
  });

  it('ignores empty rows but keeps filled ones', () => {
    const r = validateSubmission({
      ...valid(),
      ingredients: [{ name: '' }, { name: 'מלח', amount: '1', unit: 'pinch', group: 'dough' }, { name: '' }],
      steps: [{ text: '' }, { text: 'אופים.' }],
    });
    expect(r.ok && r.data.ingredients.map((i) => i.name)).toEqual(['מלח']);
    expect(r.ok && r.data.steps).toHaveLength(1);
  });

  it('falls back to safe defaults for unknown group and unit, and drops unknown tags', () => {
    const r = validateSubmission({
      ...valid(),
      tags: ['quick', 'bogus', 'quick'],
      ingredients: [{ name: 'סוכר', group: 'nonsense', unit: 'barrel' }],
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.tags).toEqual(['quick']);
      expect(r.data.ingredients[0]).toMatchObject({ group: 'other', unit: 'none' });
    }
  });

  describe('photo', () => {
    it('is required', () => {
      expect(errorsOf({ ...valid(), photo: undefined })).toContain('יש להעלות תמונה של המנה.');
    });
    it('must be a JPEG data URL', () => {
      expect(errorsOf({ ...valid(), photo: 'data:image/png;base64,AAAA' })).toContain('יש להעלות תמונה של המנה.');
    });
    it('must start with the JPEG magic bytes', () => {
      expect(errorsOf({ ...valid(), photo: fakePhoto(2000, [0x89, 0x50, 0x4e]) })).toContain('יש להעלות תמונה של המנה.');
    });
    it('is rejected when larger than the limit', () => {
      expect(errorsOf({ ...valid(), photo: fakePhoto(MAX_PHOTO_BYTES + 10) })).toContain('התמונה גדולה מדי.');
    });
  });

  it('cuts overly long text instead of passing it on', () => {
    const r = validateSubmission({ ...valid(), title: 'א'.repeat(500), submitterName: 'ב'.repeat(500) });
    expect(r.ok && r.data.title.length).toBe(80);
    expect(r.ok && r.data.submitterName.length).toBe(80);
  });
});

describe('buildRecipeFile', () => {
  /**
   * Validates the sample payload (with overrides) and renders its recipe file.
   * @param override Fields to change in the payload.
   */
  const render = (override: Record<string, unknown> = {}) => {
    const r = validateSubmission({ ...valid(), ...override });
    if (!r.ok) throw new Error(r.errors.join(', '));
    return buildRecipeFile(r.data, 'submission-abc123', '2026-10-14');
  };

  it('writes frontmatter matching the recipes schema, always as a draft', () => {
    const file = render();
    expect(file).toMatch(/^---\ntitle: "בורקס גבינה"\n/);
    expect(file).toContain('cover: "../../assets/images/recipes/submission-abc123/cover.jpg"');
    expect(file).toContain('category: "meshulashim"');
    expect(file).toContain('prepMinutes: 20');
    expect(file).toContain('difficulty: "easy"');
    expect(file).toContain('tags: ["quick"]');
    expect(file).toContain('publishedAt: "2026-10-14"');
    expect(file).toContain('draft: true');
    expect(file).toContain('ingredients: [{"group":"dough","amount":"2","unit":"cup","name":"קמח","note":""}]');
  });

  it('writes steps as a numbered Markdoc list with bold titles', () => {
    const file = render({
      steps: [
        { title: 'מערבבים.', text: 'ראשון' },
        { title: '', text: 'שני' },
      ],
    });
    // A trailing dot in the title is not doubled.
    expect(file).toContain('\n1. **מערבבים.** ראשון\n2. שני\n');
  });

  it('strips Markdoc tags and variables so visitors cannot inject them', () => {
    const file = render({ steps: [{ title: '{% x %}', text: 'לפני {% tip title="x" %} אחרי {$secret} %}' }] });
    expect(file).not.toContain('{%');
    expect(file).not.toContain('%}');
    expect(file).not.toContain('{$');
  });

  it('keeps each step on one line even when the text has line breaks', () => {
    const file = render({ steps: [{ text: 'שורה אחת\nשורה שתיים\n\nשלוש' }] });
    expect(file).toContain('1. שורה אחת שורה שתיים שלוש');
  });

  it('escapes quotes in titles so the YAML stays valid', () => {
    const file = render({ title: 'בורקס "מיוחד"' });
    expect(file).toContain('title: "בורקס \\"מיוחד\\""');
  });
});

describe('makeSlug', () => {
  it('returns a Latin slug that passes the Keystatic slug rule', () => {
    expect(makeSlug()).toMatch(/^submission-[a-z0-9]{1,6}$/);
  });
  it('is not the same twice in a row', () => {
    expect(makeSlug()).not.toBe(makeSlug());
  });
});
