// Small recipe-page extras: remember the last recipe (for the "מצב אפייה" tab), share and print buttons.

try {
  const slug = document.body.querySelector<HTMLElement>('[data-recipe-slug]')?.dataset.recipeSlug;
  if (slug) localStorage.setItem('burekas-last-recipe', slug);
} catch {
  // Storage blocked: the cook tab simply falls back to the recipe list.
}

document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

const shareBtn = document.querySelector<HTMLElement>('[data-share]');
if (shareBtn && 'share' in navigator) {
  // Only offer sharing where the native share sheet exists (mostly phones).
  shareBtn.removeAttribute('hidden');
  shareBtn.addEventListener('click', () => {
    navigator.share({ title: document.title, url: location.href }).catch(() => {
      // User dismissed the sheet; nothing to do.
    });
  });
}
