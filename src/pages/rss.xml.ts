import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedRecipes, getSettings } from '../lib/reader';

/**
 * RSS feed of published recipes (drafts excluded by getPublishedRecipes).
 * @param context Astro endpoint context; `site` comes from astro.config.mjs.
 */
export async function GET(context: APIContext) {
  const [settings, recipes] = await Promise.all([getSettings(), getPublishedRecipes()]);
  return rss({
    title: settings.siteTitle ?? 'בורקס לוהט',
    description: settings.tagline ?? '',
    site: context.site!,
    items: recipes.map((r) => ({
      title: r.entry.title,
      description: r.entry.summary,
      pubDate: new Date(r.entry.publishedAt ?? Date.now()),
      link: `/recipes/${r.slug}/`,
    })),
    customData: '<language>he</language>',
  });
}
