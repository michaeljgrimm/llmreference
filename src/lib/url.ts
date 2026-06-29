// Base-path-aware URL helper.
//
// The site is served under a base path on GitHub Pages ('/llmreference') and at
// the root once the custom domain is attached ('/'). Astro does NOT rewrite the
// `href` of plain anchor tags, so every internal link must be built through this
// helper to stay correct across both deploy targets.
//
//   href('/models')            -> '/llmreference/models'  (or '/models' at root)
//   href('/models/' + slug)    -> '/llmreference/models/<slug>'

const BASE = import.meta.env.BASE_URL; // always ends in '/' (e.g. '/llmreference/' or '/')

/** Build an absolute (origin-relative) URL for an internal path. */
export function href(path: string): string {
  const clean = path.replace(/^\/+/, '');
  return BASE.endsWith('/') ? BASE + clean : `${BASE}/${clean}`;
}
