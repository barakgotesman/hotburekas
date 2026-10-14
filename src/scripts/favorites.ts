// Favorites live in localStorage only (no accounts). Buttons are `[data-fav="<slug>"]` with aria-pressed.
// Exposes `burekas:favorites-changed` so /favorites can re-render without a reload.

const KEY = 'burekas-favorites';

/**
 * Reads the saved favorite slugs.
 * @returns Slugs, or [] when storage is empty, corrupt or blocked.
 */
export function readFavorites(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Persists the favorite slugs and notifies listeners. Silently ignores blocked storage.
 * @param slugs Full list to save.
 */
function writeFavorites(slugs: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // Private mode / blocked storage: the toggle still updates the UI for this page view.
  }
  document.dispatchEvent(new CustomEvent('burekas:favorites-changed'));
}

/** Syncs every favorite button's pressed state with storage. */
function syncButtons() {
  const saved = new Set(readFavorites());
  document.querySelectorAll<HTMLButtonElement>('[data-fav]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(saved.has(btn.dataset.fav ?? '')));
  });
}

/**
 * Adds or removes one slug from the favorites.
 * @param slug Recipe slug.
 */
function toggle(slug: string) {
  const saved = readFavorites();
  writeFavorites(saved.includes(slug) ? saved.filter((s) => s !== slug) : [...saved, slug]);
}

// One delegated listener covers every button, including ones shown later by filters.
document.addEventListener('click', (event) => {
  const btn = (event.target as Element).closest<HTMLButtonElement>('[data-fav]');
  if (!btn) return;
  event.preventDefault();
  toggle(btn.dataset.fav ?? '');
});
document.addEventListener('burekas:favorites-changed', syncButtons);
syncButtons();
