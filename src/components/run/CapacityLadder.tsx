'use client';

/**
 * The pipe, before it earns its colour (step ten).
 *
 * `fw/toc-flow` computes the constraint and paints it amber, and that is exactly right — one
 * step later. At step ten the run is still *asking*: here are five stages, one unit, and the
 * arithmetic behind each capacity. Which one sets the rate? A ladder that already answered the
 * question in colour would turn the prediction into a reading exercise, and would spend the
 * site's most sacred token on a guess rather than on a diagnosis (00-LAW Ruling 2 — amber is
 * the *binding* constraint, and nothing is binding until the alternatives have been
 * eliminated and the consequence demonstrated).
 *
 * So: bars to scale, in the flow hue, with demand drawn across them. Everything a visitor
 * needs to work it out, and no colour telling them the answer. The step after this one paints
 * the same five stages amber at the narrow point, and the change is the whole beat.
 */

import { IngestGroup } from '@/motion/motion-ingest';
import { MONO_LABEL } from '@/components';

export interface LadderStage {
  readonly id: string;
  readonly label: string;
  /** Same unit for all five. The comparison is the point. */
  readonly capacity: number;
  /** One digit-free clause: where the number comes from. */
  readonly basis: string;
  /** `derived` is arithmetic on the pack; `modelled` is an authored assumption. */
  readonly kind: 'derived' | 'modelled';
}

export interface CapacityLadderProps {
  stages: readonly LadderStage[];
  /** What the market is asking for, in the same unit. Drawn as the line across the ladder. */
  demand: number;
  unit: string;
  className?: string;
}

export function CapacityLadder({ stages, demand, unit, className = '' }: CapacityLadderProps) {
  const ceiling = Math.max(demand, ...stages.map((s) => s.capacity)) * 1.08;
  const pct = (n: number) => `${(n / ceiling) * 100}%`;

  return (
    <div
      data-testid="capacity-ladder"
      data-stages={stages.length}
      className={`rounded-lg border p-5 sm:p-6 ${className}`}
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--paper) 78%, transparent)',
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
          five stages · one unit · {unit}
        </span>
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--flow)' }}>
          demand {demand}
        </span>
      </div>

      <div className="relative mt-6">
        {/* Demand, drawn across every stage. The line each bar is measured against. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px"
          style={{ left: pct(demand), background: 'color-mix(in srgb, var(--flow) 55%, transparent)' }}
        />

        <IngestGroup className="grid gap-4" trigger="in-view">
          {stages.map((stage) => (
            <div key={stage.id} data-ladder-stage={stage.id} data-capacity={stage.capacity}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-system text-[12px]" style={{ color: 'var(--ink)' }}>
                  {stage.label}
                </span>
                <span
                  className="font-system text-[12px] tabular-nums"
                  style={{ color: 'var(--muted)' }}
                >
                  {stage.capacity}
                </span>
              </div>
              <div
                className="mt-2 h-[12px] overflow-hidden rounded-sm"
                style={{ background: 'color-mix(in srgb, var(--line) 70%, transparent)' }}
              >
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: pct(stage.capacity),
                    background:
                      stage.kind === 'derived'
                        ? 'linear-gradient(90deg, var(--flow-deep), var(--flow))'
                        : 'color-mix(in srgb, var(--line-strong) 90%, var(--flow-deep))',
                  }}
                />
              </div>
              <p className="mt-1 text-[12px] leading-snug" style={{ color: 'var(--faint)' }}>
                <span
                  className={MONO_LABEL}
                  style={{ color: stage.kind === 'derived' ? 'var(--evidence)' : 'var(--faint)' }}
                >
                  {stage.kind}
                </span>{' '}
                · {stage.basis}
              </p>
            </div>
          ))}
        </IngestGroup>
      </div>
    </div>
  );
}

export default CapacityLadder;
