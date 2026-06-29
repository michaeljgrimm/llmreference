# Content workflow — keeping the dataset up to the day

This is the repeatable, low-effort process for adding and updating LLM Reference
data. It's written for a **Data/Content Curator** (no framework knowledge needed)
as much as for engineers. The data model itself is documented in
[`DATA-MODEL.md`](DATA-MODEL.md); this doc is the *process*.

> **TL;DR** — every record is one Markdown file. To change data you edit/add a
> file, cite a source, and push. CI validates and deploys. `npm run audit` tells
> you what's gone stale.

## The two guarantees

1. **Nothing invalid ships.** `npm run check` (and the PR build) validate every
   file against the Zod schemas, including that cross-references (`provider:`,
   `benchmark:`) point at records that exist. A typo or dangling reference fails
   the build instead of reaching the site.
2. **Nothing uncited ships unnoticed.** `npm run audit` flags any published
   record with no `sources`, and any record whose `dataUpdated` has gone stale.
   The weekly CI freshness job runs the same audit so drift surfaces on its own.

## Adding a new record

```bash
# 1. Scaffold a correctly-structured stub (folder + required fields + a sources entry)
npm run new model claude-opus-4-8 -- --name "Claude Opus 4.8"
#        └ model | provider | researcher | benchmark
#                 └ the slug = filename = id used in URLs and references

# 2. Fill in the TODO fields in the new file, e.g. src/content/models/claude-opus-4-8.md
#    - set provider: to an existing providers/<slug>
#    - add at least one real sources: entry (title + url)

# 3. Validate, then commit + push
npm run check
git add -A && git commit -m "Add Claude Opus 4.8" && git push
```

(The `--` before `--name` is npm's separator that forwards the flag to the script.)

CI rebuilds and deploys on push to `main`. That's the whole loop.

### What to fill in

- Always set **`dataUpdated`** to today and add a **`sources`** entry — these are
  what make the data trustworthy and what the audit checks. The scaffold
  pre-fills today's date and an empty source for you.
- Slugs are **permanent ids**: other records reference them and URLs are built
  from them. Pick a stable lowercase-hyphenated slug and don't rename it later
  (renaming a file = renaming the id = breaking inbound references and links).

## Updating an existing record ("up to the day")

Open the file under `src/content/<entity>/` and edit in place. Common updates:

| Change | Edit |
|--------|------|
| Price change | `pricing.inputPerMTok` / `outputPerMTok` |
| New benchmark score | append to the model's `benchmarks:` list |
| Model deprecated/retired | `status:` + `deprecationDate:` |
| New flagship model | `npm run new model <slug>` |
| Org acquired / renamed | provider `status:` / `name:` |

**Every time you touch a record, bump `dataUpdated` to today and make sure a
`sources` entry backs the change.** `dataUpdated` powers the freshness badges and
the sitemap `lastmod`, so keeping it honest directly helps SEO and user trust.

## Checking what needs attention

```bash
npm run audit                 # full freshness + citation report
npm run audit -- --stale-days 60   # tighten the "stale" threshold
npm run audit:strict          # exit 1 if any uncited published record (CI uses this)
```

The audit prints counts per collection and a punch-list:

- **ERROR** — a published record with no `sources`. Fix before shipping.
- **WARN** — `dataUpdated` is missing or older than the stale threshold. Re-verify
  the data against a current source and bump the date.

This is the recurring chore that keeps the set current: run the audit, work the
list top to bottom, push. With ~weekly cadence the dataset never drifts far.

## Bulk / scripted import

The store is plain files, so bulk ingestion is just "write files." For a batch
(e.g. importing a provider's full model lineup), the lowest-effort path today is:

1. Scaffold each slug with `npm run new`, or generate the files directly — a
   record is just frontmatter matching `src/content.config.ts`.
2. `npm run check` enumerates every field still missing or malformed across the
   whole batch, giving an exact fill-in checklist.
3. `npm run audit` confirms each new record is cited before you push.

A provider-specific importer (e.g. pulling the OpenAI/Anthropic model list from
their API into stub files) can be added under `scripts/` later if a single source
becomes worth automating; the file format is the stable contract it would target.

## Why this stays low-effort

- **One file = one edit = one deploy.** No database, no migrations, no admin UI to
  maintain. Editing data is editing text.
- **The schema is the spec.** Curators don't need to memorize fields — `npm run
  new` scaffolds them and `npm run check` enforces them.
- **Drift is detected, not hoped against.** `npm run audit` + the weekly CI job
  turn "is anything out of date?" into an automatic report instead of a manual
  sweep.
- **Git is the audit trail.** Every data change is a reviewable, revertable commit
  with a source in the diff.
