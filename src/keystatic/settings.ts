import { singleton, fields } from '@keystatic/core';

/** Site-wide settings (a singleton: exactly one file, src/content/settings.yaml). */
export const settings = singleton({
  label: 'Site settings',
  path: 'src/content/settings',
  schema: {
    siteTitle: fields.text({ label: 'Site title', defaultValue: 'בורקס לוהט' }),
    tagline: fields.text({ label: 'Tagline', description: 'Shown under the logo.', defaultValue: 'מתכוני בורקס ביתיים, שלב אחר שלב' }),
    heroTitle: fields.text({ label: 'Hero title (first line)', defaultValue: 'מתכוני בורקס ביתיים,' }),
    heroHighlight: fields.text({ label: 'Hero title (highlighted second line)', description: 'Shown in the accent color.', defaultValue: 'שלב אחר שלב.' }),
    heroText: fields.text({ label: 'Hero text', multiline: true }),
    heroStamp: fields.text({ label: 'Hero corner sticker', description: 'Small tilted label on the hero card. Leave empty to hide.', defaultValue: 'מתכון נבחר' }),
    heroImage: fields.image({
      label: 'Hero image',
      description: 'Landscape (4:3 works best), at least 1200px wide.',
      directory: 'src/assets/images/site',
      // Singletons have no per-entry slug folder, so the path is one level shallower than for collections.
      publicPath: '../assets/images/site/',
    }),
    heroImageAlt: fields.text({ label: 'Hero image alt text (Hebrew)' }),
    tickerText: fields.text({ label: 'Ticker strip text', description: 'The red "news" strip at the top of the home page. Leave empty to hide it.' }),
    featuredRecipe: fields.relationship({
      label: 'Recipe of the week',
      description: 'Pick a published recipe (not a draft). Falls back to the newest recipe if empty.',
      collection: 'recipes',
    }),
    footerText: fields.text({ label: 'Footer text', defaultValue: 'יש לכם מתכון לשתף?' }),
  },
});
