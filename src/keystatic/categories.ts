import { collection, fields } from '@keystatic/core';
import { categoryIconOptions } from '../lib/labels';
import { opts, latinSlug } from './shared';

/** Categories: referenced from recipes by relationship. Entries are .yaml files. */
export const categories = collection({
  label: 'Categories',
  path: 'src/content/categories/*',
  slugField: 'name',
  columns: ['icon'],
  schema: {
    name: fields.slug({
      name: { label: 'Name (Hebrew)', validation: { isRequired: true } },
      slug: { label: 'URL slug (Latin)', description: 'Becomes /categories/<slug>/.', validation: latinSlug },
    }),
    icon: fields.select({
      label: 'Icon',
      description: 'Shown on category cards and chips.',
      options: opts(categoryIconOptions),
      defaultValue: 'cat-triangle',
    }),
    description: fields.text({ label: 'Description', description: 'One sentence under the category title.', multiline: true }),
  },
});
