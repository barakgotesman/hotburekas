import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import { renderMarkdoc } from './markdoc';

// The reader reads the same files Keystatic writes, typed from keystatic.config.ts.
export const reader = createReader(process.cwd(), keystaticConfig);

type Settings = NonNullable<Awaited<ReturnType<typeof reader.singletons.settings.read>>>;

/**
 * Site settings singleton.
 * @returns The saved settings, or an empty object if they haven't been saved yet.
 */
export async function getSettings(): Promise<Partial<Settings>> {
  return (await reader.singletons.settings.read()) ?? {};
}

/** All categories, sorted by Hebrew name. */
export async function getCategories() {
  const all = await reader.collections.categories.all();
  return all.sort((a, b) => a.entry.name.localeCompare(b.entry.name, 'he'));
}

/** All authors. */
export async function getAuthors() {
  return reader.collections.authors.all();
}

/** Published recipes, newest first. Drafts never appear on public pages. */
export async function getPublishedRecipes() {
  const all = await reader.collections.recipes.all();
  return all
    .filter((r) => !r.entry.draft)
    .sort((a, b) => (b.entry.publishedAt ?? '').localeCompare(a.entry.publishedAt ?? ''));
}

export type RecipeItem = Awaited<ReturnType<typeof getPublishedRecipes>>[number];

/**
 * Renders a recipe's Markdoc steps to HTML.
 * @param slug Recipe slug (the entry's file name).
 * @returns HTML string, or '' if the recipe doesn't exist.
 */
export async function renderSteps(slug: string) {
  const recipe = await reader.collections.recipes.read(slug);
  if (!recipe) return '';
  const { node } = await recipe.steps();
  return renderMarkdoc(node);
}
