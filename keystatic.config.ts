import { config, collection, singleton, fields } from '@keystatic/core';
import { wrapper } from '@keystatic/core/content-components';
import { difficultyOptions, kashrutOptions, unitOptions, groupOptions, tagOptions, categoryIconOptions } from './src/lib/labels';
import { AdminLogoMark } from './src/lib/admin-logo';

// Copies the readonly tuples from labels.ts into the mutable arrays Keystatic's select fields expect.
const opts = (o: readonly { value: string; label: string }[]) => o.map((x) => ({ ...x }));

// Hebrew titles would make ugly percent-encoded URLs, so every slug must be Latin.
const latinSlug = { pattern: { regex: /^[a-z0-9-]+$/, message: 'Latin lowercase letters, digits and dashes only' } };

export default config({
  // Dev: edits are written straight to disk. Production: every save is a commit to GitHub.
  storage: import.meta.env.PROD
    ? {
        kind: 'github',
        repo: { owner: 'YOUR_GITHUB_USER', name: 'burekas-lohet' },
        // Editors work on `content/...` branches; Vercel builds a preview per branch and `main` stays protected.
        branchPrefix: 'content/',
      }
    : { kind: 'local' },

  ui: {
    brand: { name: 'בורקס לוהט', mark: AdminLogoMark },
    // Sidebar groups. Keys are collection/singleton names; sections become headings.
    navigation: {
      Content: ['recipes', 'categories', 'authors'],
      Settings: ['settings'],
    },
  },

  collections: {
    recipes: collection({
      label: 'Recipes',
      path: 'src/content/recipes/*',
      // `fields.slug` gives two editable parts: a Hebrew name and a Latin URL slug.
      // `slugField` is the key of that slug field.
      slugField: 'title',
      // The Markdoc `steps` field becomes the body of each .mdoc file.
      format: { contentField: 'steps' },
      entryLayout: 'content',
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
        servings: fields.integer({ label: 'Servings (units)', description: 'How many pieces the recipe makes. The servings stepper scales ingredients from this number.', defaultValue: 10, validation: { isRequired: true, min: 1, max: 100 } }),
        difficulty: fields.select({
          label: 'Difficulty (heat meter)',
          description: 'easy = פושר (1 flame), medium = חם (2), hard = לוהט (3).',
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
          components: {
            tip: wrapper({
              label: 'Chef tip',
              schema: { title: fields.text({ label: 'Title', defaultValue: 'טיפ סודי מהשף' }) },
            }),
          },
        }),
      },
    }),

    categories: collection({
      label: 'Categories',
      path: 'src/content/categories/*',
      slugField: 'name',
      columns: ['icon'],
      schema: {
        name: fields.slug({
          name: { label: 'Name (Hebrew)', validation: { isRequired: true } },
          slug: { label: 'URL slug (Latin)', description: 'Becomes /categories/<slug>/.', validation: latinSlug },
        }),
        icon: fields.select({ label: 'Icon', description: 'Shown on category cards and chips.', options: opts(categoryIconOptions), defaultValue: 'cat-triangle' }),
        description: fields.text({ label: 'Description', description: 'One sentence under the category title.', multiline: true }),
      },
    }),

    authors: collection({
      label: 'Authors',
      path: 'src/content/authors/*',
      slugField: 'name',
      schema: {
        name: fields.slug({
          name: { label: 'Name (Hebrew)', validation: { isRequired: true } },
          slug: { label: 'URL slug (Latin)', description: 'Becomes /authors/<slug>/.', validation: latinSlug },
        }),
        bio: fields.text({ label: 'Bio', description: 'Short, shown on the author page.', multiline: true }),
        avatar: fields.image({
          label: 'Avatar',
          description: 'Square photo. Optional: the first letter of the name is used when empty.',
          directory: 'src/assets/images/authors',
          publicPath: '../../assets/images/authors/',
        }),
      },
    }),
  },

  singletons: {
    settings: singleton({
      label: 'Site settings',
      path: 'src/content/settings',
      schema: {
        siteTitle: fields.text({ label: 'Site title', defaultValue: 'בורקס לוהט' }),
        tagline: fields.text({ label: 'Tagline', description: 'Shown under the logo.', defaultValue: 'חם, פריך ולא שפוי' }),
        heroTitle: fields.text({ label: 'Hero title (first line)', defaultValue: 'חם, פריך, נוטף.' }),
        heroHighlight: fields.text({ label: 'Hero title (highlighted second line)', description: 'Shown in the accent color.', defaultValue: 'ישר מהתנור.' }),
        heroText: fields.text({ label: 'Hero text', multiline: true }),
        heroStamp: fields.text({ label: 'Hero corner sticker', description: 'Small tilted label on the hero card. Leave empty to hide.', defaultValue: 'הלהיט של השבוע' }),
        heroImage: fields.image({
          label: 'Hero image',
          description: 'Landscape (4:3 works best), at least 1200px wide.',
          directory: 'src/assets/images/site',
          publicPath: '../assets/images/site/',
        }),
        heroImageAlt: fields.text({ label: 'Hero image alt text (Hebrew)' }),
        tickerText: fields.text({ label: 'Ticker strip text', description: 'The red "news" strip at the top of the home page. Leave empty to hide it.' }),
        featuredRecipe: fields.relationship({ label: 'Recipe of the week', description: 'Pick a published recipe (not a draft). Falls back to the newest recipe if empty.', collection: 'recipes' }),
        footerText: fields.text({ label: 'Footer text', defaultValue: 'נאפה באהבה, חמאה וקצת שומשום שנשפך' }),
      },
    }),
  },
});
