import { collection, fields } from '@keystatic/core';
import { categoryIconOptions } from '../lib/labels';
import { latinSlug } from './shared';
import { iconSelect } from './icon-select';

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
    // Custom field (icon-select.tsx): shows each icon as a button instead of a text dropdown.
    icon: iconSelect({
      label: 'Icon',
      description: 'Shown on category cards and chips.',
      options: categoryIconOptions,
      defaultValue: 'cat-triangle',
    }),
    description: fields.text({ label: 'Description', description: 'One sentence under the category title.', multiline: true }),
  },
});
