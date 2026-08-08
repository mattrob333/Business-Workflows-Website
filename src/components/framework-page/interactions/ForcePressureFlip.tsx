'use client';

/**
 * The Five Forces explore interaction: **flip an assumption, re-read the terrain**.
 *
 * The showpiece already lets a visitor scrub the five scores by hand, which teaches
 * sensitivity. This teaches something harder and more specific: a force score is a
 * *consequence* of a fact about the world, so the honest way to move one is to name the fact
 * and change it. Each flip below is a real, dated statement from Beacon's pack turned around
 * — the distributor's lead times going back to what they were, the largest accounts signing
 * multi-year cover, a national contractor arriving in the region.
 *
 * Two of the flips reorder the pressures; none of them changes the number of projects that
 * leave the building. That is the point of the panel at the bottom, and it is why this page
 * hands off to the conductor rather than to a pricing decision: Five Forces sets the ceiling
 * on margin, and something else entirely sets the ceiling on volume.
 *
 * Island rules (see `./BmcStaleExplorer` for the reference): every sourced figure arrives as
 * a node rendered on the server, the island decides only what is visible, and levels are
 * printed as words rather than scores so the walk's digit sweep over this section stays
 * absolute — a numeral here would have to sit inside a claim block that cites its source.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';

export interface PressureForce {
  id: string;
  label: string;
  /** 0–10 baseline. Never printed — it drives a bar width and a word. */
  base: number;
  /** One digit-free line: what sets this force here. */
  basis: string;
  /** The sourced figure behind the baseline, rendered on the server. */
  evidence: ReactNode;
}

export interface PressureFlip {
  id: string;
  /** Written as the fact, not as the score: "lead times return to four weeks". */
  label: string;
  /** Per-force adjustments applied while the flip is on. */
  deltas: Record<string, number>;
  /** What this does to the reading, in words. */
  implication: string;
  /** The sourced claim that makes the flip plausible, rendered on the server. */
  note: ReactNode;
}

export interface ForcePressureFlipProps {
  forces: PressureForce[];
  flips: PressureFlip[];
  /** The claim that survives every flip. Rendered on the server. */
  invariant: ReactNode;
}

/** Six bands, so a two-point swing is visible without printing a score. */
const BANDS: [number, string][] = [
  [8, 'severe'],
  [6.5, 'high'],
  [5, 'elevated'],
  [3.5, 'moderate'],
  [2, 'low'],
  [0, 'slight'],
];

function band(score: number): string {
  for (const [floor, word] of BANDS) if (score >= floor) return word;
  return 'slight';
}

const clamp = (n: number) => Math.min(10, Math.max(0, n));

export function ForcePressureFlip({ forces, flips, invariant }: ForcePressureFlipProps) {
  const [on, setOn] = useState<Record<string, boolean>>({});

  const { scored, strongest, anyOn } = useMemo(() => {
    const active = flips.filter((flip) => on[flip.id]);
    const rows = forces.map((force) => {
      const delta = active.reduce((sum, flip) => sum + (flip.deltas[force.id] ?? 0), 0);
      return { force, score: clamp(force.base + delta), delta };
    });
    const top = rows.reduce<(typeof rows)[number] | null>(
      (best, row) => (best === null || row.score > best.score ? row : best),
      null,
    );
    return { scored: rows, strongest: top, anyOn: active.length > 0 };
  }, [forces, flips, on]);

  const activeFlips = flips.filter((flip) => on[flip.id]);

  return (
    <div
      data-testid="forces-flip"
      data-strongest={strongest?.force.id ?? ''}
      data-flips-on={activeFlips.length}
      className="grid gap-6"
    >
      <div>
        <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
          change the fact, not the score
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {flips.map((flip) => {
            const active = on[flip.id] ?? false;
            return (
              <div key={flip.id} className="grid gap-2">
                <button
                  type="button"
                  aria-pressed={active}
                  data-flip={flip.id}
                  onClick={() => setOn((prev) => ({ ...prev, [flip.id]: !prev[flip.id] }))}
                  className={`${FOCUS_RING} flex h-full items-start gap-3 rounded-md border px-3 py-3 text-left transition-colors`}
                  style={{
                    borderColor: active
                      ? 'color-mix(in srgb, var(--flow) 55%, transparent)'
                      : 'var(--line)',
                    background: active
                      ? 'color-mix(in srgb, var(--flow-deep) 16%, transparent)'
                      : 'transparent',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-[3px] inline-block h-[11px] w-[11px] shrink-0 rounded-[3px] border"
                    style={{
                      borderColor: active ? 'var(--flow)' : 'var(--line-strong)',
                      background: active ? 'var(--flow)' : 'transparent',
                    }}
                  />
                  <span>
                    <span className="block text-[14px] leading-snug" style={{ color: 'var(--ink)' }}>
                      {flip.label}
                    </span>
                    <span
                      className={`${MONO_LABEL} mt-[3px] block text-[9px]`}
                      style={{ color: active ? 'var(--flow)' : 'var(--faint)' }}
                    >
                      {active ? 'assumed · forces re-scored' : 'assume this'}
                    </span>
                  </span>
                </button>
                {flip.note}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
          pressure on the firm
        </div>
        <ul className="mt-3 grid gap-3">
          {scored.map(({ force, score, delta }) => {
            const moved = delta !== 0;
            const level = band(score);
            return (
              <li
                key={force.id}
                data-force-row={force.id}
                data-level={level}
                data-moved={moved ? (delta > 0 ? 'up' : 'down') : 'none'}
                className="grid gap-2"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--ink)' }}>
                    {force.label}
                  </span>
                  <span
                    className="font-system text-[12px]"
                    style={{ color: moved ? 'var(--flow)' : 'var(--muted)' }}
                  >
                    {level}
                    {moved ? (delta > 0 ? ' · presses harder' : ' · eases') : ''}
                  </span>
                  <span className="text-[13px] leading-snug" style={{ color: 'var(--faint)' }}>
                    {force.basis}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="h-[6px] w-full overflow-hidden rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--surface) 80%, transparent)' }}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${score * 10}%`,
                      background: moved ? 'var(--flow)' : 'var(--flow-deep)',
                    }}
                  />
                </div>
                {force.evidence}
              </li>
            );
          })}
        </ul>
      </div>

      <div
        aria-live="polite"
        className="rounded-md border p-4"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--paper) 75%, transparent)',
        }}
      >
        <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          the reading
        </div>
        <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
          Strongest pressure ·{' '}
          <span style={{ color: 'var(--ink)' }}>{strongest?.force.label ?? '—'}</span>
          {anyOn
            ? ' — re-scored against the assumptions you just made.'
            : ' — as the evidence pack has it today.'}
        </p>
        {activeFlips.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {activeFlips.map((flip) => (
              <li
                key={flip.id}
                data-implication={flip.id}
                className="rounded-md border px-3 py-2 text-[13px] leading-snug"
                style={{
                  color: 'var(--muted)',
                  borderColor: 'color-mix(in srgb, var(--flow) 30%, transparent)',
                  background: 'color-mix(in srgb, var(--flow-deep) 10%, transparent)',
                }}
              >
                {flip.implication}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
          Whichever way the pressures reorder, one line of the analysis does not move — and it
          is the line the owner actually asked about.
        </p>
        <div className="mt-3">{invariant}</div>
      </div>
    </div>
  );
}

export default ForcePressureFlip;
