// Single source of truth for select options.
// Content files store the English `value`; the UI shows the Hebrew `label`.

export const difficultyOptions = [
  { value: 'easy', label: 'קל' },
  { value: 'medium', label: 'בינוני' },
  { value: 'hard', label: 'קשה' },
] as const;

export const kashrutOptions = [
  { value: 'dairy', label: 'חלבי' },
  { value: 'meat', label: 'בשרי' },
  { value: 'pareve', label: 'פרווה' },
] as const;

export const unitOptions = [
  { value: 'none', label: 'ללא יחידה' },
  { value: 'g', label: 'גרם' },
  { value: 'kg', label: 'ק"ג' },
  { value: 'ml', label: 'מ"ל' },
  { value: 'cup', label: 'כוס' },
  { value: 'tbsp', label: 'כף' },
  { value: 'tsp', label: 'כפית' },
  { value: 'unit', label: 'יחידה' },
  { value: 'pinch', label: 'קורט' },
] as const;

export const groupOptions = [
  { value: 'dough', label: 'לבצק' },
  { value: 'filling', label: 'למילוי' },
  { value: 'topping', label: 'לפיזור מלמעלה' },
  { value: 'sauce', label: 'לרוטב ולהגשה' },
  { value: 'other', label: 'נוספים' },
] as const;

export const tagOptions = [
  { value: 'quick', label: 'מהיר' },
  { value: 'kids', label: 'לילדים' },
  { value: 'shabbat', label: 'ארוחת שבת' },
  { value: 'holiday', label: 'חג' },
  { value: 'freezer', label: 'מתאים להקפאה' },
  { value: 'vegetarian', label: 'צמחוני' },
] as const;

type Option = { readonly value: string; readonly label: string };
const toMap = (opts: readonly Option[]) =>
  Object.fromEntries(opts.map((o) => [o.value, o.label])) as Record<string, string>;

export const difficultyLabels = toMap(difficultyOptions);
export const kashrutLabels = toMap(kashrutOptions);
export const unitLabels = toMap(unitOptions);
export const groupLabels = toMap(groupOptions);
export const tagLabels = toMap(tagOptions);

/** Difficulty is shown as a "heat meter" (מד חום). */
export const heatInfo: Record<string, { name: string; level: 1 | 2 | 3; flames: string; classes: string }> = {
  easy: { name: 'פושר', level: 1, flames: '🔥', classes: 'bg-primary-container text-on-primary-container' },
  medium: { name: 'חם', level: 2, flames: '🔥🔥', classes: 'bg-secondary-container text-on-secondary-container' },
  hard: { name: 'לוהט', level: 3, flames: '🔥🔥🔥', classes: 'bg-secondary text-on-secondary' },
};

export const kashrutInfo: Record<string, { classes: string }> = {
  dairy: { classes: 'bg-tertiary text-on-tertiary' },
  meat: { classes: 'bg-kosher-meat text-white' },
  pareve: { classes: 'bg-kosher-parve text-on-kosher-parve' },
};

export const groupDot: Record<string, string> = {
  dough: 'bg-primary',
  filling: 'bg-secondary',
  topping: 'bg-tertiary',
  sauce: 'bg-kosher-meat',
  other: 'bg-outline',
};
