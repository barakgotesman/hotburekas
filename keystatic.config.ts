import { config, collection, singleton, fields } from '@keystatic/core';
import { wrapper } from '@keystatic/core/content-components';
import { difficultyOptions, kashrutOptions, unitOptions, groupOptions, tagOptions } from './src/lib/labels';

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

  ui: { brand: { name: 'בורקס לוהט' } },

  collections: {
    recipes: collection({
      label: 'Recipes',
      path: 'src/content/recipes/*',
      // `fields.slug` gives two editable parts: a Hebrew name and a Latin URL slug.
      // `slugField` is the key of that slug field.
      slugField: 'title',
      // The Markdoc `steps` field becomes the body of each .mdoc/.md file.
      format: { contentField: 'steps' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Title (Hebrew)', validation: { isRequired: true } },
          slug: { label: 'URL slug (Latin letters only, e.g. burekas-gvina)', validation: latinSlug },
        }),
        summary: fields.text({ label: 'Summary', multiline: true, validation: { isRequired: true } }),
        cover: fields.image({
          label: 'Cover image',
          // Stored under src/ so Astro can optimize it (AVIF/WebP, responsive sizes).
          directory: 'src/assets/images/recipes',
          publicPath: '../../assets/images/recipes/',
          validation: { isRequired: true },
        }),
        coverAlt: fields.text({ label: 'Cover alt text (Hebrew)', validation: { isRequired: true } }),
        category: fields.relationship({ label: 'Category', collection: 'categories', validation: { isRequired: true } }),
        author: fields.relationship({ label: 'Author', collection: 'authors' }),
        prepMinutes: fields.integer({ label: 'Prep minutes', validation: { isRequired: true, min: 0 } }),
        cookMinutes: fields.integer({ label: 'Cook / bake minutes', validation: { isRequired: true, min: 0 } }),
        servings: fields.integer({ label: 'Servings (units)', validation: { isRequired: true, min: 1 } }),
        difficulty: fields.select({ label: 'Difficulty (heat meter)', options: opts(difficultyOptions), defaultValue: 'easy' }),
        kashrut: fields.select({ label: 'Kashrut', options: opts(kashrutOptions), defaultValue: 'dairy' }),
        tags: fields.multiselect({ label: 'Tags', options: opts(tagOptions) }),
        ingredients: fields.array(
          fields.object({
            group: fields.select({ label: 'Group', options: opts(groupOptions), defaultValue: 'filling' }),
            // Text (not number) so values like "½" or "1.5" are possible. The servings scaler parses it.
            amount: fields.text({ label: 'Amount' }),
            unit: fields.select({ label: 'Unit', options: opts(unitOptions), defaultValue: 'none' }),
            name: fields.text({ label: 'Ingredient', validation: { isRequired: true } }),
            note: fields.text({ label: 'Note' }),
          }),
          { label: 'Ingredients', itemLabel: (props) => props.fields.name.value || 'Ingredient' },
        ),
        chefTip: fields.text({ label: 'Chef tip (optional)', multiline: true }),
        publishedAt: fields.date({ label: 'Published', validation: { isRequired: true } }),
        draft: fields.checkbox({ label: 'Draft (hidden on the public site)', defaultValue: false }),
        steps: fields.markdoc({
          label: 'Steps',
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
      schema: {
        name: fields.slug({
          name: { label: 'Name (Hebrew)', validation: { isRequired: true } },
          slug: { label: 'URL slug (Latin)', validation: latinSlug },
        }),
        emoji: fields.text({ label: 'Emoji' }),
        description: fields.text({ label: 'Description', multiline: true }),
      },
    }),

    authors: collection({
      label: 'Authors',
      path: 'src/content/authors/*',
      slugField: 'name',
      schema: {
        name: fields.slug({
          name: { label: 'Name (Hebrew)', validation: { isRequired: true } },
          slug: { label: 'URL slug (Latin)', validation: latinSlug },
        }),
        bio: fields.text({ label: 'Bio', multiline: true }),
        avatar: fields.image({
          label: 'Avatar',
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
        tagline: fields.text({ label: 'Tagline', defaultValue: 'חם, פריך ולא שפוי' }),
        heroTitle: fields.text({ label: 'Hero title (first line)', defaultValue: 'חם, פריך, נוטף.' }),
        heroHighlight: fields.text({ label: 'Hero title (highlighted second line)', defaultValue: 'ישר מהתנור.' }),
        heroText: fields.text({ label: 'Hero text', multiline: true }),
        heroStamp: fields.text({ label: 'Hero corner sticker', defaultValue: 'הלהיט של השבוע' }),
        heroImage: fields.image({
          label: 'Hero image',
          directory: 'src/assets/images/site',
          publicPath: '../assets/images/site/',
        }),
        heroImageAlt: fields.text({ label: 'Hero image alt text (Hebrew)' }),
        tickerText: fields.text({ label: 'Ticker strip text (leave empty to hide)' }),
        featuredRecipe: fields.relationship({ label: 'Recipe of the week', collection: 'recipes' }),
        footerText: fields.text({ label: 'Footer text', defaultValue: 'נאפה באהבה, חמאה וקצת שומשום שנשפך' }),
      },
    }),
  },
});
