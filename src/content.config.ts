// Core data model for LLM Reference.
//
// Four content collections — providers, models, researchers, benchmarks — each
// backed by Markdown files under src/content/<collection>/. Frontmatter holds the
// structured (queryable) fields; the Markdown body holds editorial prose
// (descriptions, methodology, bios). Astro validates every file against the Zod
// schemas below at build time, so a malformed or out-of-date record fails CI
// instead of shipping — this is our "migration" gate for a file-based store.
//
// Design goals:
//   • "Up to the day" updates are cheap: changing a price, adding a benchmark
//     score, or shipping a new model is a one-file edit + push → CI auto-deploys.
//   • Extensible: every entity carries optional `sources` + `dataUpdated` for
//     provenance/freshness, and adding an optional field is always backwards
//     compatible (no data migration needed).
//   • Relational without a database: cross-entity links use Astro `reference()`,
//     which validates that the target id exists at build time.
//
// See docs/DATA-MODEL.md for field-by-field documentation and the update workflow.

import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

/** A cited source backing one or more fields on a record (provenance + trust). */
const source = z.object({
  title: z.string(),
  url: z.string().url(),
  /** When the source was published or last checked (YYYY-MM-DD). */
  date: z.coerce.date().optional(),
});

/** Fields shared by every entity: provenance and freshness. */
const provenance = {
  /** Date this record's data was last verified/updated (YYYY-MM-DD). Drives
   *  "updated X ago" freshness badges and sitemap lastmod. */
  dataUpdated: z.coerce.date().optional(),
  /** Citations supporting the structured fields. */
  sources: z.array(source).default([]),
  /** Hide from the public site without deleting the file (drafts/embargoes). */
  draft: z.boolean().default(false),
};

const modalityValues = ['text', 'image', 'audio', 'video', 'embedding'] as const;

// ---------------------------------------------------------------------------
// Providers — the orgs that build models (labs, companies, etc.)
// ---------------------------------------------------------------------------

const providers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/providers' }),
  schema: z.object({
    name: z.string(),
    legalName: z.string().optional(),
    type: z
      .enum(['company', 'research-lab', 'nonprofit', 'academic', 'government', 'individual'])
      .default('company'),
    /** ISO country name or code of primary HQ. */
    country: z.string().optional(),
    headquarters: z.string().optional(),
    founded: z.number().int().optional(),
    website: z.string().url().optional(),
    /** Parent org, e.g. Google DeepMind → Alphabet. */
    parentOrg: reference('providers').optional(),
    status: z.enum(['active', 'acquired', 'defunct']).default('active'),
    socials: z
      .object({
        twitter: z.string().optional(),
        github: z.string().optional(),
        linkedin: z.string().optional(),
        huggingface: z.string().optional(),
      })
      .partial()
      .optional(),
    logo: z.string().optional(),
    ...provenance,
  }),
});

// ---------------------------------------------------------------------------
// Benchmarks — standardized evaluations. Scores live on the model that was
// evaluated (see models.benchmarks), keeping "up to the day" edits local to the
// model file. A benchmark record is the canonical definition of the metric.
// ---------------------------------------------------------------------------

const benchmarks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/benchmarks' }),
  schema: z.object({
    name: z.string(),
    fullName: z.string().optional(),
    category: z
      .enum([
        'reasoning',
        'coding',
        'math',
        'knowledge',
        'multilingual',
        'vision',
        'audio',
        'safety',
        'agentic',
        'instruction-following',
        'general',
        'other',
      ])
      .default('other'),
    /** Unit the score is expressed in, e.g. "accuracy %", "pass@1", "Elo". */
    metric: z.string(),
    higherIsBetter: z.boolean().default(true),
    maxScore: z.number().optional(),
    url: z.string().url().optional(),
    paper: z.string().url().optional(),
    ...provenance,
  }),
});

// ---------------------------------------------------------------------------
// Models — the central entity.
// ---------------------------------------------------------------------------

/** One benchmark result attached to a model. */
const benchmarkScore = z.object({
  benchmark: reference('benchmarks'),
  score: z.number(),
  /** Override the benchmark's default unit if reported differently. */
  unit: z.string().optional(),
  /** When this score was reported (YYYY-MM-DD). */
  date: z.coerce.date().optional(),
  source: z.string().url().optional(),
  /** e.g. "0-shot", "CoT", "self-reported", "with tools". */
  notes: z.string().optional(),
});

const models = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/models' }),
  schema: z.object({
    name: z.string(),
    provider: reference('providers'),
    /** Marketing/architecture family, e.g. "GPT-4", "Claude 3", "Llama 3". */
    family: z.string().optional(),
    version: z.string().optional(),
    status: z
      .enum(['available', 'preview', 'announced', 'deprecated', 'retired'])
      .default('available'),

    releaseDate: z.coerce.date().optional(),
    announcedDate: z.coerce.date().optional(),
    deprecationDate: z.coerce.date().optional(),
    knowledgeCutoff: z.coerce.date().optional(),

    /** Supported input/output modalities. */
    modality: z
      .object({
        input: z.array(z.enum(modalityValues)).default(['text']),
        output: z.array(z.enum(modalityValues)).default(['text']),
      })
      .default({ input: ['text'], output: ['text'] }),

    /** Context length in tokens. */
    contextWindow: z.number().int().optional(),
    maxOutputTokens: z.number().int().optional(),
    /** Parameter count as reported, kept as string (often "70B", est., or undisclosed). */
    parameters: z.string().optional(),

    /** Per-million-token pricing. Omit for open-weights/self-host-only models. */
    pricing: z
      .object({
        inputPerMTok: z.number().optional(),
        outputPerMTok: z.number().optional(),
        cachedInputPerMTok: z.number().optional(),
        currency: z.string().default('USD'),
      })
      .partial({ inputPerMTok: true, outputPerMTok: true, cachedInputPerMTok: true })
      .optional(),

    /** SPDX id or label, e.g. "proprietary", "Apache-2.0", "Llama-3.1-Community". */
    license: z.string().optional(),
    openWeights: z.boolean().default(false),

    /** Stable API identifier, e.g. "claude-opus-4-8", "gpt-4o-2024-08-06". */
    apiId: z.string().optional(),
    huggingFaceId: z.string().optional(),
    paper: z.string().url().optional(),

    benchmarks: z.array(benchmarkScore).default([]),
    tags: z.array(z.string()).default([]),
    ...provenance,
  }),
});

// ---------------------------------------------------------------------------
// Researchers — the people behind the work.
// ---------------------------------------------------------------------------

const researchers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/researchers' }),
  schema: z.object({
    name: z.string(),
    /** Current primary affiliation (org in the providers collection). */
    affiliation: reference('providers').optional(),
    /** Free-text affiliation when not (yet) a tracked provider. */
    affiliationName: z.string().optional(),
    role: z.string().optional(),
    country: z.string().optional(),
    /** Notable papers/contributions. */
    notableWork: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url().optional(),
          year: z.number().int().optional(),
        }),
      )
      .default([]),
    /** Models this person is closely associated with. */
    notableModels: z.array(reference('models')).default([]),
    links: z
      .object({
        homepage: z.string().url().optional(),
        scholar: z.string().url().optional(),
        twitter: z.string().optional(),
        github: z.string().optional(),
      })
      .partial()
      .optional(),
    ...provenance,
  }),
});

export const collections = { providers, models, researchers, benchmarks };
