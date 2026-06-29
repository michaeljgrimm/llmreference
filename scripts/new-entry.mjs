#!/usr/bin/env node
// Scaffold a new content record with valid, ready-to-fill frontmatter.
//
// The fastest way to keep the dataset "up to the day": instead of remembering
// every field, run this to drop a correctly-structured stub into the right
// collection, then fill the TODOs and run `npm run check`.
//
//   node scripts/new-entry.mjs <model|provider|researcher|benchmark> <slug> [--name "Display Name"] [--force]
//
// The <slug> becomes the filename and the id used in URLs and reference() links.
// Use lowercase-hyphenated stable slugs (e.g. "claude-opus-4-8", "google-deepmind").
//
// See docs/CONTENT-WORKFLOW.md for the full update workflow.

import { writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COLLECTIONS = ['model', 'provider', 'researcher', 'benchmark'];
const TODAY = new Date().toISOString().slice(0, 10);

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') flags.force = true;
    else if (a === '--name') flags.name = argv[++i];
    else if (a.startsWith('--name=')) flags.name = a.slice('--name='.length);
    else positional.push(a);
  }
  return { positional, flags };
}

function titleCase(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Templates intentionally include the high-value optional fields as TODOs so an
// editor sees the full menu, and a sources entry so provenance is never skipped.
const TEMPLATES = {
  provider: (name) => `---
name: ${name}
# type: company | research-lab | nonprofit | academic | government | individual
type: company
country: # TODO e.g. United States
headquarters: # TODO e.g. San Francisco, California
founded: # TODO year, e.g. 2021
website: # TODO https://...
status: active # active | acquired | defunct
# parentOrg: alphabet            # optional → providers/<slug>
socials:
  twitter: # handle without @
  github: # org slug
dataUpdated: ${TODAY}
sources:
  - title: # TODO source name
    url: # TODO https://...
    date: ${TODAY}
---

TODO: one-paragraph description of the organization.
`,

  model: (name) => `---
name: ${name}
provider: # TODO required → providers/<slug>, e.g. anthropic
family: # TODO e.g. Claude 4
version: # TODO e.g. "4.8" (quote numeric-looking values)
status: available # available | preview | announced | deprecated | retired
releaseDate: # TODO YYYY-MM-DD
knowledgeCutoff: # TODO YYYY-MM-DD
modality:
  input: [text]   # text, image, audio, video, embedding
  output: [text]
contextWindow: # TODO tokens, e.g. 200000
maxOutputTokens: # TODO tokens
parameters: # TODO e.g. "405B" or "undisclosed"
license: # TODO e.g. proprietary | Apache-2.0
openWeights: false
apiId: # TODO stable API id, e.g. claude-opus-4-8
# huggingFaceId: org/model       # for open-weights models
# paper: https://arxiv.org/abs/...
pricing:                          # per-million-token USD; delete block if self-host-only
  inputPerMTok: # TODO
  outputPerMTok: # TODO
  currency: USD
tags: [] # e.g. [frontier, reasoning, coding]
benchmarks: []
# benchmarks:
#   - benchmark: gpqa-diamond     # → benchmarks/<slug>
#     score: 0
#     notes: self-reported
dataUpdated: ${TODAY}
sources:
  - title: # TODO source name
    url: # TODO https://...
    date: ${TODAY}
---

TODO: one-paragraph description of the model.
`,

  researcher: (name) => `---
name: ${name}
# affiliation: anthropic         # → providers/<slug> (preferred if tracked)
affiliationName: # TODO free-text org if not a tracked provider
role: # TODO e.g. Co-founder & Chief Scientist
country: # TODO
notableWork:
  - title: # TODO paper / contribution
    url: # TODO https://...
    year: # TODO
notableModels: [] # e.g. [claude-opus-4-8] → models/<slug>
links:
  homepage: # TODO https://...
  scholar: # https://scholar.google.com/...
  twitter: # handle without @
dataUpdated: ${TODAY}
sources:
  - title: # TODO source name
    url: # TODO https://...
    date: ${TODAY}
---

TODO: short bio.
`,

  benchmark: (name) => `---
name: ${name}
fullName: # TODO spelled-out name
# category: reasoning | coding | math | knowledge | multilingual | vision |
#           audio | safety | agentic | instruction-following | general | other
category: general
metric: # TODO required, e.g. "accuracy %", "pass@1", "Elo"
higherIsBetter: true
maxScore: # TODO e.g. 100 (omit for unbounded like Elo)
url: # TODO leaderboard / dataset page
paper: # TODO https://arxiv.org/abs/...
dataUpdated: ${TODAY}
sources:
  - title: # TODO source name
    url: # TODO https://...
    date: ${TODAY}
---

TODO: one-paragraph description of what the benchmark measures and how.
`,
};

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [kind, slug] = positional;

  if (!kind || !slug || !COLLECTIONS.includes(kind)) {
    console.error(
      `Usage: node scripts/new-entry.mjs <${COLLECTIONS.join('|')}> <slug> [--name "Display Name"] [--force]\n` +
        `Example: node scripts/new-entry.mjs model claude-opus-4-8 --name "Claude Opus 4.8"`,
    );
    process.exit(1);
  }
  if (!SLUG_RE.test(slug)) {
    console.error(`✗ Invalid slug "${slug}". Use lowercase letters, digits, and single hyphens (e.g. gpt-5).`);
    process.exit(1);
  }

  // collection folders are pluralized: model -> models
  const folder = resolve(ROOT, 'src', 'content', `${kind}s`);
  const filePath = resolve(folder, `${slug}.md`);

  if ((await exists(filePath)) && !flags.force) {
    console.error(`✗ ${kind}s/${slug}.md already exists. Pass --force to overwrite.`);
    process.exit(1);
  }

  const name = flags.name ?? titleCase(slug);
  await mkdir(folder, { recursive: true });
  await writeFile(filePath, TEMPLATES[kind](name), 'utf8');

  console.log(`✓ Created src/content/${kind}s/${slug}.md`);
  console.log(`  Next: fill the TODO fields, then run \`npm run check\` to validate.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
