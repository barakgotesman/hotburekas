// Remembers which ingredients were ticked ("already on the counter") for the current browser session.

const boxes = document.querySelectorAll<HTMLInputElement>('[data-ingredient-check]');
const storageKey = `burekas-checks:${location.pathname}`;

/**
 * Reads the ids of ticked ingredients from sessionStorage.
 * @returns Ids, or [] when nothing is stored or storage is blocked.
 */
function load(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey) ?? '[]');
  } catch {
    return [];
  }
}

/** Saves the currently ticked ids; blocked storage is ignored. */
function save() {
  try {
    const ticked = Array.from(boxes, (b) => b).filter((b) => b.checked).map((b) => b.id);
    sessionStorage.setItem(storageKey, JSON.stringify(ticked));
  } catch {
    // Not critical: ticks just won't survive a reload.
  }
}

const saved = new Set(load());
boxes.forEach((box) => {
  box.checked = saved.has(box.id);
  box.addEventListener('change', save);
});
