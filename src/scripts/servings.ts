// Servings scaler on the recipe page. Each quantity is `<bdi data-qty data-base="250">`;
// the stepper multiplies data-base by (chosen servings / default servings).
import { formatQuantity } from '../lib/amount';

const root = document.querySelector<HTMLElement>('[data-servings-root]');

if (root) {
  const base = Number(root.dataset.servingsBase) || 1;
  const display = root.querySelector<HTMLElement>('[data-servings-value]');
  const quantities = document.querySelectorAll<HTMLElement>('[data-qty][data-base]');
  let current = base;

  /**
   * Re-renders the servings label and every scalable quantity.
   * Quantities without a numeric data-base (e.g. "לפי הטעם") keep their original text.
   */
  function render() {
    if (display) display.textContent = `${current} יח׳`;
    const factor = current / base;
    quantities.forEach((el) => {
      el.textContent = formatQuantity(Number(el.dataset.base) * factor);
    });
  }

  root.querySelectorAll<HTMLButtonElement>('[data-servings-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.servingsStep);
      current = Math.min(base * 4, Math.max(1, current + delta));
      render();
    });
  });

  // The stepper is hidden in the HTML (no use without JS); reveal it now that it works.
  root.querySelector<HTMLElement>('[data-servings-stepper]')?.removeAttribute('hidden');
}
