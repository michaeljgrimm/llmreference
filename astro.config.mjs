// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deploy target is configurable via env so we can move from GitHub Pages
// (project site, served under a base path) to the custom domain
// www.llmreference.com without touching component code.
//
//   SITE  – absolute origin used for canonical URLs, sitemap, and OG tags.
//   BASE  – sub-path the app is served from ('/llmreference' on GitHub Pages,
//           '/' once a custom apex/www domain is attached).
//
// Defaults below match the current GitHub Pages project deployment.
const SITE = process.env.SITE_URL ?? 'https://michaeljgrimm.github.io';
const BASE = process.env.BASE_PATH ?? '/llmreference';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    // Emit clean directory-style URLs (/about/ instead of /about.html) for SEO.
    format: 'directory',
  },
});
