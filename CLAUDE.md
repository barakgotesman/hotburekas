# CLAUDE.md — בורקס לוהט (Burekas Lohet / "Hot Burekas")

A Hebrew, right-to-left recipe/cookbook website built with Astro + Keystatic CMS, deployed on Vercel.
Content lives in the GitHub repo as files; the live site has a `/keystatic` admin that saves edits as commits.

This is a **learning project** for Keystatic. Prefer clear, idiomatic Keystatic patterns over clever shortcuts, and add short comments explaining non-obvious Keystatic config.

## Language and naming

- Site name (user-facing): **בורקס לוהט**
- Repo / Vercel project / package name (Latin only): `burekas-lohet`
- All user-facing content and UI text is **Hebrew**.
- Code, comments, identifiers, file names, and commit messages are **English**.

## Stack

- **Astro** (TypeScript, strict) for the site
- **Keystatic** (`@keystatic/core`, `@keystatic/astro`) for content management
- **React** (required by the Keystatic admin UI only; the public site stays mostly static Astro components)
- **Markdoc** for recipe step content
- **Tailwind CSS v4** for styling (via the `@tailwindcss/vite` plugin; no `tailwind.config.js` needed by default)
- **Vercel** (Hobby plan) via `@astrojs/vercel`
- **GitHub** as the content store (Keystatic `github` storage mode in production, `local` in dev)

## Commands

```bash
npm install
npm run dev        # dev server, Keystatic in local mode -> http://localhost:4321/keystatic
npm run build      # production build
npm run preview    # preview the build
npx astro check    # type check
```

## Tailwind setup

```bash
npm install tailwindcss @tailwindcss/vite
```

```js
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  // ...integrations, adapter
});
```

```css
/* src/styles/global.css (imported once in the base layout) */
@import "tailwindcss";

@theme {
  --font-sans: "Heebo", system-ui, sans-serif; /* Hebrew-capable font via @fontsource */
  /* brand colors, e.g. --color-burekas: #d97706; */
}
```

- The older `@astrojs/tailwind` integration is for Tailwind v3; for v4 use the Vite plugin above. If the installed versions differ, check the current Astro + Tailwind docs.
- Put design tokens (colors, fonts, spacing) in `@theme` in `global.css`, and reuse them instead of arbitrary values like `text-[#d97706]`.
- Use `@tailwindcss/typography` (`prose`) for rendered Markdoc content, and verify it in RTL.
- Extract repeated class lists into Astro components (RecipeCard, Button), not into `@apply` piles.

## Hebrew and RTL rules (important)

- Root layout: `<html lang="he" dir="rtl">`. Set `og:locale` to `he_IL`.
- **Use CSS logical properties only**: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`, `border-inline-start`. Never use physical `left`/`right` for layout or spacing.
- **In Tailwind, use the logical utilities**:
  - Spacing: `ms-*` / `me-*` (margin start/end), `ps-*` / `pe-*` (padding start/end)
  - Position: `start-*` / `end-*` (not `left-*` / `right-*`)
  - Text: `text-start` / `text-end` (not `text-left` / `text-right`)
  - Borders and rounding: `border-s` / `border-e`, `rounded-s-*` / `rounded-e-*`
  - Direction-specific tweaks: use the `rtl:` and `ltr:` variants, for example `rtl:-scale-x-100` or `rtl:rotate-180` on arrow icons.
  - Never use `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `space-x-*` with reversed assumptions.
- Flexbox/grid follow `dir` automatically; do not reverse rows manually. Icons that imply direction (arrows, chevrons, "next/back") must be mirrored in RTL.
- Fonts: use a Hebrew-capable font, self-hosted with `@fontsource` (for example Heebo, Rubik, or Assistant). Include the `hebrew` subset. Avoid fonts without Hebrew glyphs, or the browser falls back unpredictably.
- Mixed text: wrap Latin words, numbers with units, or URLs inside Hebrew text with `<bdi>` (or `dir="auto"`) so punctuation does not jump to the wrong side.
- Dates: `toLocaleDateString('he-IL')`. Sorting Hebrew strings: `localeCompare(b, 'he')`.
- Quantities: keep numbers in Latin digits (1, 2, 3). Fractions like ½ are fine.
- **Slugs**: Hebrew slugs become percent-encoded, ugly URLs. Use an editable Latin slug on each entry (see schema), for example `shakshuka`, `burekas-gvina`, instead of deriving the slug from the Hebrew title.
- **Keystatic admin UI is English/LTR**. Hebrew typed into fields works, but check how long text and Markdoc content look and behave while editing. This only affects the admin, not the public site.
- Test every new page in RTL at mobile width as well as desktop.

## Mobile-first and responsive design

Design and build for phones first, then enhance for larger screens. Most visitors will open recipes on a phone, often while cooking in the kitchen.

- **Mobile-first with Tailwind**: unprefixed utilities are the mobile styles, and `sm:`, `md:`, `lg:`, `xl:` layer on larger screens (default breakpoints: 640, 768, 1024, 1280px). Example: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`. Never use `max-*:` variants to "fix" desktop or write desktop styles first and override them for mobile.
- Always include `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Prefer fluid layouts: CSS grid with `repeat(auto-fill, minmax(...))`, flexbox with wrapping, `clamp()` for font sizes and spacing, and `max-width` containers centered on large screens. Avoid fixed pixel widths.
- Recipe grid: 1 column on mobile, 2 on tablet, 3 to 4 on desktop.
- Recipe page on mobile: a single column in this order: title, cover image, meta (time, servings, difficulty, kashrut), ingredients, steps. On desktop (`lg:` and up), switch to two columns with the ingredients in a sticky side column next to the steps.
- Touch targets at least 44x44px, with enough spacing between tappable items.
- Base font size at least 16px (smaller sizes make iOS zoom into inputs). Comfortable line height (about 1.6) for Hebrew body text.
- Navigation: simple and thumb-friendly on mobile (compact header, a menu button or a short list of links), and a regular horizontal nav on desktop. Keep any JS for it minimal, or use a CSS-only/`<details>` approach.
- Images: use Astro's `<Image />` / `<Picture />` with `widths`, `sizes`, and modern formats (AVIF/WebP), `loading="lazy"` below the fold, and explicit dimensions to avoid layout shift. Serve cover images at mobile-appropriate sizes.
- Performance budget: keep pages light and fast on a mid-range phone over 4G. Ship zero client-side JS by default.
- Respect user preferences: `prefers-reduced-motion` and `prefers-color-scheme` (dark mode is optional, but use CSS variables so it is easy to add later).
- Print: add a basic `@media print` stylesheet for the recipe page (hide nav and footer, keep ingredients and steps), since people print recipes.
- Cooking-friendly touches (optional, later): `font-size` toggle, and keep the screen awake with the Wake Lock API on the recipe page (feature-detect it first).
- **Test at these widths** for every new page: 360px, 390px, 768px, 1024px, 1440px, in RTL. Check for horizontal scrolling at 360px; there should be none.

## Project structure

```
keystatic.config.ts        # Keystatic schema: single source of truth for content
astro.config.mjs           # Astro + integrations + Vercel adapter
src/
  content/                 # Content written by Keystatic (do not hand-edit casually)
    recipes/
    categories/
    authors/
    settings/              # singleton: site title, tagline, hero text
  components/              # Astro components (RecipeCard, IngredientList, ...)
  layouts/
  pages/
    index.astro
    recipes/index.astro
    recipes/[slug].astro
    categories/[slug].astro
  lib/
    reader.ts              # Keystatic reader helper (createReader)
  styles/
    global.css             # Tailwind import, @theme tokens (colors, fonts), base styles
public/
```

## Content model (keystatic.config.ts)

**Collections**
- `recipes`: title (Hebrew), slug (Latin, editable), summary, cover image, category (relationship -> categories), author (relationship -> authors), prepMinutes, cookMinutes, servings, difficulty (select), kashrut (select), tags (multiselect), ingredients (array of { amount, unit, name, note }), steps (markdoc), publishedAt (date), draft (checkbox)
- `categories`: name (Hebrew), slug (Latin), description, emoji
- `authors`: name, slug (Latin), bio, avatar

**Singleton**
- `settings`: siteTitle (default "בורקס לוהט"), tagline, heroImage, footerText

**Select fields: Hebrew label, stable English value**
- difficulty: `easy` = קל, `medium` = בינוני, `hard` = קשה
- kashrut: `dairy` = חלבי, `meat` = בשרי, `pareve` = פרווה
- unit: values like `g`, `kg`, `ml`, `cup`, `tbsp`, `tsp`, `unit`, with Hebrew labels (גרם, ק"ג, מ"ל, כוס, כף, כפית, יחידה)
- Always store the English value in content files and show the Hebrew label in the UI via a lookup map in `src/lib/labels.ts`.

Rules for the schema:
- Use a custom slug setup (`fields.slug` with separate `name` and `slug` fields) so the Hebrew title and the Latin slug are both editable. Set `slugField` to the slug field's key.
- Every collection has a `path` like `src/content/<collection>/*`.
- Use `fields.relationship` for links between collections, never plain text.
- Mark required fields with `validation: { isRequired: true }`.
- Images go in `src/assets/images/<collection>` (not `public/`) with `publicPath: '../../assets/images/<collection>/'`, so Astro `<Image>`/`<Picture>` can optimize them (AVIF/WebP, responsive sizes).
- Changing the schema may break existing content files; check existing entries after any change.

## Keystatic storage mode

```ts
storage: import.meta.env.PROD
  ? { kind: 'github', repo: { owner: 'YOUR_GITHUB_USER', name: 'burekas-lohet' } }
  : { kind: 'local' },
```

- Dev: `local` mode, edits write files directly to disk.
- Production: `github` mode, every save is a commit to the repo, which triggers a Vercel rebuild.
- Permissions: Keystatic has no roles. Anyone with write access to the GitHub repo can use `/keystatic`. Use branch protection for review workflows.

## Rendering

- Public pages are pre-rendered (static) and read content with `createReader` from `keystatic.config.ts`.
- The Keystatic admin and its API routes are server-rendered; that is why the Vercel adapter is required.
- Astro 5+: use `output: 'static'` with the Vercel adapter (on-demand routes are supported per route). If the project is on Astro 4, use `output: 'hybrid'`.
- Filter out recipes with `draft: true` on public pages.

## Deployment (Vercel)

- Deploy from the `main` branch; Vercel auto-builds on every push (including Keystatic commits).
- Environment variables (set in Vercel Project Settings, **never commit them**):
  - `KEYSTATIC_GITHUB_CLIENT_ID`
  - `KEYSTATIC_GITHUB_CLIENT_SECRET`
  - `KEYSTATIC_SECRET`
  - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
- GitHub App callback URL must include the production domain:
  `https://burekas-lohet.vercel.app/api/keystatic/github/oauth/callback`
- The admin login only works on registered URLs, so use the production domain for editing, not preview deployments.
- Vercel Hobby is for non-commercial use only. Do not add ads/affiliate links without moving to a paid plan or another host.

## Conventions

- TypeScript strict, no `any` unless commented why.
- **Comments**: write comments wherever the code is complex or non-obvious (why it exists, tricky logic, regexes, Keystatic/Markdoc quirks, browser API workarounds). Don't comment trivial lines.
- **JSDoc on every function** (exported or not, including helpers in `src/lib` and `src/scripts`): a one-line description, plus `@param` and `@returns` where they add information. Types stay in TypeScript, so don't repeat them in JSDoc.
- Small, focused Astro components; no client-side JS on public pages unless needed.
- Accessible markup: semantic HTML, alt text on all recipe images (in Hebrew), good contrast.
- Style with Tailwind utilities; keep it simple so the focus stays on Keystatic. Use plain CSS only for rare cases Tailwind cannot express.
- Commit messages: conventional style in English (`feat:`, `fix:`, `content:`). Keystatic-generated commits may differ; that's fine.

## Do not

- Do not commit `.env` or any secrets.
- Do not use physical `left`/`right` CSS properties or Tailwind utilities (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`); use the logical ones (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`).
- Do not write desktop-first styles or use `max-*:` variants for layout; start from mobile and use `sm:` / `md:` / `lg:`.
- Do not use fixed-width layouts or tiny tap targets.
- Do not derive URL slugs from Hebrew titles.
- Do not hand-edit generated content files in ways that break the schema (wrong field names/types).
- Do not change collection `path` or `slugField` without migrating existing content.
- Do not add a database or external CMS; the repo is the source of truth.

## Learning roadmap (work through in order)

1. Local mode with one collection (`recipes`) and a list + detail page, in RTL with a Hebrew font, mobile-first
2. Add `categories` and `authors` with relationships
3. Add the `settings` singleton
4. Ingredients as an `array` field; Hebrew select labels via a lookup map; Markdoc steps with a custom component (for example a timer or tip callout)
5. Switch to GitHub storage and deploy on Vercel
6. Branch-based editing / preview workflow
7. Polish: search, tag/kashrut filtering, RSS feed, SEO metadata, Open Graph image

## Design source: Stitch via MCP (important)

The visual design is defined in a **Google Stitch** project and must be followed.

- **Stitch project ID: `1604988235901660896`** ("Hot Burekas Recipe Website", design system "Hot Burekas Bakery").
- Use the **Stitch MCP** (`mcp__stitch__*`) before building or restyling any page or component:
  1. `get_project` with `projects/1604988235901660896` for the design theme and design system.
  2. `list_screens` with `projectId: 1604988235901660896` to see all screens (home, recipe list, recipe detail, 404, ...).
  3. Download each screen's `htmlCode.downloadUrl` (and look at the `screenshot`), then **read the HTML** to understand structure, spacing, tilt, stickers, and component patterns. Save downloads to the scratchpad, not the repo.
- **`design.md` (repo root) is the written summary** of the feeling and layout taken from that project. Read it first, then check the Stitch screens for detail.
- **Priority rules**:
  - **Feeling and layout come from the Stitch project.** Do not invent a different look.
  - **Colors come from `design.md` / `src/styles/global.css` `@theme` tokens, which override Stitch colors.** The owner may change the palette, so always use semantic tokens (`bg-primary-container`, `text-secondary`, ...) and never raw hex.
  - The raw Stitch HTML is a reference, not code to paste. Port it to Astro components with Tailwind v4, logical (RTL) utilities, self-hosted fonts, and no CDN scripts, following the rules above in this file.
