// Parsing / formatting of ingredient amounts. Used at build time (data-base attribute)
// and in the browser by the servings scaler, so keep it dependency-free.

const FRACTION_CHARS: Record<string, number> = {
  '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125,
};

/** Fractions the formatter may produce, as [value, glyph]. 0 means "no fraction". */
const DISPLAY_FRACTIONS: [number, string][] = [
  [0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, ''],
];

/**
 * Parses a free-text amount such as "250", "1.5", "½", "1½", "1 1/2" or "3/4".
 * @param text Amount as typed in Keystatic.
 * @returns The numeric value, or null when it isn't a single number (e.g. "2-3", "לפי הטעם").
 */
export function parseAmount(text: string | null | undefined): number | null {
  const s = (text ?? '').trim();
  if (!s) return null;

  // Whole number optionally followed by a unicode fraction: "1½", "½"
  const unicode = s.match(/^(\d+)?\s*([¼½¾⅓⅔⅛])$/);
  if (unicode) return Number(unicode[1] ?? 0) + FRACTION_CHARS[unicode[2]];

  // "1 1/2" or "3/4"
  const slash = s.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  if (slash && Number(slash[3]) !== 0) return Number(slash[1] ?? 0) + Number(slash[2]) / Number(slash[3]);

  // Plain decimal ("1.5" or "1,5")
  if (/^\d+([.,]\d+)?$/.test(s)) return Number(s.replace(',', '.'));
  return null;
}

/**
 * Formats a scaled amount for display: whole numbers from 10 up, otherwise the nearest
 * kitchen fraction (¼ ⅓ ½ ⅔ ¾), e.g. 1.5 -> "1½".
 * @param value Scaled numeric amount.
 */
export function formatQuantity(value: number): string {
  if (value >= 10) return String(Math.round(value));

  let whole = Math.floor(value);
  const rest = value - whole;
  // Pick the closest displayable fraction; "1" rolls over into the whole part.
  const [fractionValue, glyph] = DISPLAY_FRACTIONS.reduce((best, cur) =>
    Math.abs(cur[0] - rest) < Math.abs(best[0] - rest) ? cur : best,
  );
  if (fractionValue === 1) whole += 1;

  if (!whole && !glyph) return '¼'; // never show 0 for a non-zero ingredient
  return `${whole || ''}${glyph}`;
}
