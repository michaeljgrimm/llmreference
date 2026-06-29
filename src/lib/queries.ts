// Typed query helpers over the content collections.
//
// This is the stable data-access layer the public site (LLM-4) builds on. It
// wraps Astro's `getCollection`/`getEntry` with: draft filtering, sensible
// default sorting, and resolvers that hydrate cross-entity references
// (model → provider, model → benchmark, researcher → affiliation/models) so
// pages don't have to chase `reference()` ids by hand.

import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Model = CollectionEntry<'models'>;
export type Provider = CollectionEntry<'providers'>;
export type Researcher = CollectionEntry<'researchers'>;
export type Benchmark = CollectionEntry<'benchmarks'>;

const published =
  () =>
  <T extends { data: { draft: boolean } }>(entry: T): boolean =>
    import.meta.env.PROD ? !entry.data.draft : true;

// ---------------------------------------------------------------------------
// Listing queries (used to build directory/index pages + sitemap)
// ---------------------------------------------------------------------------

/** All published models, newest release first. */
export async function getModels(): Promise<Model[]> {
  const models = await getCollection('models', published());
  return models.sort(
    (a, b) =>
      (b.data.releaseDate?.getTime() ?? 0) - (a.data.releaseDate?.getTime() ?? 0),
  );
}

/** All published providers, alphabetical. */
export async function getProviders(): Promise<Provider[]> {
  const providers = await getCollection('providers', published());
  return providers.sort((a, b) => a.data.name.localeCompare(b.data.name));
}

/** All published researchers, alphabetical. */
export async function getResearchers(): Promise<Researcher[]> {
  const researchers = await getCollection('researchers', published());
  return researchers.sort((a, b) => a.data.name.localeCompare(b.data.name));
}

/** All published benchmarks, alphabetical. */
export async function getBenchmarks(): Promise<Benchmark[]> {
  const benchmarks = await getCollection('benchmarks', published());
  return benchmarks.sort((a, b) => a.data.name.localeCompare(b.data.name));
}

// ---------------------------------------------------------------------------
// Detail queries (used to build [id] detail pages with relations resolved)
// ---------------------------------------------------------------------------

/** A model with its provider and benchmark definitions hydrated. */
export async function getModelDetail(model: Model) {
  const provider = await getEntry(model.data.provider);
  const scores = await Promise.all(
    model.data.benchmarks.map(async (b) => ({
      ...b,
      benchmark: await getEntry(b.benchmark),
    })),
  );
  return { ...model, provider, scores };
}

/** A provider with the models it ships (newest first). */
export async function getProviderDetail(provider: Provider) {
  const all = await getModels();
  const models = all.filter((m) => m.data.provider.id === provider.id);
  const parent = provider.data.parentOrg
    ? await getEntry(provider.data.parentOrg)
    : undefined;
  return { ...provider, models, parent };
}

/** A researcher with affiliation and associated models hydrated. */
export async function getResearcherDetail(researcher: Researcher) {
  const affiliation = researcher.data.affiliation
    ? await getEntry(researcher.data.affiliation)
    : undefined;
  const notableModels = await Promise.all(
    researcher.data.notableModels.map((m) => getEntry(m)),
  );
  return { ...researcher, affiliation, notableModels };
}

/** A benchmark with every model that reports a score on it. */
export async function getBenchmarkDetail(benchmark: Benchmark) {
  const models = await getModels();
  const results = models
    .flatMap((m) =>
      m.data.benchmarks
        .filter((b) => b.benchmark.id === benchmark.id)
        .map((b) => ({ model: m, score: b.score, notes: b.notes })),
    )
    .sort((a, b) =>
      benchmark.data.higherIsBetter ? b.score - a.score : a.score - b.score,
    );
  return { ...benchmark, results };
}
