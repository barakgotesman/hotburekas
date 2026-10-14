# design.md — The feel and layout of בורקס לוהט

Source of truth: Stitch project **1604988235901660896** ("Hot Burekas Recipe Website", design system "Hot Burekas Bakery").
Screens studied (downloaded via the Stitch MCP, HTML inspected): home, recipe list, recipe detail, 404.

## How to read this file

- **Colors in this file are overridable.** The owner may change the palette. If a color here conflicts with `src/styles/global.css` `@theme` tokens, the tokens win. Always use semantic token names (`primary`, `secondary`, `surface-container`...), never raw hex in components.
- **Feeling and layout are NOT overridable.** They come from the Stitch project. Re-fetch the project with the Stitch MCP (`get_project`, `list_screens`, `get_screen`) whenever a new page or component is built, and match it.
- **Redesign (owner-approved, replaces the earlier "soft tonal" reading of the screens):** the first build followed the Stitch screens literally (soft peach layers, no borders, soft shadows) and came out generic. The site now follows the Stitch `designMd` prose instead: **hard 2px ink outlines and hard offset shadows**, pushed further into a bakery-poster / paper-bag print look. Layout, tilt, stickers, bottom nav and page structure still come from the Stitch screens.

## The feeling

An Israeli neighborhood bakery (*ma'afiya*) at dawn on a Friday morning. Warm, buttery, a little cheeky, loud and friendly. It is a market stall, not a corporate site.

- **Playful and tactile**: cards are slightly tilted like pastries on a tray, with taped stickers and stamps stuck on top.
- **Printed, not rendered**: it should look like a screen-printed bakery poster or a paper bag: butter-yellow paper with grain and halftone dots, flat loud inks (saffron, tomato, za'atar green), thick espresso outlines, and offset "misregistered" shadows. If a screen looks like a soft pastel app, it is wrong.
- **Warm, never cold**: no stark white canvas, no cold greys or blues. Every neutral is tinted toward dough, parchment, or espresso.
- **Bold Hebrew voice**: heavy chunky headlines, short, clear, plain Hebrew copy. The visual style is playful, but the wording is that of a real recipe site (מתכונים, מצרכים, מנות, זמן הכנה, רמת קושי); do not use bakery-concept wordplay (tray, oven heat, crunch) in UI copy.
- **Food first**: big, steamy, close-up photography with warm light. Images carry the page.
- **Cooking-friendly**: large tap targets, generous reading size, checkable ingredients, a "cook mode". The person has flour on their hands.

## Color roles (default palette, overridable)

Material-style semantic tokens. Defaults:

| Role | Default | Used for |
|---|---|---|
| `surface` / `background` | `#fdecc0` | Page canvas (butter paper, with grain + halftone from `body`) |
| `surface-container-low` | `#fff2d0` | Default card background |
| `surface-container` | `#fbe3a0` | Inset wells, meta tiles |
| `surface-container-high` / `highest` | `#f7d27a` / `#f2c25c` | Chips, banner blocks |
| `surface-container-lowest` | `#fff8e6` | Alternate cards, inputs, step cards (paper, never pure white) |
| `primary` | `#3d1d0c` | Strong CTA fill (ink-dark with saffron text), links |
| `primary-container` | `#ffb52e` | Saffron crust: the loud accent, active chips, step numbers, "special of the day" boards |
| `secondary` | `#e2371b` | Tomato heat: hero highlight label, stickers, alerts, the follow banner |
| `secondary-container` | `#ff7a45` | Hot heat meter level, flame badges |
| `tertiary` / `tertiary-container` | `#2f6a2c` / `#a5d77c` | Za'atar green: kashrut (dairy) badges, positive states |
| `on-surface` / `on-surface-variant` / `ink` | `#2b1408` / `#5a3a22` / `#2b1408` | Text, and `ink` = all borders and hard shadows (espresso, never pure black) |
| `inverse-surface` | `#2b1408` | Ticker strip, bottom nav, footer, image gradient overlays |

Color behavior (keep even if hues change):
- One warm "hot" accent (secondary) for heat, urgency, and the highlight word in headlines.
- One "crust" accent (primary-container) for primary action and active state.
- One herbal green accent (tertiary) for kashrut and positive confirmation.
- Text is always a dark warm brown, surfaces are always warm tints. Hierarchy is built by stepping through the `surface-container-*` ladder, not with borders.

## Typography

- **Fonts**: two faces, both self-hosted via `@fontsource`. **Suez One** (`font-display`, single weight 400, Hebrew subset) for every `h1`-`h3`, the logo name, step titles and big poster numbers: chunky, signage-like. **Rubik** (variable, weights 400 to 900) for body, labels and UI. `h1`-`h3` set `font-synthesis: none` in `global.css`, so a stray `font-extrabold` never fakes a bold on Suez One.
- Scale (mobile / desktop):
  - Display: 36px / 48px, weight 900, tight tracking. Hero only.
  - Headline XL: 28px / 36px, weight 800. Page titles (404, section hero).
  - Headline LG: 28px, weight 700-800. Recipe title.
  - Headline SM: 20px, weight 700. Section titles and card titles.
  - Body LG / MD / SM: 18 / 16 / 14px, weight 400, line-height about 1.5-1.6.
  - Labels: 15px bold (buttons), 13px semibold (meta values, chips), 11px bold with slight tracking (stickers, captions).
- Headlines are heavy and stamped. Hero headline: `clamp(3rem, 13.5vw, 7rem)`, line-height about 0.95. Its second line is the **highlight label**: a rotated tomato (`secondary`) block with an ink outline and hard shadow, not just colored text.
- Section titles are `text-3xl` display type; page titles `text-4xl lg:text-6xl`.
- Chef quotes and tips use italic or a medium weight inside a tinted block with a quote icon.
- Body text never goes below 14px for secondary copy, and 16px for anything a person reads while cooking (steps, ingredients).

## Shape, depth, and motion

- **Ink outlines are the structure.** Cards, buttons, chips, badges, inputs and stickers all get `border-2 border-ink`. Hierarchy comes from flat color blocks (paper, saffron, tomato, ink) plus the outline, not from tonal steps alone.
- **Hard offset shadows**: `shadow-card` = `-5px 5px 0 ink`, `shadow-soft` = `-2px 2px 0 ink` (down toward the reading-end side in RTL), growing on hover. Pressable things (buttons, chips, icon buttons) **sink on press**: translate by the shadow offset and drop the shadow (`active:translate-x-[-3px] active:translate-y-[3px] active:shadow-none`).
- **Corners are squarer than Material**: `rounded-xl` = 8px, `rounded-2xl` = 12px (set in `@theme`), chips and seals `rounded-full`, stickers `rounded-sm`.
- **Signature tilt**: cards sit at `-0.8deg` / `+1deg` / `-1deg`, alternating, and straighten to `0` on hover (`transition` 300ms). The hero photo and follow banner tilt too. Tilt is for decorative cards and callouts, **not** for body text or form controls.
- **Stickers**: small angled labels (`-3deg` to `+12deg`) with ink outlines pinned to corners of cards: baking time, "recipe of the week", photo caption. The hero **seal** is a round saffron stamp with a dashed inner ring, rotated 12deg. A strip of "tape" sits on top of the chef's tip card.
- **Stamps / seals**: kashrut and heat appear as outlined pills with an icon (verified, flame) plus a Hebrew label.
- **Chrome is solid, not glass**: the top header is paper with an ink rule underneath; the mobile bottom nav is an ink slab with a saffron active tab (offset tomato shadow); the footer is an ink block with the footer text in saffron display type. No backdrop blur.
- **Ticker**: a full-bleed ink strip under the header with the news text scrolling past (CSS marquee: two identical copies animated by 50%, with an `sr-only` copy for screen readers). Stopped by the global `prefers-reduced-motion` rule.
- **Paper**: `body` has a tiled SVG-noise grain plus faint halftone dots. Do not use `background-attachment: fixed` on it (it repaints the noise filter on every scroll and freezes long pages).
- **Motion is small and playful**: image zoom on hover (`scale-105`, 500ms), the press-sink above, a pinging/pulsing dot, the ticker. Everything must respect `prefers-reduced-motion`.

## Layout

The Stitch screens are **mobile-first, single column**, and that is the primary design. Desktop is an enhancement that follows `CLAUDE.md`.

- **Gutters**: `1.25rem` side padding on mobile. Spacing scale: 4 / 8 / 16 / 24 / 40px.
- **Sections** stack with about `1.5rem`-`2.5rem` between them. Each section has a small icon + `headline-sm` title on one side and a small link or tag on the other ("לכל המגשים ‹").
- **Desktop**: 12-column grid capped at about `1280px`, centered. Recipe grid goes 1 / 2 / 3-4 columns. Recipe detail goes two columns at `lg:` with ingredients sticky next to the steps. Keep the same tilted-card personality.
- **Mobile chrome** (follow the Stitch screens):
  - **Fixed top header**, 64-80px (paper, ink rule below): brand mark + name "בורקס לוהט" with the tagline "חם, פריך ולא שפוי" in the secondary color, and square 44px icon buttons (search, notifications). On inner pages: a back button, a short title, and a share button.
  - **Fixed bottom tab bar**, 80px, 4 tabs: ראשי, מתכונים, מועדפים, מצב אפייה. Ink-colored bar; the active tab is a filled `primary-container` block with a paper outline and a tomato offset shadow, inactive tabs are light text. This replaces a hamburger menu on mobile; on desktop it becomes a normal horizontal nav.
  - Reserve space so fixed bars never cover content (`pt-20`, `pb-28`, and safe-area insets).
- **No emojis, SVG icons only.** Material Symbols via `astro-icon`, plus custom bakery symbols in `src/icons/` (flame, steam, sesame, category icons) and the logo `LogoMark.astro` (flame above a crimped, sesame-dusted triangle burekas; inline SVG because astro-icon flattens multi-color icons). Heat is shown with 1-3 flame icons. The Stitch screens use emojis in chips and badges: replace them with these icons.
- Icons: Material Symbols Outlined, with `FILL 1` for active or emphasized states. Direction icons (arrow, chevron) must mirror in RTL (the screens use `arrow_back` / `chevron_left` as "forward").

## Pages

### Home
1. **Live ticker**: full-bleed scrolling ink strip, saffron text, sesame and flame glyphs between repeats.
2. **Hero poster** (no card wrapper): round rotated seal ("הלהיט של ..."), giant display headline with the tomato highlight label, one-sentence intro, a thick-outlined search field with a tomato button, and a tilted 4:3 photo in a paper frame with a caption sticker. Side by side at `lg:`.
3. **Category chips**: horizontally scrolling icon chips (custom SVG category icons) ("בחרו סגנון למגש"), one active in `primary-container`, others in light surfaces. Full-bleed scroll (negative gutter margin).
4. **Recipe of the week**: a tilted saffron (`primary-container`) "special of the day" board with a tomato sticker label, kashrut pill, heat pill, title, summary, a chef quote block, a two-up stats tile (oven time, yield), and a full-width primary button.
5. **Trending**: vertical stack of recipe cards (see below), section link "לכל המגשים".
6. **Follow banner**: tilted tomato (`secondary`) block with an icon, a display-type line, and a saffron button.

### Recipe list
- **Sticky search + filter header** (blurred `surface`): soft search field with a search icon; row 1 of scrollable filter chips (kashrut: הכל / חלבי / פרווה / בשרי, with icons); row 2 of heat filters (פושר / חם / לוהט, each with a colored dot) and quick time filter ("עד 30 דק׳").
- **Count + sort row**: pulsing dot + "24 מתכונים פריכים", and a sort dropdown ("הכי לוהט כרגע").
- **Recipe card stream**: single column, `gap-6`, alternating tilt and alternating background (`surface-container-low` / `surface-container-lowest`).

### Recipe card (shared component)
- Tilted `rounded-2xl` card with soft shadow, image area 224-240px tall with a dark bottom gradient.
- Top corners: angled sticker (baking time or "recommended") on the start side, round flame/bookmark button on the end side.
- Bottom of image: kashrut badge on one side, heat badge on the other.
- Body: bold title, 2-line summary or a tinted "baker's note" quote, then a meta row (icon + servings/time/crunch) and a compact primary "למתכון המלא ‹" button.

### Recipe detail
Single column in this order (matches `CLAUDE.md`):
1. Quick action bar (recipe name chip, favorite, share, print).
2. **Cover image** (rounded-2xl, about 288px tall, dark gradient), with a "fresh from the oven" glass pill and an angled heritage tag ("מתכון הדגל של סבתא ... • 1968").
3. **Title block** (`surface-container-low`): small category pill, `headline-lg` title, short intro, then a 2x2 grid of meta tiles (heat/difficulty, kashrut, bake time, prep time), each a colored icon square + tiny label + value.
4. **Cook Mode banner**: big `primary-container` button with a pot icon and a short explanation.
5. **Ingredients**: card with servings stepper (- / +) that rescales quantities, grouped by section (dough / filling / topping) with a colored dot per group, and each ingredient a tappable checkbox row ("mark what's on the counter").
6. **Steps**: one card per step, a round numbered badge (`primary-container`, the last step in `secondary-container`), a bold step title, optional small tag (e.g. oven mode), body text indented under the title.
7. **Chef's tip**: tilted `primary-fixed` "paper napkin" card with a translucent tape strip and a lightbulb avatar.
8. **Reviews / community**: rating summary + small review cards with initials avatars and stars.
- Print stylesheet hides chrome and keeps ingredients and steps.

### 404
- Pill "אופס! קטסטרופה במאפייה (קוד שגיאה: 404)", headline "הבורקס נשרף... העמוד הזה הלך לפח!" with the second line highlighted.
- Tilted illustrated card (stacked paper layer behind it) with a burnt-pastry illustration, a sticker, a funny caption, and a heat gauge stuck at "שרוף".
- Reassuring green tip block, then primary button (home) and secondary button (recipes), then a fallback search.

## Components cheat sheet

- **Primary button**: `primary` or `primary-container` fill, `rounded-xl`, bold label, soft shadow, `active:scale-[0.98]`. Hover swaps to `primary` / `secondary-container`.
- **Secondary button**: `surface-container-high` fill, dark text.
- **Highlight button** (community / destructive heat): `secondary` fill with light text.
- **Chip**: `rounded-full` (or `rounded-lg` for small filters), active = `primary-container`.
- **Input**: soft tinted fill (`surface-container-low` or lowest), no border, `rounded-xl`, leading icon, focus = ring or soft glow in the primary tint, 16px text to avoid iOS zoom.
- **Kashrut badges**: dairy = green (`tertiary`), meat = deep red, parve = golden yellow. Always icon + Hebrew label; value stored in English per `CLAUDE.md`.
- **Heat meter** (3 levels): פושר = amber, חם = orange (`secondary-container`), לוהט = deep red-orange (`secondary`), shown with flame icons or a 3-segment bar. Maps to the `difficulty` select.
- **Quote / tip blocks**: tinted block, icon in a round avatar, slight tilt only on the large tip card.

## Hard rules when building

1. Start from the Stitch screens, not from generic recipe-site patterns.
2. Use tokens, never hardcoded hex, so the owner can recolor from one place.
3. Keep the tilt, stickers, tape, and bakery humor. They are the personality.
4. RTL and logical properties everywhere (`CLAUDE.md`). Note that the raw Stitch HTML uses physical `left`/`right`/`pr-`/`pl-`: **translate to `start`/`end`/`ps-`/`pe-`** when porting.
5. The Stitch HTML uses the Tailwind CDN and Google-hosted fonts: **do not copy those**. Use Tailwind v4 via the Vite plugin and self-hosted `@fontsource` fonts.
6. The Stitch HTML has client-side JS (search, servings, favorites). On the public site ship zero JS by default; add small islands only for servings scaling, ingredient checkboxes, and cook mode.
7. Placeholder content in Stitch (names, reviews, "since 1968", ratings) is sample copy. Real content comes from Keystatic, and features with no backing data in the schema (reviews, ratings, notifications) are not built unless the schema grows to support them.
8. Test in RTL at 360, 390, 768, 1024, 1440px with no horizontal scroll at 360px.
