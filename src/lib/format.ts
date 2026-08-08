/**
 * Number formatting for authored content and the system voice.
 *
 * Content files compose their evidence excerpts from the same figure objects the profile
 * metrics are built from, through these helpers — so a figure cannot drift between the
 * number a page displays and the excerpt that sources it.
 */

const GROUPED = new Intl.NumberFormat('en-US');

export function num(value: number): string {
  return GROUPED.format(value);
}

function trim(value: number, dp = 1): string {
  const fixed = value.toFixed(dp);
  return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
}

/** 18_400_000 → "$18.4M"; 214_000 → "$214k"; 940 → "$940". */
export function usd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${trim(value / 1_000_000)}M`;
  if (abs >= 1_000) return `$${trim(value / 1_000, 0)}k`;
  return `$${num(value)}`;
}

/** 93 → "93.0%" */
export function pct(value: number, dp = 1): string {
  return `${value.toFixed(dp)}%`;
}

/** Share of a total, rounded to `dp`. */
export function ratio(part: number, total: number, dp = 1): number {
  return round((part / total) * 100, dp);
}

/** Share of a total, formatted. */
export function ratioPct(part: number, total: number, dp = 1): string {
  return pct(ratio(part, total, dp), dp);
}

export function round(value: number, dp = 1): number {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
}

/** Percentage change between two periods, e.g. revenue growth. */
export function change(current: number, prior: number, dp = 1): number {
  return round(((current - prior) / prior) * 100, dp);
}
