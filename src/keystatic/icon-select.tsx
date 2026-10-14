import type { BasicFormField, FormFieldInputProps } from '@keystatic/core';

// Raw SVG markup of every category icon (src/icons/*.svg). `?raw` makes Vite import the file as a string.
import catTriangle from '../icons/cat-triangle.svg?raw';
import catSnail from '../icons/cat-snail.svg?raw';
import catWave from '../icons/cat-wave.svg?raw';
import catLeaf from '../icons/cat-leaf.svg?raw';
import catHoney from '../icons/cat-honey.svg?raw';
import flame from '../icons/flame.svg?raw';

/** Icon markup by option value. Keep in sync with `categoryIconOptions` in src/lib/labels.ts. */
const svgByValue: Record<string, string> = {
  'cat-triangle': catTriangle,
  'cat-snail': catSnail,
  'cat-wave': catWave,
  'cat-leaf': catLeaf,
  'cat-honey': catHoney,
  flame,
};

/** The admin's UI font isn't inherited by custom fields, so name a clean sans-serif stack. */
const ADMIN_FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * Gives an inline SVG an explicit pixel size (the files only have a viewBox, so they'd default to 300x150).
 * @param svg Raw SVG markup.
 * @param size Width and height in px.
 */
const sized = (svg: string, size: number) => svg.replace('<svg ', `<svg width="${size}" height="${size}" `);

interface IconSelectOptions<Option extends { value: string; label: string }> {
  label: string;
  description?: string;
  options: readonly Option[];
  defaultValue: Option['value'];
}

/**
 * A Keystatic "select" that shows each option as an icon button instead of a text dropdown.
 * Behaves like `fields.select` (stores the option value string), so it can be used in `columns`
 * and read with the normal reader. Keystatic's built-in select can only show text, hence this custom field.
 * @param opts Label, help text, the icon options and the default value.
 */
export function iconSelect<const Option extends { value: string; label: string }>({
  label,
  description,
  options,
  defaultValue,
}: IconSelectOptions<Option>): BasicFormField<Option['value']> & { options: readonly Option[] } {
  const isValid = (v: unknown): v is Option['value'] => options.some((o) => o.value === v);

  /** The picker UI: a wrapping row of icon buttons, the selected one highlighted. */
  function Input({ value, onChange }: FormFieldInputProps<Option['value']>) {
    return (
      <div role="radiogroup" aria-label={label} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: ADMIN_FONT }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
        {description && <span style={{ fontSize: 12, opacity: 0.7 }}>{description}</span>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={selected}
                title={o.label}
                onClick={() => onChange(o.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  width: 84,
                  padding: '10px 6px 8px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'inherit',
                  fontFamily: ADMIN_FONT,
                  fontSize: 11,
                  textAlign: 'center',
                  background: selected ? 'rgba(233, 162, 59, 0.2)' : 'transparent',
                  border: `2px solid ${selected ? '#e9a23b' : 'rgba(128, 128, 128, 0.35)'}`,
                }}
              >
                <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: sized(svgByValue[o.value] ?? '', 28) }} />
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return {
    kind: 'form',
    label,
    options,
    Input,
    defaultValue: () => defaultValue,
    // Unknown or missing stored values fall back to the default instead of breaking the editor.
    parse: (value) => (isValid(value) ? value : defaultValue),
    serialize: (value) => ({ value }),
    validate: (value) => value,
    reader: { parse: (value) => (isValid(value) ? value : defaultValue) },
  };
}
