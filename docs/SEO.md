# SEO & Analytics

How llmreference.com stays findable and how we measure traffic. All of this is
build-time and static — no runtime server, no secrets.

## What's in place

| Concern | Where | Notes |
| --- | --- | --- |
| **Sitemap** | `@astrojs/sitemap` (`astro.config.mjs`) | Emits `/sitemap-index.xml`; linked from every page `<head>` and `robots.txt`. |
| **robots.txt** | `public/robots.txt` | Allows all crawlers; points at the sitemap. |
| **Canonical URLs** | `BaseLayout.astro` | Absolute canonical from `site` + page `path`. Clean directory URLs (`build.format: 'directory'`). |
| **Per-page metadata** | `BaseLayout.astro` | `<title>`, description, Open Graph, Twitter card on every page. `ogType="article"` on entity detail pages. |
| **Default OG image** | `public/og-default.svg` | Used unless a page passes its own `image`. |
| **Site structured data** | `BaseLayout.astro` | `WebSite` + `Organization` JSON-LD on every page. |
| **Entity structured data** | each `pages/<type>/[id].astro` | `SoftwareApplication` (models), `Organization` (providers), `Person` (researchers), `Dataset` + leaderboard `ItemList` (benchmarks). |
| **Breadcrumbs** | `BaseLayout.astro` `breadcrumbs` prop | `BreadcrumbList` JSON-LD on every detail page. |
| **Performance** | Astro SSG | Static HTML, scoped CSS, zero client JS except deferred analytics. |
| **Analytics** | `components/Analytics.astro` | Provider-agnostic, config-driven, off by default. |

## Validate structured data

After a deploy, paste any live URL into:

- Google Rich Results Test — https://search.google.com/test/rich-results
- Schema.org validator — https://validator.schema.org/

Locally, `npm run build` then `npm run preview` and view source — JSON-LD is inlined
in the `<head>` (site/breadcrumb) and near the end of `<main>` (entity).

## Analytics: enabling it

Analytics renders **nothing** until a provider is configured, so the site ships
clean. To turn it on, pick a provider and set the matching build-time env vars.
For production these are GitHub repo **Variables** (Settings → Secrets and
variables → Actions → **Variables** tab — not Secrets; these are public client IDs).
`deploy.yml` already forwards them into the build. After setting them, re-run the
deploy workflow.

| Provider | Cost | Set `PUBLIC_ANALYTICS_PROVIDER` | Plus |
| --- | --- | --- | --- |
| **GoatCounter** | Free (hosted) | `goatcounter` | `PUBLIC_ANALYTICS_SRC` = `https://<you>.goatcounter.com/count` |
| **Cloudflare Web Analytics** | Free | `cloudflare` | `PUBLIC_ANALYTICS_TOKEN` = beacon token |
| **Plausible** | Paid / self-host | `plausible` | `PUBLIC_ANALYTICS_DOMAIN` = site domain (+ optional `PUBLIC_ANALYTICS_SRC`) |
| **Umami** | Free (self-host) | `umami` | `PUBLIC_ANALYTICS_SRC` = script URL + `PUBLIC_ANALYTICS_TOKEN` = website id |

All four are privacy-friendly (no cookies / GDPR banner needed) and load deferred,
so they don't affect first paint. See `.env.example` for local setup.

**Recommendation:** GoatCounter or Cloudflare Web Analytics — both free, zero infra.
Creating the account and getting the ID is an **owner action** (it needs an external
account under the company's name); once you have the ID, enabling it is config-only.
