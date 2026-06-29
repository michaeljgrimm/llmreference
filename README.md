# LLM Reference

The up-to-the-day reference database for large language models — **models, providers,
researchers, and benchmarks**. Source for **www.llmreference.com**.

> Status: public directory is **live** — browse/search models and open detail pages for
> models, providers, researchers, and benchmarks. Auto-deploys on every push to `main`.
>
> **Data model:** four file-based content collections (models, providers, researchers,
> benchmarks) with type-safe Zod schemas and cross-entity references — see
> [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md).

**Live URL:** https://michaeljgrimm.github.io/llmreference/

---

## Stack decision

| Concern   | Choice | Why |
|-----------|--------|-----|
| Framework | **[Astro](https://astro.build) 5** (TypeScript) | Content/reference sites are Astro's sweet spot. Ships zero JS by default → fast loads and strong Core Web Vitals, which are SEO ranking factors. Static output (SSG) is cheap to host and easy to cache. Per-route opt-in to SSR/islands later without a rewrite. |
| Hosting   | **GitHub Pages** | $0, no extra accounts or secrets, deploys straight from CI using the built-in `GITHUB_TOKEN`. Fastest path to a public URL. Clean migration path to Cloudflare Pages / Vercel when we need SSR/ISR or edge functions. |
| CI/CD     | **GitHub Actions** | Native to the repo. `main` → build → deploy. PRs run a build+typecheck gate. |
| SEO       | Per-page canonical/OG/Twitter tags, JSON-LD structured data (`WebSite` + `Organization`), `@astrojs/sitemap`, `robots.txt`, semantic HTML. | The site must be findable to become profitable. |

**Why not Next.js / Vercel right now?** Next is heavier than this content-first site needs,
and Vercel/Cloudflare deploys require a third-party account + API token (a secret). Astro on
GitHub Pages gets us a public, auto-deploying URL today with zero credentials. If/when we need
SSR, ISR, or edge personalization, Astro adds an adapter (`@astrojs/vercel`,
`@astrojs/cloudflare`) without touching components — see [Migration](#migrating-hosting--domain).

## Project layout

```
llmreference/
├─ astro.config.mjs        # site/base configurable via SITE_URL / BASE_PATH env
├─ docs/DATA-MODEL.md      # entity schemas + the "up to the day" update workflow
├─ src/
│  ├─ content.config.ts          # Zod schemas for the 4 collections (source of truth)
│  ├─ content/<entity>/*.md       # the data: models, providers, researchers, benchmarks
│  ├─ lib/queries.ts             # typed listing + detail queries (relations resolved)
│  ├─ lib/url.ts                 # href() — base-path-aware internal links
│  ├─ lib/format.ts             # date/token/price/freshness display helpers
│  ├─ components/SiteHeader.astro # shared top nav
│  ├─ layouts/BaseLayout.astro   # <head>, SEO meta, JSON-LD, OG/Twitter
│  ├─ pages/index.astro          # homepage (links into the directory)
│  ├─ pages/models/             # /models listing (search+filter) + /models/[id] detail
│  ├─ pages/providers/          # /providers listing + /providers/[id] detail
│  ├─ pages/researchers/        # /researchers listing + /researchers/[id] detail
│  ├─ pages/benchmarks/         # /benchmarks listing + /benchmarks/[id] (leaderboard)
│  └─ styles/global.css
├─ public/                 # static passthrough: favicon, og image, robots.txt
└─ .github/workflows/
   ├─ deploy.yml           # push to main → build → deploy to GitHub Pages
   └─ ci.yml               # PRs → typecheck + build gate
```

## Run locally

Requires Node ≥ 20.3.

```bash
npm install
npm run dev        # http://localhost:4321/llmreference
```

Other scripts:

```bash
npm run build      # production build → ./dist
npm run preview    # serve the production build locally
npm run check      # astro check (TypeScript + template diagnostics)
```

## Deployment

Deployment is **fully automatic**: every push to `main` triggers
`.github/workflows/deploy.yml`, which builds the site and publishes `./dist` to GitHub Pages.
No manual steps, no secrets.

One-time repo setup (already done for this repo): in **Settings → Pages**, set
**Source = GitHub Actions**.

To deploy: just `git push origin main`. Watch progress in the **Actions** tab; the live URL
appears in the `deploy` job summary.

### Migrating hosting / domain

The deploy is parameterized so moving to the production domain is config-only:

- **Custom domain `www.llmreference.com`:** point DNS (CNAME `www` → `michaeljgrimm.github.io`)
  and set the domain in **Settings → Pages**. Then set `SITE_URL=https://www.llmreference.com`
  and `BASE_PATH=/` (env in the deploy workflow), add a `public/CNAME` file, and update the
  `Sitemap:` line in `robots.txt`. ⚠️ Requires domain ownership/DNS access — **owner action**.
- **Switch to Cloudflare Pages / Vercel (for SSR/ISR):** add the matching Astro adapter and a
  deploy token. Components and routes are unaffected because URLs use `import.meta.env.BASE_URL`
  and `Astro.site`.

## Conventions (for future contributors)

- TypeScript strict (`astro/tsconfigs/strict`). Keep `npm run check` green — CI enforces it.
- All page `<head>` content goes through `BaseLayout.astro`; pass `title`/`description`/`path`
  so canonical, OG, and sitemap stay correct.
- Reference internal URLs with the `href()` helper from `src/lib/url.ts` (never hard-code
  `/llmreference`) so the base-path/custom-domain switch stays a one-line config change.
- Pages are statically generated; cross-entity links and detail pages come from
  `src/lib/queries.ts`. The model directory's search/filter is progressive enhancement — all
  rows are server-rendered and indexable; the inline script only toggles visibility, so the
  page works (and ranks) with JavaScript disabled.
