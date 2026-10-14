# בורקס לוהט (Burekas Lohet)

A Hebrew, right-to-left recipe site built with **Astro + Keystatic**, deployed on **Vercel**.
Recipes, categories, authors and site settings live in this repo as files; the live site has a `/keystatic` admin that saves edits as Git commits.

Design: see [`design.md`](./design.md) (feeling and layout come from the Stitch project). Project rules: see [`CLAUDE.md`](./CLAUDE.md).

## Develop

```bash
npm install
npm run dev        # http://localhost:4321  (admin: http://localhost:4321/keystatic, local mode)
npm run build
npx astro check    # type check
```

In dev, Keystatic runs in `local` mode: edits are written straight to `src/content/**` and `src/assets/images/**`.

## Deploy (one-time setup)

1. **GitHub**: create the repo `burekas-lohet` and push `main`. In `keystatic.config.ts` replace `YOUR_GITHUB_USER` with the GitHub user or org.
2. **Vercel**: import the repo (Hobby plan, non-commercial use only). Framework preset: Astro.
3. **GitHub App for Keystatic**: run `npm run dev` with the four variables from `.env.example` empty and open `/keystatic` in GitHub mode (or temporarily set `storage.kind` to `github`); Keystatic walks you through creating the GitHub App and writes the values to `.env`. Alternatively create the app by hand.
4. **Environment variables** (Vercel Project Settings, never commit them):
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
5. **GitHub App callback URL**: `https://hotburekas.vercel.app/api/keystatic/github/oauth/callback`
   (must match the production domain; the admin login does not work on preview deployments).
6. Open `https://hotburekas.vercel.app/keystatic`, sign in with GitHub, and edit.

## Editing workflow (branches)

Keystatic has no roles: anyone with write access to the GitHub repo can edit. In production, new branches created from the admin are prefixed `content/`. Vercel builds a preview for every branch, and you merge to `main` with a pull request. Turn on branch protection for `main` to require review.

## Content model

- `recipes`: Hebrew title + Latin slug, summary, cover, category, author, times, servings, difficulty (heat meter), kashrut, tags, grouped ingredients, Markdoc steps (with a **chef tip** block), draft flag.
- `categories`, `authors`: referenced from recipes by relationship.
- `settings` (singleton): site title, tagline, hero, ticker, recipe of the week, footer.

Select values are stored in English and shown in Hebrew through `src/lib/labels.ts`. Image folders and slug rules are described in `CLAUDE.md`.
