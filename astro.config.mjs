// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://hotburekas.vercel.app',
  // Public pages are pre-rendered; the Keystatic admin + API routes are server-rendered by the Vercel adapter.
  output: 'static',
  adapter: vercel(),
  // React is only needed by the Keystatic admin UI.
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    icon(),
    // The admin UI must not be listed in the sitemap.
    sitemap({ filter: (page) => !page.includes('/keystatic') }),
  ],
  vite: { plugins: [tailwindcss()] },
});
