// Client-side search / filter / sort for /recipes. All recipe cards are in the static HTML;
// this script only hides, shows and reorders them, and mirrors the state into the URL
// (?q=...&kashrut=dairy&heat=hard&quick=1&sort=time) so filtered views are shareable.

interface FilterState {
  q: string;
  kashrut: string;
  heat: string;
  quick: boolean;
  sort: string;
}

/** Recipes with prep + cook at or under this many minutes count as "quick". */
const QUICK_MINUTES = 30;

const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-recipe-card]'));
const searchInput = document.querySelector<HTMLInputElement>('#recipe-search');
const countEl = document.querySelector<HTMLElement>('#recipe-count');
const emptyEl = document.querySelector<HTMLElement>('#recipe-empty');
const sortSelect = document.querySelector<HTMLSelectElement>('#recipe-sort');

/**
 * Reads the filter state from the page URL.
 * @returns State with defaults for anything missing.
 */
function readState(): FilterState {
  const p = new URLSearchParams(location.search);
  return {
    q: p.get('q') ?? '',
    kashrut: p.get('kashrut') ?? 'all',
    heat: p.get('heat') ?? 'all',
    quick: p.get('quick') === '1',
    sort: p.get('sort') ?? 'new',
  };
}

/**
 * Writes the state to the URL without adding a history entry. Default values are left out.
 * @param s Current filter state.
 */
function writeState(s: FilterState) {
  const p = new URLSearchParams();
  if (s.q) p.set('q', s.q);
  if (s.kashrut !== 'all') p.set('kashrut', s.kashrut);
  if (s.heat !== 'all') p.set('heat', s.heat);
  if (s.quick) p.set('quick', '1');
  if (s.sort !== 'new') p.set('sort', s.sort);
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

/**
 * Decides whether a card passes every active filter.
 * @param card Recipe card element carrying data-* attributes.
 * @param s Current filter state.
 */
function matches(card: HTMLElement, s: FilterState): boolean {
  const { kashrut, difficulty, minutes, search } = card.dataset;
  return (
    (s.kashrut === 'all' || kashrut === s.kashrut) &&
    (s.heat === 'all' || difficulty === s.heat) &&
    (!s.quick || Number(minutes) <= QUICK_MINUTES) &&
    (!s.q || (search ?? '').includes(s.q.toLowerCase()))
  );
}

/** Applies the state to the DOM: visibility, order, count, chip pressed states. */
function render(s: FilterState) {
  // Cards are in "newest first" order in the HTML; CSS `order` re-sorts without moving nodes.
  const byTime = [...cards].sort((a, b) => Number(a.dataset.minutes) - Number(b.dataset.minutes));
  cards.forEach((card, i) => {
    card.style.order = String(s.sort === 'time' ? byTime.indexOf(card) : i);
  });

  let visible = 0;
  for (const card of cards) {
    const show = matches(card, s);
    card.hidden = !show;
    if (show) visible++;
  }
  if (countEl) countEl.textContent = `${visible} מתכונים פריכים`;
  if (emptyEl) emptyEl.hidden = visible > 0;

  document.querySelectorAll<HTMLElement>('[data-filter]').forEach((chip) => {
    const { filter, value } = chip.dataset;
    const active = filter === 'quick' ? s.quick : s[filter as 'kashrut' | 'heat'] === value;
    chip.setAttribute('aria-pressed', String(active));
  });
}

const state = readState();
if (searchInput) searchInput.value = state.q;
if (sortSelect) sortSelect.value = state.sort;
render(state);

/** Applies a change to the state, then re-renders and updates the URL. */
function update(patch: Partial<FilterState>) {
  Object.assign(state, patch);
  writeState(state);
  render(state);
}

searchInput?.addEventListener('input', () => update({ q: searchInput.value.trim() }));
sortSelect?.addEventListener('change', () => update({ sort: sortSelect.value }));
document.querySelectorAll<HTMLElement>('[data-filter]').forEach((chip) => {
  chip.addEventListener('click', () => {
    const { filter, value = 'all' } = chip.dataset;
    if (filter === 'quick') update({ quick: !state.quick });
    // Clicking the active chip again clears that filter.
    else if (filter === 'kashrut' || filter === 'heat') update({ [filter]: state[filter] === value ? 'all' : value });
  });
});
document.querySelector('#recipe-clear')?.addEventListener('click', () => {
  if (searchInput) searchInput.value = '';
  update({ q: '', kashrut: 'all', heat: 'all', quick: false });
});
