/* amber-law: constraint-surface */
'use client';

/**
 * Recipe `fw/toc-flow` — 01-design-system §5. **A constraint surface.**
 *
 * Spec: the business as a horizontal pipe of stages; throughput as a continuous
 * particle stream (`--flow` dots, density = volume). The constrained stage: the pipe
 * narrows, particles queue and back up, and that stage alone wears `--constraint` — the
 * page's only amber. Intervention buttons re-simulate: improving a non-constraint
 * visibly does nothing to downstream flow (the lesson, animated).
 *
 * This is one of exactly two files in `src/` permitted to name the amber token (the
 * other is `components/ConstraintBadge`), which is why it carries the `amber-law`
 * pragma that `scripts/lint-tokens.mjs` looks for. The constraint here is *computed*,
 * never authored: it is whichever stage has the least capacity, so an intervention that
 * moves the bottleneck moves the amber with it. Amber that could be placed by hand
 * would eventually be placed by hand somewhere it did not belong.
 *
 * The stream is one animated `<g>` per stage rather than one animation per particle:
 * evenly spaced dots inside a group that translates by exactly one gap and repeats,
 * which is seamless, and costs the compositor a handful of transforms instead of two
 * hundred (team rule 9).
 *
 * Reduced motion: the stream renders as a static, correctly-spaced distribution — the
 * *density* still tells you the volume and the queue still visibly backs up — and the
 * intervention buttons update the numbers with a 200ms crossfade instead of a re-flow.
 */

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { DUR, prng, useReducedMotion, useSvgId } from '@/lib/motion-utils';
import { ConstraintBadge } from '@/components/ConstraintBadge';
import { FOCUS_RING, MONO_LABEL } from '@/components/styles';
import { AtmoMeshDrift } from './atmo-mesh-drift';
import { useStage } from './acts';

/* ------------------------------------------------------------------- types */

export interface TocStage {
  id: string;
  label: string;
  /** Units per period this stage can process. */
  capacity: number;
}

export interface TocIntervention {
  id: string;
  label: string;
  /** Which stage it improves. */
  stageId: string;
  /** Capacity added. */
  delta: number;
}

export interface TocFlowProps {
  stages: TocStage[];
  interventions: TocIntervention[];
  /** Demand entering the system. Throughput can never exceed it. */
  demand: number;
  /** e.g. `jobs / week`. */
  unit?: string;
  className?: string;
}

/* ------------------------------------------------------------------ layout */

const VB_W = 960;
const VB_H = 300;
const PIPE_Y = 132;
const PAD = 28;
const MAX_HALF = 44;
const MIN_HALF = 13;

/* --------------------------------------------------------------- component */

export function TocFlow({
  stages,
  interventions,
  demand,
  unit = 'jobs / wk',
  className = '',
}: TocFlowProps) {
  const reduced = useReducedMotion();
  const clipId = useSvgId('tocclip');
  /** stages arrive, then the queue builds, then the reading settles. */
  const { step, ref } = useStage(stages.length + 2);
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  const model = useMemo(() => {
    const boosted = stages.map((s) => {
      const extra = interventions
        .filter((iv) => iv.stageId === s.id && applied[iv.id])
        .reduce((sum, iv) => sum + iv.delta, 0);
      return { ...s, capacity: s.capacity + extra };
    });
    const maxCap = Math.max(...boosted.map((s) => s.capacity), 1);
    const minCap = Math.min(...boosted.map((s) => s.capacity));
    const constraintIndex = boosted.findIndex((s) => s.capacity === minCap);
    const throughput = Math.min(demand, minCap);
    const upstream = boosted.slice(0, Math.max(0, constraintIndex));
    const upstreamRate = Math.min(
      demand,
      upstream.length ? Math.min(...upstream.map((s) => s.capacity)) : demand,
    );
    return {
      boosted,
      maxCap,
      constraintIndex,
      throughput,
      queue: Math.max(0, upstreamRate - throughput),
    };
  }, [stages, interventions, applied, demand]);

  const baseline = useMemo(() => {
    const minCap = Math.min(...stages.map((s) => s.capacity));
    return Math.min(demand, minCap);
  }, [stages, demand]);

  const anyApplied = Object.values(applied).some(Boolean);
  const changed = model.throughput !== baseline;

  const segW = (VB_W - PAD * 2) / model.boosted.length;
  const rand = prng(41);

  return (
    <div
      ref={ref}
      data-recipe="fw/toc-flow"
      data-amber-surface="toc"
      data-step={step}
      className={className}
    >
      <div className="relative overflow-hidden rounded-lg" style={{ border: '1px solid var(--line)' }}>
        {/*
          The atmosphere layer is told which colour to use rather than knowing it: the
          shared recipe must never be able to spend amber on its own initiative.
        */}
        <AtmoMeshDrift
          hues={['flow-deep', 'raised']}
          count={3}
          seed={19}
          constraint={{ color: 'var(--constraint)', intensity: 0.09 }}
        />

        <div className="relative p-4 sm:p-5">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full"
            role="img"
            aria-label={`Flow through ${model.boosted.length} stages. Throughput ${model.throughput} ${unit}, constrained by ${model.boosted[model.constraintIndex]?.label ?? 'a stage'}.`}
          >
            <defs>
              <clipPath id={clipId}>
                {model.boosted.map((s, i) => {
                  const half = Math.max(
                    MIN_HALF,
                    (s.capacity / model.maxCap) * MAX_HALF,
                  );
                  return (
                    <rect
                      key={s.id}
                      x={PAD + i * segW}
                      y={PIPE_Y - half}
                      width={segW}
                      height={half * 2}
                    />
                  );
                })}
              </clipPath>
            </defs>

            {/* Pipe walls */}
            {model.boosted.map((s, i) => {
              const half = Math.max(MIN_HALF, (s.capacity / model.maxCap) * MAX_HALF);
              const isConstraint = i === model.constraintIndex;
              const arrived = step >= i;
              return (
                <motion.rect
                  key={s.id}
                  data-stage={s.id}
                  data-constraint={isConstraint ? 'true' : 'false'}
                  x={PAD + i * segW + 1}
                  width={segW - 2}
                  rx={5}
                  initial={false}
                  animate={{
                    y: PIPE_Y - half,
                    height: half * 2,
                    opacity: arrived ? 1 : 0.15,
                  }}
                  transition={{ duration: reduced ? DUR.reduced : DUR.state }}
                  fill={
                    isConstraint
                      ? 'var(--constraint-soft)'
                      : 'color-mix(in srgb, var(--surface) 70%, transparent)'
                  }
                  stroke={isConstraint ? 'var(--constraint)' : 'var(--line-strong)'}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {/* The stream. One translating group per stage; density carries volume. */}
            <g clipPath={`url(#${clipId})`}>
              {model.boosted.map((s, i) => {
                const half = Math.max(MIN_HALF, (s.capacity / model.maxCap) * MAX_HALF);
                const rate =
                  i < model.constraintIndex
                    ? Math.min(demand, s.capacity)
                    : model.throughput;
                const density = Math.max(2, Math.round((rate / Math.max(demand, 1)) * 11));
                const gap = segW / density;
                const rows = Math.max(1, Math.min(3, Math.round(half / 14)));
                const cycle = Math.max(0.5, gap / 46);
                const x0 = PAD + i * segW;
                return (
                  <motion.g
                    key={s.id}
                    data-stream={s.id}
                    {...(reduced || step < i
                      ? {}
                      : {
                          animate: { x: [0, gap] },
                          transition: {
                            duration: cycle,
                            ease: 'linear' as const,
                            repeat: Infinity,
                          },
                        })}
                  >
                    {Array.from({ length: density + 2 }, (_, k) =>
                      Array.from({ length: rows }, (_, r) => {
                        const jitter = rand() * 6 - 3;
                        const y =
                          PIPE_Y - ((rows - 1) / 2) * 15 + r * 15 + jitter * 0.4;
                        return (
                          <circle
                            key={`${k}-${r}`}
                            cx={x0 - gap + k * gap}
                            cy={y}
                            r={2.6}
                            fill="var(--flow)"
                            opacity={step >= i ? 0.85 : 0}
                          />
                        );
                      }),
                    )}
                  </motion.g>
                );
              })}
            </g>

            {/* The queue: work that has arrived and cannot get through. */}
            {model.queue > 0 && step >= stages.length ? (
              <g data-queue="true">
                {Array.from(
                  { length: Math.min(22, Math.round(model.queue * 2.2)) },
                  (_, k) => {
                    const col = Math.floor(k / 6);
                    const row = k % 6;
                    return (
                      <motion.circle
                        key={k}
                        cx={PAD + model.constraintIndex * segW - 10 - col * 9}
                        cy={PIPE_Y - 34 + row * 12}
                        r={2.8}
                        fill="var(--flow)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.45 + (col === 0 ? 0.25 : 0) }}
                        transition={{
                          duration: reduced ? DUR.reduced : 0.4,
                          delay: reduced ? 0 : k * 0.03,
                        }}
                      />
                    );
                  },
                )}
                <text
                  x={PAD + model.constraintIndex * segW - 12}
                  y={PIPE_Y - 46}
                  textAnchor="end"
                  className="font-system"
                  fontSize={10}
                  letterSpacing="0.12em"
                  fill="var(--faint)"
                >
                  QUEUE
                </text>
              </g>
            ) : null}

            {/* Stage labels */}
            {model.boosted.map((s, i) => {
              const isConstraint = i === model.constraintIndex;
              return (
                <g key={s.id} opacity={step >= i ? 1 : 0.25}>
                  <text
                    x={PAD + i * segW + segW / 2}
                    y={PIPE_Y + MAX_HALF + 34}
                    textAnchor="middle"
                    className="font-system"
                    fontSize={11}
                    letterSpacing="0.1em"
                    fill={isConstraint ? 'var(--constraint)' : 'var(--muted)'}
                  >
                    {s.label.toUpperCase()}
                  </text>
                  <text
                    x={PAD + i * segW + segW / 2}
                    y={PIPE_Y + MAX_HALF + 50}
                    textAnchor="middle"
                    className="font-system tabular-nums"
                    fontSize={10}
                    fill="var(--faint)"
                  >
                    {`cap ${s.capacity}`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* The badge rides above the constrained stage, not beside the diagram. */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${((PAD + model.constraintIndex * segW + segW / 2) / VB_W) * 100}%`,
              top: '6%',
              transform: 'translateX(-50%)',
            }}
          >
            <ConstraintBadge
              subject={model.boosted[model.constraintIndex]?.label ?? ''}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Interventions — the lesson made clickable. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
            interventions
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {interventions.map((iv) => {
              const on = applied[iv.id] ?? false;
              const targetsConstraint =
                model.boosted[model.constraintIndex]?.id === iv.stageId;
              return (
                <button
                  key={iv.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setApplied((p) => ({ ...p, [iv.id]: !p[iv.id] }))}
                  className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-3 py-2 text-[10px] transition-colors`}
                  style={{
                    color: on ? 'var(--ink)' : 'var(--muted)',
                    borderColor: on
                      ? 'color-mix(in srgb, var(--flow) 55%, transparent)'
                      : 'var(--line-strong)',
                    background: on
                      ? 'color-mix(in srgb, var(--flow-deep) 20%, transparent)'
                      : 'transparent',
                  }}
                >
                  {iv.label}
                  <span
                    className="ml-2 tabular-nums"
                    style={{ color: targetsConstraint ? 'var(--flow)' : 'var(--faint)' }}
                  >
                    +{iv.delta}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-md border p-3"
          style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--surface) 55%, transparent)' }}
          aria-live="polite"
        >
          <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
            system throughput
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className="font-system text-[22px] tabular-nums"
              style={{ color: changed ? 'var(--evidence)' : 'var(--ink)' }}
            >
              {model.throughput}
            </span>
            <span className="font-system text-[11px]" style={{ color: 'var(--faint)' }}>
              {unit}
            </span>
            {anyApplied ? (
              <span
                className="font-system ml-auto text-[11px] tabular-nums"
                style={{ color: 'var(--faint)' }}
              >
                was {baseline}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[12px] leading-snug" style={{ color: 'var(--muted)' }}>
            {!anyApplied
              ? 'Nothing applied yet. The slowest stage sets the rate for the whole line.'
              : changed
                ? 'Throughput moved — that intervention touched the constraint.'
                : 'Nothing moved. You improved a stage that was never the limit.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TocFlow;
