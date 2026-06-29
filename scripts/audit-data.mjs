#!/usr/bin/env node
// Data freshness & provenance audit.
//
// `npm run check` (astro/Zod) guarantees every record is *structurally* valid and
// that cross-references resolve. This script covers the things a schema can't:
// is the data still fresh, and is it cited? It is the recurring chore that keeps
// the dataset "up to the day" with low effort — run it (or let CI run it weekly)
// to get a punch-list of what to refresh.
//
//   node scripts/audit-data.mjs [--stale-days 120] [--strict] [--json]
//
//   --stale-days N  records whose dataUpdated is older than N days are "stale"
//                   (default 120).
//   --strict        exit 1 if any ERROR-level issue is found (use in CI).
//   --json          machine-readable output.
//
// ERROR-level   : published record with no sources (uncited data — credibility risk).
// WARNING-level : stale dataUpdated, or missing dataUpdated entirely.
// INFO          : draft records (excluded from the public build).

import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = resolve(ROOT, 'src', 'content');
const COLLECTIONS = ['providers', 'models', 'researchers', 'benchmarks'];

function parseArgs(argv) {
  const flags = { staleDays: 120, strict: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--strict') flags.strict = true;
    else if (a === '--json') flags.json = true;
    else if (a === '--stale-days') flags.staleDays = Number(argv[++i]);
    else if (a.startsWith('--stale-days=')) flags.staleDays = Number(a.split('=')[1]);
  }
  return flags;
}

/** Extract and parse the YAML frontmatter block of a Markdown file. */
function frontmatter(raw) {
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = raw.slice(raw.indexOf('\n') + 1, end);
  return parseYaml(block) ?? {};
}

function daysBetween(a, b) {
  return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const now = new Date();
  const records = [];

  for (const collection of COLLECTIONS) {
    let files;
    try {
      files = (await readdir(resolve(CONTENT, collection))).filter((f) => f.endsWith('.md'));
    } catch {
      files = [];
    }
    for (const file of files) {
      const id = file.replace(/\.md$/, '');
      const raw = await readFile(resolve(CONTENT, collection, file), 'utf8');
      const data = frontmatter(raw);
      if (!data) {
        records.push({ collection, id, issues: [{ level: 'error', msg: 'no/invalid frontmatter' }] });
        continue;
      }

      const issues = [];
      const draft = data.draft === true;
      const sources = Array.isArray(data.sources) ? data.sources : [];

      if (!draft && sources.length === 0) {
        issues.push({ level: 'error', msg: 'no sources — published data must be cited' });
      }
      if (!data.dataUpdated) {
        issues.push({ level: 'warn', msg: 'missing dataUpdated' });
      } else {
        const updated = new Date(data.dataUpdated);
        const age = daysBetween(now, updated);
        if (age > flags.staleDays) {
          issues.push({ level: 'warn', msg: `stale: last verified ${age}d ago (> ${flags.staleDays}d)` });
        }
      }
      if (draft) issues.push({ level: 'info', msg: 'draft (hidden in production)' });

      records.push({ collection, id, draft, sources: sources.length, issues });
    }
  }

  const counts = Object.fromEntries(
    COLLECTIONS.map((c) => [c, records.filter((r) => r.collection === c).length]),
  );
  const errors = records.flatMap((r) => r.issues.filter((i) => i.level === 'error').map(() => r));
  const warns = records.flatMap((r) => r.issues.filter((i) => i.level === 'warn').map(() => r));

  if (flags.json) {
    console.log(JSON.stringify({ counts, records, errorCount: errors.length, warnCount: warns.length }, null, 2));
  } else {
    console.log('LLM Reference — data audit\n');
    console.log(
      'Records:  ' +
        COLLECTIONS.map((c) => `${counts[c]} ${c}`).join('  ·  ') +
        `  (${records.length} total)\n`,
    );
    const withIssues = records.filter((r) => r.issues.some((i) => i.level !== 'info'));
    if (withIssues.length === 0) {
      console.log('✓ No freshness or citation issues.');
    } else {
      for (const r of withIssues) {
        for (const i of r.issues) {
          if (i.level === 'info') continue;
          const tag = i.level === 'error' ? 'ERROR' : 'WARN ';
          console.log(`  [${tag}] ${r.collection}/${r.id}: ${i.msg}`);
        }
      }
    }
    console.log(`\nSummary: ${errors.length} error(s), ${warns.length} warning(s).`);
    if (errors.length) console.log('Fix ERRORs (add `sources:`) before publishing.');
  }

  if (flags.strict && errors.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
