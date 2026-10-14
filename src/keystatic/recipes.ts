import { collection, fields } from '@keystatic/core';
import { wrapper } from '@keystatic/core/content-components';
import { difficultyOptions, kashrutOptions, unitOptions, groupOptions, tagOptions } from '../lib/labels';
import { opts, latinSlug } from './shared';

/** Recipes: the main content type. Entries are .mdoc files (frontmatter + Markdoc steps). */
export const recipes = collection({
  label: 'Recipes',
  path: 'src/content/recipes/*',
  // `fields.slug` gives two editable parts: a Hebrew name and a Latin URL slug.
  // `slugField` is the key of that slug field.
  slugField: 'title',
  // The Markdoc `steps` field becomes the body of each .mdoc file.
  format: { contentField: 'steps' },
  // 'form' = one column with every field in schema order (the steps editor is the last field).
  // 'content' would split the screen into a large steps editor plus a side panel for the other fields.
  entryLayout: 'form',
  // "Preview" button on each entry: opens the public page ({slug} is replaced with the entry slug).
  previewUrl: '/recipes/{slug}/',
  // Extra columns in the admin list view (/keystatic/collection/recipes). Only simple fields work
  // (text, select, date, checkbox, integer, relationship). Click the Slug header to sort.
  columns: ['category', 'kashrut', 'difficulty', 'publishedAt', 'draft'],
  schema: {
    title: fields.slug({
      name: { label: 'Title (Hebrew)', description: 'The recipe name as visitors see it.', validation: { isRequired: true } },
      slug: {
        label: 'URL slug (Latin letters only, e.g. burekas-gvina)',
        description: 'Becomes the page address: /recipes/<slug>/. Do not change it after publishing, links would break.',
        validation: latinSlug,
      },
    }),
    summary: fields.text({
      label: 'Summary',
      description: '1-2 sentences, shown on cards and in Google results (20-300 characters).',
      multiline: true,
      validation: { isRequired: true, length: { min: 20, max: 300 } },
    }),
    cover: fields.image({
      label: 'Cover image',
      description: 'Landscape photo, at least 1200px wide. It is resized and converted to AVIF/WebP automatically.',
      // Stored under src/ so Astro can optimize it (AVIF/WebP, responsive sizes).
      directory: 'src/assets/images/recipes',
      publicPath: '../../assets/images/recipes/',
      validation: { isRequired: true },
    }),
    coverAlt: fields.text({
      label: 'Cover alt text (Hebrew)',
      description: 'Describe the photo for screen readers, e.g. "בורקס גבינה פתוח עם גבינה נמתחת".',
      validation: { isRequired: true, length: { min: 5, max: 160 } },
    }),
    category: fields.relationship({
      label: 'Category',
      description: 'Pick one. Manage categories in the Categories section.',
      collection: 'categories',
      validation: { isRequired: true },
    }),
    author: fields.relationship({ label: 'Author', description: 'Optional byline.', collection: 'authors' }),
    prepMinutes: fields.integer({ label: 'Prep minutes', description: 'Hands-on work time.', defaultValue: 20, validation: { isRequired: true, min: 0, max: 600 } }),
    cookMinutes: fields.integer({ label: 'Cook / bake minutes', description: 'Oven or stove time.', defaultValue: 30, validation: { isRequired: true, min: 0, max: 600 } }),
    servings: fields.integer({
      label: 'Servings (units)',
      description: 'How many pieces the recipe makes. The servings stepper scales ingredients from this number.',
      defaultValue: 10,
      validation: { isRequired: true, min: 1, max: 100 },
    }),
    difficulty: fields.select({
      label: 'Difficulty (heat meter)',
      description: 'Shown as 1 to 3 flame icons: easy = קל (1), medium = בינוני (2), hard = קשה (3).',
      options: opts(difficultyOptions),
      defaultValue: 'easy',
    }),
    kashrut: fields.select({ label: 'Kashrut', description: 'Dairy, meat or pareve badge.', options: opts(kashrutOptions), defaultValue: 'dairy' }),
    tags: fields.multiselect({ label: 'Tags', description: 'Pick up to 4 (not enforced). Each tag has its own page.', options: opts(tagOptions) }),
    ingredients: fields.array(
      fields.object({
        group: fields.select({ label: 'Group', description: 'Ingredients are shown grouped (dough, filling...).', options: opts(groupOptions), defaultValue: 'filling' }),
        // Text (not number) so values like "½" or "1.5" are possible. The servings scaler parses it.
        amount: fields.text({ label: 'Amount', description: 'A number, "½", "1.5" or "1 1/2". Leave empty for "to taste".' }),
        unit: fields.select({ label: 'Unit', options: opts(unitOptions), defaultValue: 'none' }),
        name: fields.text({ label: 'Ingredient', validation: { isRequired: true } }),
        note: fields.text({ label: 'Note', description: 'Shown in brackets, e.g. "מופשרים לילה במקרר".' }),
      }),
      { label: 'Ingredients', itemLabel: (props) => props.fields.name.value || 'Ingredient' },
    ),
    chefTip: fields.text({
      label: 'Chef tip (optional)',
      description: 'Shown on the home page when this is the recipe of the week, and at the end of the steps.',
      multiline: true,
    }),
    publishedAt: fields.date({ label: 'Published', description: 'Newest recipes appear first.', validation: { isRequired: true } }),
    draft: fields.checkbox({ label: 'Draft (hidden on the public site)', description: 'Tick to hide the recipe everywhere until it is ready.', defaultValue: false }),
    steps: fields.markdoc({
      label: 'Steps',
      description: 'Write a numbered list. Start each step with a bold title: "1. **Preheat.** Heat the oven...". Use the + menu to add a Chef tip block.',
      // Custom Markdoc block: {% tip title="..." %}...{% /tip %}, rendered as the napkin card.
      // The matching render config lives in src/lib/markdoc.ts.
      components: {
        tip: wrapper({
          label: 'Chef tip',
          schema: { title: fields.text({ label: 'Title', defaultValue: 'טיפ מהשף' }) },
        }),
      },
    }),
  },
});
