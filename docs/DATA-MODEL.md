# Data model

LLM Reference tracks four entities — **Providers**, **Models**, **Researchers**,
and **Benchmarks** — as file-based [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/).

## Why content collections (not a database)

The site is statically generated and hosted on GitHub Pages (see the root
`README.md` for the stack decision). A SQL database would need a server we don't
run. Instead each record is a Markdown file with structured frontmatter:

- **"Up to the day" is a one-file edit.** Change a price, add a benchmark score,
  flip a model to `deprecated`, or add a new model = edit/add one `.md` file and
  push. CI rebuilds and deploys automatically. No migrations, no DB ops.
- **Type-safe + validated.** Every file is validated against a Zod schema
  (`src/content.config.ts`) at build time. A typo, a missing required field, or a
  reference to a non-existent provider **fails the build** — this is our
  "migrates cleanly" gate (see [Schema changes](#schema-changes-migrations)).
- **Relational without a DB.** Cross-entity links use Astro `reference()`, which
  checks the target id exists at build. Resolvers live in `src/lib/queries.ts`.
- **Git is the audit log.** Every data change is a reviewable commit with history.

```
src/
├─ content.config.ts        # Zod schemas — the source of truth for the model
├─ content/
│  ├─ providers/*.md
│  ├─ models/*.md
│  ├─ researchers/*.md
│  └─ benchmarks/*.md
└─ lib/queries.ts           # typed listing + detail queries (LLM-4 builds on this)
```

The **filename is the id** (`models/gpt-4o.md` → id `gpt-4o`), used in URLs and in
`reference()` links. Use lowercase, hyphenated, stable slugs.

## Conventions shared by every entity

| Field         | Type        | Notes |
|---------------|-------------|-------|
| `dataUpdated` | date        | When the record was last verified. Powers freshness badges + sitemap `lastmod`. |
| `sources`     | `{title,url,date?}[]` | Citations backing the structured fields. Default `[]`. |
| `draft`       | boolean     | Hide from the production build without deleting. Default `false`. |

Dates are `YYYY-MM-DD`. **Adding an optional field is always backwards
compatible** — prefer optional + sensible default so old records keep validating.

## Entities

### Provider — `src/content/providers/<slug>.md`
The org that builds models.

`name`, `legalName?`, `type` (company · research-lab · nonprofit · academic ·
government · individual), `country?`, `headquarters?`, `founded?` (year),
`website?`, `parentOrg?` (→ provider, e.g. Google DeepMind → Alphabet),
`status` (active · acquired · defunct), `socials?`, `logo?`. Body = description.

### Model — `src/content/models/<slug>.md`
The central entity.

- **Identity:** `name`, `provider` (→ provider), `family?`, `version?`,
  `status` (available · preview · announced · deprecated · retired).
- **Dates:** `releaseDate?`, `announcedDate?`, `deprecationDate?`,
  `knowledgeCutoff?`.
- **Capabilities:** `modality.input[]` / `modality.output[]`
  (text · image · audio · video · embedding), `contextWindow?` (tokens),
  `maxOutputTokens?`, `parameters?` (string — often estimated/undisclosed).
- **Commercial:** `pricing.{inputPerMTok,outputPerMTok,cachedInputPerMTok,currency}?`
  (per-million-token; omit for self-host-only), `license?`, `openWeights`.
- **Refs/ids:** `apiId?`, `huggingFaceId?`, `paper?`.
- **Benchmarks:** `benchmarks[]` of
  `{ benchmark (→ benchmark), score, unit?, date?, source?, notes? }`.
- `tags[]`. Body = description.

Scores live **on the model**, not the benchmark — so updating a model's numbers
touches only that one file.

### Researcher — `src/content/researchers/<slug>.md`
`name`, `affiliation?` (→ provider) or `affiliationName?` (free text),
`role?`, `country?`, `notableWork[]` (`{title,url?,year?}`),
`notableModels[]` (→ model), `links?` (homepage/scholar/twitter/github).
Body = bio.

### Benchmark — `src/content/benchmarks/<slug>.md`
Canonical definition of an evaluation. `name`, `fullName?`,
`category` (reasoning · coding · math · knowledge · multilingual · vision ·
audio · safety · agentic · instruction-following · general · other),
`metric` (e.g. "accuracy %", "pass@1", "Elo"), `higherIsBetter`, `maxScore?`,
`url?`, `paper?`. Body = methodology.

## Querying (for page authors — LLM-4)

`src/lib/queries.ts` is the data-access layer. It filters drafts in production,
sorts sensibly, and hydrates references so pages get resolved objects:

```ts
import { getModels, getModelDetail, getBenchmarkDetail } from '../lib/queries';

const models = await getModels();                 // listing, newest first
const detail = await getModelDetail(models[0]);   // .provider + .scores[].benchmark resolved
// also: getProviders/getProviderDetail, getResearchers/getResearcherDetail,
//       getBenchmarks/getBenchmarkDetail (reverse leaderboard of models by score)
```

Generate detail routes with `getStaticPaths()` over the listing query and the
file id as `[id]`.

## Adding / updating data (the "up to the day" workflow)

1. Create or edit the `.md` file under the right `src/content/<entity>/` folder.
2. Set `dataUpdated` and add a `sources` entry.
3. `npm run check` (validates locally) → commit → push. CI rebuilds + deploys.

A bad reference or missing field fails `npm run check` and the PR build, so broken
data never reaches production. The repeatable bulk-ingest tooling is LLM-5.

## Schema changes (migrations)

Because storage is files validated by code, schema evolution is code + content,
not SQL DDL:

- **Additive (optional field):** edit `content.config.ts`, ship. No content change
  needed — existing files still validate. This is the common case.
- **Breaking (rename/require/re-type a field):** update the schema, then update
  every affected file in the same PR (a small `node`/`sed` codemod for bulk
  renames). `npm run check` enumerates every file that still violates the new
  schema, giving an exact, build-enforced migration checklist. Nothing deploys
  until all records conform — the equivalent of a migration running cleanly.
