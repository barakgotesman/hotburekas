import { collection, fields } from '@keystatic/core';
import { latinSlug } from './shared';

/** Authors: optional byline on recipes. Entries are .yaml files. */
export const authors = collection({
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
});
