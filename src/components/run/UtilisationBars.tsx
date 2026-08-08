'use client';

/**
 * Two pools, one picture — the run's hinge image (step six).
 *
 * VRIO has just docked one capability as the single sustained advantage. Theory of Constraints
 * has not run yet. In between sits the observation the whole diagnosis turns on: *the advantage
 * and the bottleneck are the same crew*. A table of two percentages says that; two bars drawn
 * to the same scale, one of them full to the line, make it impossible to miss.
 *
 * No amber. A pool at the top of its range is a fact about utilisation, not a diagnosis — the
 * constraint is named five steps later, after the alternatives have been eliminated and the
 * consequence demonstrated (00-LAW Ruling 2).
 *
 * The figures arrive as props from the authored pack; this component computes only geometry.
 */

import { IngestGroup, Ingest } from '@/motion/motion-ingest';
import { MONO_LABEL } from '@/components';

export interface UtilisationPool {
  readonly id: string;
  readonly label: string;
  /** 0–100. Bar width is the value; nothing here is rescaled or flattered. */
  readonly percent: number;
  /** Headcount or unit note, printed under the label. Digit-free where possible. */
  readonly note: string;
  /** `advantage` wears the evidence hue and carries the docked token. */
  readonly tone: 'advantage' | 'slack';
}

export interface UtilisationBarsProps {
  pools: readonly UtilisationPool[];
  /** The capability VRIO docked. Printed on the pool that carries it. */
  advantage: string;
  className?: string;
}

export function UtilisationBars({ pools, advantage, className = '' }: UtilisationBarsProps) {
  return (
    <div
      data-testid="utilisation-bars"
      className={`rounded-lg border p-5 sm:p-6 ${className}`}
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--paper) 78%, transparent)',
      }}
    >
      <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
        scheduled hours, booked · the two field pools
      </div>

      <IngestGroup className="mt-6 grid gap-6" trigger="in-view">
        {pools.map((pool) => {
          const isAdvantage = pool.tone === 'advantage';
          const hue = isAdvantage ? 'var(--evidence)' : 'var(--flow)';
          return (
            <div key={pool.id} data-pool={pool.id} data-percent={Math.round(pool.percent)}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-[15px]" style={{ color: 'var(--ink)' }}>
                  {pool.label}
                </span>
                <span
                  className="font-system text-[15px] tabular-nums"
                  style={{ color: hue }}
                >
                  {pool.percent}%
                </span>
              </div>
              <div
                className="relative mt-2 h-[14px] overflow-hidden rounded-full"
                style={{ background: 'color-mix(in srgb, var(--line) 80%, transparent)' }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, pool.percent))}%`,
                    background: `linear-gradient(90deg, color-mix(in srgb, ${hue} 55%, transparent), ${hue})`,
                  }}
                />
                {/* The ceiling. Drawn on both bars so the gap between them is the message. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 w-px"
                  style={{ background: 'var(--line-strong)' }}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                  {pool.note}
                </span>
                {isAdvantage ? (
                  <Ingest asItem>
                    <span
                      data-docked-advantage="true"
                      className={`${MONO_LABEL} rounded-full border px-2 py-[3px] text-[9px]`}
                      style={{
                        color: 'var(--evidence)',
                        borderColor: 'color-mix(in srgb, var(--evidence) 40%, transparent)',
                        background: 'var(--evidence-soft)',
                      }}
                    >
                      sustained · {advantage}
                    </span>
                  </Ingest>
                ) : null}
              </div>
            </div>
          );
        })}
      </IngestGroup>
    </div>
  );
}

export default UtilisationBars;
