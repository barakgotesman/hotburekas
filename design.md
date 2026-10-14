# design.md — The feel and layout of בורקס לוהט

Source of truth: Stitch project **1604988235901660896** ("Hot Burekas Recipe Website", design system "Hot Burekas Bakery").
Screens studied (downloaded via the Stitch MCP, HTML inspected): home, recipe list, recipe detail, 404.

## How to read this file

- **Colors in this file are overridable.** The owner may change the palette. If a color here conflicts with `src/styles/global.css` `@theme` tokens, the tokens win. Always use semantic token names (`primary`, `secondary`, `surface-container`...), never raw hex in components.
- **Feeling and layout are NOT overridable.** They come from the Stitch project. Re-fetch the project with the Stitch MCP (`get_project`, `list_screens`, `get_screen`) whenever a new page or component is built, and match it.
- The Stitch `designMd` describes hard 2px borders and hard offset shadows. The generated screens actually use **soft tonal layers with no borders and soft warm shadows**. **Follow the screens (the HTML), not that prose**, unless the owner says otherwise.

## The feeling

An Israeli neighborhood bakery (*ma'afiya*) at dawn on a Friday morning. Warm, buttery, a little cheeky, loud and friendly. It is a market stall, not a corporate site.

- **Playful and tactile**: cards are slightly tilted like pastries on a tray, with taped stickers and stamps stuck on top.
- **Warm, never cold**: no stark white canvas, no cold greys or blues. Every neutral is tinted toward dough, parchment, or espresso.
- **Bold Hebrew voice**: heavy chunky headlines, short punchy copy with bakery humor ("חם, פריך, נוטף. ישר מהתנור.", "הבורקס נשרף... העמוד הזה הלך לפח!"). Microcopy should keep this tone: oven, heat, crunch, tray, sesame.
- **Food first**: big, steamy, close-up photography with warm light. Images carry the page.
- **Cooking-friendly**: large tap targets, generous reading size, checkable ingredients, a "cook mode". The person has flour on their hands.

## Color roles (default palette, overridable)

Material-style semantic tokens. Defaults:

| Role | Default | Used for |
|---|---|---|
| `surface` / `background` | `#fff8f6` | Page canvas (warm dough) |
| `surface-container-low` | `#fff1ec` | Default card background |
| `surface-container` | `#ffe9e2` | Inset wells, meta tiles, ingredient rows |
| `surface-container-high` / `highest` | `#ffe2d8` / `#ffdbcd` | Chips, dropdown triggers, banner blocks |
| `surface-container-lowest` | `#ffffff` | Alternate cards, floating buttons, inputs |
| `primary` | `#845400` | Strong CTA fill, links, accents on text |
| `primary-container` | `#e9a23b` | Crust amber: active chips, step numbers, main highlights |
| `secondary` | `#ae3207` | Heat/urgency: hero highlight word, stickers, alerts, icons |
| `secondary-container` | `#fd6a3e` | Hot heat meter level, flame badges |
| `tertiary` / `tertiary-container` | `#486729` / `#98bb72` | Za'atar green: kashrut (dairy) badges, positive states |
| `on-surface` / `on-surface-variant` | `#2a170f` / `#514536` | Text (espresso, never pure black) |
| `inverse-surface` | `#412b22` | Image gradient overlays |

Color behavior (keep even if hues change):
- One warm "hot" accent (secondary) for heat, urgency, and the highlight word in headlines.
- One "crust" accent (primary-container) for primary action and active state.
- One herbal green accent (tertiary) for kashrut and positive confirmation.
- Text is always a dark warm brown, surfaces are always warm tints. Hierarchy is built by stepping through the `surface-container-*` ladder, not with borders.

## Typography

- **Font**: Rubik (has Hebrew). Self-host with `@fontsource` per `CLAUDE.md`, Hebrew subset, weights 400 to 900.
- Scale (mobile / desktop):
  - Display: 36px / 48px, weight 900, tight tracking. Hero only.
  - Headline XL: 28px / 36px, weight 800. Page titles (404, section hero).
  - Headline LG: 28px, weight 700-800. Recipe title.
  - Headline SM: 20px, weight 700. Section titles and card titles.
  - Body LG / MD / SM: 18 / 16 / 14px, weight 400, line-height about 1.5-1.6.
  - Labels: 15px bold (buttons), 13px semibold (meta values, chips), 11px bold with slight tracking (stickers, captions).
- Headlines are heavy and stamped. A hero headline is two lines where the second line is the **highlight line** in the secondary color.
- Chef quotes and tips use italic or a medium weight inside a tinted block with a quote icon.
- Body text never goes below 14px for secondary copy, and 16px for anything a person reads while cooking (steps, ingredients).

## Shape, depth, and motion

- **Corners are generous**: cards `rounded-2xl` (about 16px), inner blocks and buttons `rounded-xl` (about 12px), chips and badges `rounded-full`, small stickers `rounded` / `rounded-md`.
- **No hard borders for structure.** Depth comes from tone changes between surface containers plus a soft, warm, low-opacity shadow (brown-tinted, for example `0 8px 20px rgba(42,23,15,0.08)`), growing slightly on hover.
- **Signature tilt**: cards sit at `-0.8deg` / `+1deg` / `-1deg`, alternating, and straighten to `0` on hover (`transition` 300ms). Tilt is for decorative cards and callouts, **not** for body text or form controls.
- **Stickers**: small angled labels (`-3deg` to `+12deg`) pinned to corners of cards: baking time, "recommended", "too hot". A strip of translucent "tape" sits on top of the chef's tip card.
- **Stamps / seals**: kashrut and heat appear as pills or seals, with an icon (verified, flame) plus a Hebrew label.
- **Glass is only for sticky chrome**: header and bottom nav use `surface` at 90-95% opacity with backdrop blur. Nothing else is glassy.
- **Motion is small and playful**: image zoom on hover (`scale-105`, 500ms), press feedback (`active:scale-95`/`0.98`), a pinging dot for "live" things, a pulsing flame. Everything must respect `prefers-reduced-motion`.

## Layout

The Stitch screens are **mobile-first, single column**, and that is the primary design. Desktop is an enhancement that follows `CLAUDE.md`.

- **Gutters**: `1.25rem` side padding on mobile. Spacing scale: 4 / 8 / 16 / 24 / 40px.
- **Sections** stack with about `1.5rem`-`2.5rem` between them. Each section has a small icon + `headline-sm` title on one side and a small link or tag on the other ("לכל המגשים ‹").
- **Desktop**: 12-column grid capped at about `1280px`, centered. Recipe grid goes 1 / 2 / 3-4 columns. Recipe detail goes two columns at `lg:` with ingredients sticky next to the steps. Keep the same tilted-card personality.
- **Mobile chrome** (follow the Stitch screens):
  - **Fixed top header**, 64-80px: brand mark + name "בורקס לוהט" with the tagline "חם, פריך ולא שפוי" in the secondary color, and square 44px icon buttons (search, notifications). On inner pages: a back button, a short title, and a share button.
  - **Fixed bottom tab bar**, 80px, 4 tabs: ראשי, מתכונים, מועדפים, מצב אפייה. Active tab is a filled `primary-container` pill with a soft glow, inactive tabs are muted. This replaces a hamburger menu on mobile; on desktop it becomes a normal horizontal nav.
  - Reserve space so fixed bars never cover content (`pt-20`, `pb-28`, and safe-area insets).
- Icons: Material Symbols Outlined, with `FILL 1` for active or emphasized states. Direction icons (arrow, chevron) must mirror in RTL (the screens use `arrow_back` / `chevron_left` as "forward").

## Pages

### Home
1. **Live ticker** strip in `secondary`: pulsing dot + one line of bakery news + a "לוהט 🔥" pill.
2. **Hero card** (`surface-container-low`, rounded-xl): angled stamp sticker in a corner ("הלהיט של ..."), heavy two-line headline with the second line highlighted, one-sentence intro, a 4:3 food photo with a small glass caption badge, and a search field with an inline amber button.
3. **Category chips**: horizontally scrolling emoji chips ("בחרו סגנון למגש"), one active in `primary-container`, others in light surfaces. Full-bleed scroll (negative gutter margin).
4. **Recipe of the week**: a tilted `surface-container` card with kashrut pill, heat pill, title, summary, a chef quote block, a two-up stats tile (oven time, yield), and a full-width primary button.
5. **Trending**: vertical stack of recipe cards (see below), section link "לכל המגשים".
6. **Community banner**: centered `surface-container-high` block with an icon, a warm line, and a `secondary` button.

### Recipe list
- **Sticky search + filter header** (blurred `surface`): soft search field with a search icon; row 1 of scrollable filter chips (kashrut: הכל / חלבי / פרווה / בשרי, with emoji); row 2 of heat filters (פושר / חם / לוהט, each with a colored dot) and quick time filter ("עד 30 דק׳").
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
