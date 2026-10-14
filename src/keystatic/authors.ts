import { collection, fields } from '@keystatic/core';
import { latinSlug } from './shared';

/** Authors: optional byline on recipes, each with their own page. Entries are .yaml files. */
export const authors = collection({
  label: 'Authors',
  path: 'src/content/authors/*',
  slugField: 'name',
  // Extra columns in the admin list view.
  columns: ['role'],
  schema: {
    name: fields.slug({
      name: { label: 'Name (Hebrew)', validation: { isRequired: true } },
      slug: { label: 'URL slug (Latin)', description: 'Becomes /authors/<slug>/.', validation: latinSlug },
    }),
    role: fields.text({
      label: 'Role',
      description: 'A short title shown next to the name, e.g. "עורך המתכונים" or "סבתא של כולנו".',
    }),
    bio: fields.text({
      label: 'Short bio',
      description: 'One or two sentences, shown under the name on the author page (up to 200 characters).',
      multiline: true,
      validation: { length: { max: 200 } },
    }),
    about: fields.text({
      label: 'About (longer description)',
      description: 'The full story: background, style, favorite recipes. Separate paragraphs with a blank line.',
      multiline: true,
    }),
    quote: fields.text({
      label: 'Signature quote',
      description: 'A short saying shown in a highlighted block, e.g. a baking motto. Leave empty to hide.',
      multiline: true,
    }),
    avatar: fields.image({
      label: 'Avatar',
      description: 'Square photo. Optional: the first letter of the name is used when empty.',
      directory: 'src/assets/images/authors',
      publicPath: '../../assets/images/authors/',
    }),
    banner: fields.image({
      label: 'Banner image',
      description: 'Wide landscape photo (at least 1200px wide) shown at the top of the author page. Optional.',
      directory: 'src/assets/images/authors',
      publicPath: '../../assets/images/authors/',
    }),
    bannerAlt: fields.text({
      label: 'Banner alt text (Hebrew)',
      description: 'Describe the banner photo for screen readers. Required when there is a banner.',
    }),
    instagram: fields.url({
      label: 'Instagram link',
      description: 'Full address, e.g. https://www.instagram.com/name. Optional.',
    }),
  },
});
