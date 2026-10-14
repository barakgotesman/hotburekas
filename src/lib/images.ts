import type { ImageMetadata } from 'astro';

// Every optimizable image Keystatic can reference. Eager so lookups are synchronous at build time.
const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

/**
 * Turns the image path stored by Keystatic (e.g. "../../assets/images/recipes/x.jpg")
 * into Astro image metadata usable with <Image>/<Picture>.
 * Matching is by the last two path segments (folder + file name), so the stored relative
 * prefix doesn't matter.
 * @param stored Path as stored in the content file.
 * @returns The image metadata, or undefined if no file matches.
 */
export function resolveImage(stored?: string | null): ImageMetadata | undefined {
  if (!stored) return undefined;
  const tail = stored.split('/').slice(-2).join('/');
  const hit = Object.entries(images).find(([key]) => key.endsWith(`/${tail}`));
  return hit?.[1].default;
}
