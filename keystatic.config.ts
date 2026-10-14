import { config } from '@keystatic/core';
import { AdminLogoMark } from './src/lib/admin-logo';
// Each content type lives in its own file under src/keystatic/ (fields are defined there).
import { recipes } from './src/keystatic/recipes';
import { categories } from './src/keystatic/categories';
import { authors } from './src/keystatic/authors';
import { settings } from './src/keystatic/settings';

export default config({
  // Dev: edits are written straight to disk. Production: every save is a commit to GitHub.
  storage: import.meta.env.PROD
    ? {
        kind: 'github',
        repo: { owner: 'barakgotesman', name: 'hotburekas' },
        // Editors work on `content/...` branches; Vercel builds a preview per branch and `main` stays protected.
        branchPrefix: 'content/',
      }
    : { kind: 'local' },

  ui: {
    brand: { name: 'בורקס לוהט', mark: AdminLogoMark },
    // Sidebar groups. Keys are collection/singleton names; sections become headings.
    navigation: {
      Content: ['recipes', 'categories', 'authors'],
      Settings: ['settings'],
    },
  },

  collections: { recipes, categories, authors },
  singletons: { settings },
});
