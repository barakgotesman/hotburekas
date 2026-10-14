// Recipe submission form: dynamic ingredient/step rows, client-side photo resize and the POST to /api/submit-recipe.

const form = document.querySelector<HTMLFormElement>('#submit-form');

if (form) {
  const ingredientList = document.querySelector<HTMLOListElement>('#ingredient-list')!;
  const stepList = document.querySelector<HTMLOListElement>('#step-list')!;
  const status = document.querySelector<HTMLElement>('#submit-status')!;
  const button = document.querySelector<HTMLButtonElement>('#submit-button')!;
  const photoInput = document.querySelector<HTMLInputElement>('#f-photo')!;
  const preview = document.querySelector<HTMLImageElement>('#photo-preview')!;
  // Sent to the server, which rejects bots that submit within a couple of seconds.
  const startedAt = Date.now();

  /** Longest photo side after resizing, and the largest encoded photo the API accepts (3MB). */
  const MAX_SIDE = 1600;
  const MAX_BYTES = 3 * 1024 * 1024;

  /**
   * Updates the "noun N" titles after a row was added or removed.
   * @param list The <ol> to renumber.
   * @param noun Hebrew row label, e.g. "מצרך".
   */
  function renumber(list: HTMLOListElement, noun: string) {
    list.querySelectorAll<HTMLElement>('[data-row-title]').forEach((el, i) => {
      el.textContent = `${noun} ${i + 1}`;
    });
  }

  /**
   * Adds a row cloned from a <template> to a list and renumbers the rows.
   * @param list The <ol> receiving the row.
   * @param templateId Selector of the <template> to clone.
   * @param noun Hebrew row label, shown as "noun N".
   */
  function addRow(list: HTMLOListElement, templateId: string, noun: string) {
    const tpl = document.querySelector<HTMLTemplateElement>(templateId)!;
    list.append(tpl.content.cloneNode(true));
    renumber(list, noun);
  }

  /**
   * Wires the "remove" buttons of a list with event delegation (rows are added dynamically).
   * @param list The <ol> holding the rows.
   * @param noun Hebrew row label, used for renumbering.
   */
  function enableRemove(list: HTMLOListElement, noun: string) {
    list.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-remove]');
      if (!btn) return;
      // Always keep one row so the list never looks broken.
      if (list.children.length > 1) btn.closest('li')?.remove();
      renumber(list, noun);
    });
  }

  enableRemove(ingredientList, 'מצרך');
  enableRemove(stepList, 'שלב');
  document.querySelector('#add-ingredient')!.addEventListener('click', () => addRow(ingredientList, '#ingredient-template', 'מצרך'));
  document.querySelector('#add-step')!.addEventListener('click', () => addRow(stepList, '#step-template', 'שלב'));
  // Start with a few empty rows; empty rows are ignored on the server.
  for (let i = 0; i < 3; i++) addRow(ingredientList, '#ingredient-template', 'מצרך');
  for (let i = 0; i < 2; i++) addRow(stepList, '#step-template', 'שלב');

  /**
   * Shows a message in the status box and scrolls to it.
   * @param lines Hebrew messages, one paragraph each.
   * @param ok True for success styling, false for an error.
   */
  function showStatus(lines: string[], ok: boolean) {
    status.className = `rounded-xl border-2 border-ink p-4 text-label-lg ${ok ? 'bg-tertiary-container' : 'bg-secondary-container'}`;
    status.replaceChildren(...lines.map((text) => Object.assign(document.createElement('p'), { textContent: text })));
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Resizes an image to a JPEG data URL. Phone photos are often 5-10MB but the API body limit is ~4.5MB.
   * @param file The photo picked by the visitor.
   * @returns A `data:image/jpeg;base64,...` string no larger than MAX_BYTES.
   */
  async function resizePhoto(file: File): Promise<string> {
    // imageOrientation applies the EXIF rotation so phone photos aren't sideways.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // Lower the quality until the result fits (base64 is 4/3 the size of the bytes).
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const url = canvas.toDataURL('image/jpeg', quality);
      if ((url.length * 3) / 4 <= MAX_BYTES) return url;
    }
    throw new Error('photo too large');
  }

  photoInput.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    preview.hidden = !file;
    if (file) preview.src = URL.createObjectURL(file);
  });

  /**
   * Reads every row of a list into plain objects keyed by the controls' names.
   * @param list The <ol> holding the rows.
   * @returns One record per row.
   */
  function readRows(list: HTMLOListElement): Record<string, string>[] {
    return [...list.children].map((li) =>
      Object.fromEntries([...li.querySelectorAll<HTMLInputElement>('[name]')].map((el) => [el.name, el.value])),
    );
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'hidden';

    // The form has `novalidate` so we control the flow, but the browser's messages for required fields are still useful.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const file = photoInput.files?.[0];
    const ingredients = readRows(ingredientList).filter((r) => r.name.trim());
    const steps = readRows(stepList).filter((r) => r.stepText.trim());
    if (!file) return showStatus(['יש להעלות תמונה של המנה.'], false);
    if (!ingredients.length) return showStatus(['יש להוסיף לפחות מצרך אחד.'], false);
    if (!steps.length) return showStatus(['יש להוסיף לפחות שלב הכנה אחד.'], false);

    button.disabled = true;
    try {
      const data = new FormData(form);
      const res = await fetch('/api/submit-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startedAt,
          website: data.get('website'),
          submitterName: data.get('submitterName'),
          submitterEmail: data.get('submitterEmail'),
          title: data.get('title'),
          summary: data.get('summary'),
          category: data.get('category'),
          prepMinutes: data.get('prepMinutes'),
          cookMinutes: data.get('cookMinutes'),
          servings: data.get('servings'),
          difficulty: data.get('difficulty'),
          kashrut: data.get('kashrut'),
          tags: data.getAll('tags'),
          chefTip: data.get('chefTip'),
          ingredients,
          steps: steps.map((r) => ({ title: r.stepTitle, text: r.stepText })),
          photo: await resizePhoto(file),
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        form.reset();
        preview.hidden = true;
        showStatus(['תודה! המתכון נשלח ויפורסם באתר לאחר בדיקה.'], true);
      } else {
        showStatus(result.errors ?? ['משהו השתבש. נסו שוב.'], false);
      }
    } catch {
      showStatus(['לא הצלחנו לשלוח. בדקו את החיבור ונסו שוב.'], false);
    } finally {
      button.disabled = false;
    }
  });
}
