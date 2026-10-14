import { unitLabels } from './labels';

/**
 * Formats a duration in minutes as short Hebrew text, e.g. 90 -> "1 שע׳ 30 דק׳".
 * @param min Duration in minutes.
 */
export const formatMinutes = (min: number) => {
  if (min < 60) return `${min} דק׳`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} שע׳ ${m} דק׳` : `${h} שע׳`;
};

/**
 * Formats an ISO date (YYYY-MM-DD) for Hebrew readers.
 * @param iso Date string as stored by Keystatic.
 */
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('he-IL');

/**
 * Joins an amount and its unit label, e.g. ("250", "g") -> "250 גרם".
 * The unit value "none" (and an empty amount) are skipped.
 * @param amount Free-text amount; may be "½" or "1.5".
 * @param unit Stored unit value (English key from labels.ts).
 */
export const formatAmount = (amount: string | null | undefined, unit: string) =>
  [amount?.trim(), unit && unit !== 'none' ? unitLabels[unit] : ''].filter(Boolean).join(' ');

/**
 * Converts minutes to an ISO-8601 duration for JSON-LD, e.g. 90 -> "PT1H30M".
 * @param min Duration in minutes.
 */
export const isoDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  // "PT0M" is the valid spelling of a zero duration.
  return `PT${h ? `${h}H` : ''}${m || !h ? `${m}M` : ''}`;
};
