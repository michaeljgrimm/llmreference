// Presentation helpers shared across directory and detail pages.

/** Format a date as "May 22, 2025". Returns '—' for undefined. */
export function formatDate(d?: Date): string {
  if (!d) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Format a date as ISO yyyy-mm-dd for <time datetime> / machine fields. */
export function isoDate(d?: Date): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined;
}

/** Human-friendly token count, e.g. 200000 -> "200K", 1000000 -> "1M". */
export function formatTokens(n?: number): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(n % 1_000 ? 1 : 0)}K`;
  return String(n);
}

/** Per-million-token price, e.g. 15 -> "$15.00 / MTok". */
export function formatPrice(n?: number, currency = 'USD'): string {
  if (n == null) return '—';
  const symbol = currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${n.toFixed(2)}`;
}

/** Relative freshness, e.g. "updated 3 days ago". Uses a passed-in `now` so
 *  output is deterministic at build time. */
export function freshness(updated: Date | undefined, now: Date): string | undefined {
  if (!updated) return undefined;
  const days = Math.floor((now.getTime() - updated.getTime()) / 86_400_000);
  if (days <= 0) return 'updated today';
  if (days === 1) return 'updated 1 day ago';
  if (days < 30) return `updated ${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return 'updated 1 month ago';
  if (months < 12) return `updated ${months} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? 'updated 1 year ago' : `updated ${years} years ago`;
}

/** Title-case a kebab/enum value, e.g. "research-lab" -> "Research Lab". */
export function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
