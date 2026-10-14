// Helpers shared by the Keystatic collection definitions in this folder.

/**
 * Copies a readonly options tuple from labels.ts into the mutable array Keystatic's select fields expect.
 * @param o Options as `{ value, label }` pairs.
 */
export const opts = (o: readonly { value: string; label: string }[]) => o.map((x) => ({ ...x }));

/** Slug validation: Hebrew titles would make ugly percent-encoded URLs, so every slug must be Latin. */
export const latinSlug = {
  pattern: { regex: /^[a-z0-9-]+$/, message: 'Latin lowercase letters, digits and dashes only' },
};
