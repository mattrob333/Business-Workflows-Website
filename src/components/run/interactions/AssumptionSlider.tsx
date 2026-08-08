'use client';

/**
 * `assumption-slider` — vary the belief, watch the implication move, notice what does not.
 *
 * The appendix §9 mechanic, built with two rules that keep it honest.
 *
 * **The pack's own figure is a fixed point on the scale, printed as a sourced metric.** The
 * slider is explicitly a *what-if*: every position other than the baseline is labelled as
 * such, and every implication it produces carries a hypothesis or assumption chip. A slider
 * that quietly redrew a sourced number would be the single easiest way to break Ruling 4
 * while appearing to obey it.
 *
 * **The invariant panel never moves.** Underneath the implications sits the thing the
 * assumption cannot touch — the run's recurring lesson, and the reason a terrain finding is
 * not a diagnosis. The visitor can drag the whole width of the scale and watch one panel
 * rewrite itself while the other refuses to.
 *
 * Keyboard: a native `<input type="range">`, so arrow keys, Home and End work for free.
 */

import { useId, useState } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';
import { DUR, EASE_EXPO_OUT, INGEST_RISE, useReducedMotion } from '@/lib/motion-utils';
import { motion } from 'framer-motion';
import { useRunControls } from '../controls';
import { Frame } from './Frame';
import type { ReactNode } from 'react';

export interface AssumptionStop {
  readonly id: string;
  /** Digit-free. The scale is a belief, not a measurement. */
  readonly label: string;
  /** What follows if this were the case. Server-rendered claim block. */
  readonly implication: ReactNode;
  /** The pressure that would top the ranking at this position. */
  readonly strongest: string;
}

export interface AssumptionSliderProps {
  prompt: string;
  instruction?: string;
  /** What is being varied, in the system voice. */
  assumption: string;
  /** The pack's actual figure, rendered on the server as a sourced metric line. */
  baseline: ReactNode;
  /** Index into `stops` of the position the evidence pack supports. */
  baselineIndex: number;
  stops: readonly AssumptionStop[];
  /** What none of the positions change. The panel that refuses to move. */
  invariant: ReactNode;
}

export function AssumptionSlider({
  prompt,
  instruction,
  assumption,
  baseline,
  baselineIndex,
  stops,
  invariant,
}: AssumptionSliderProps) {
  const reduced = useReducedMotion();
  const { markInteracted } = useRunControls();
  const [index, setIndex] = useState(baselineIndex);
  const [moved, setMoved] = useState(false);
  const fieldId = useId();

  const active = stops[index] ?? stops[baselineIndex] ?? stops[0];
  if (!active) return null;

  const atBaseline = index === baselineIndex;

  return (
    <Frame
      kind="assumption-slider"
      prompt={prompt}
      done={moved}
      {...(instruction !== undefined ? { instruction } : {})}
    >
      <div
        data-testid="assumption-slider"
        data-stop={active.id}
        data-baseline={atBaseline ? 'true' : 'false'}
        className="grid gap-5"
      >
        <div>{baseline}</div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <label
              htmlFor={fieldId}
              className={`${MONO_LABEL} text-[10px]`}
              style={{ color: 'var(--flow)' }}
            >
              {assumption}
            </label>
            <span className="font-system text-[12px]" style={{ color: 'var(--ink)' }}>
              {active.label}
              {atBaseline ? (
                <span style={{ color: 'var(--evidence)' }}> · as the pack has it</span>
              ) : (
                <span style={{ color: 'var(--faint)' }}> · what-if</span>
              )}
            </span>
          </div>

          <input
            id={fieldId}
            type="range"
            min={0}
            max={stops.length - 1}
            step={1}
            value={index}
            aria-valuetext={active.label}
            onChange={(e) => {
              const next = Number(e.target.value);
              setIndex(next);
              if (next !== baselineIndex && !moved) {
                setMoved(true);
                markInteracted();
              }
            }}
            className={`${FOCUS_RING} mt-3 h-1 w-full cursor-pointer appearance-none rounded-full`}
            style={{
              background: `linear-gradient(90deg, var(--flow) 0%, var(--flow) ${
                (index / Math.max(1, stops.length - 1)) * 100
              }%, var(--line) ${(index / Math.max(1, stops.length - 1)) * 100}%, var(--line) 100%)`,
            }}
          />

          <ol className="mt-2 flex justify-between gap-2">
            {stops.map((stop, i) => (
              <li
                key={stop.id}
                data-stop-tick={stop.id}
                data-active={i === index ? 'true' : 'false'}
                className={`${MONO_LABEL} text-[9px]`}
                style={{
                  color:
                    i === index
                      ? 'var(--ink)'
                      : i === baselineIndex
                        ? 'var(--muted)'
                        : 'var(--faint)',
                }}
              >
                {i === baselineIndex ? 'pack' : `·`}
              </li>
            ))}
          </ol>
        </div>

        <motion.div
          key={active.id}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: INGEST_RISE }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? DUR.reduced : DUR.ingest,
            ease: reduced ? 'linear' : EASE_EXPO_OUT,
          }}
          data-implication={active.id}
          className="grid gap-3"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              strongest pressure
            </span>
            <span className="font-system text-[12px]" style={{ color: 'var(--ink)' }}>
              {active.strongest}
            </span>
          </div>
          {active.implication}
        </motion.div>

        <div
          data-testid="assumption-invariant"
          className="rounded-md border border-dashed p-4"
          style={{ borderColor: 'var(--line-strong)' }}
        >
          <div className={`${MONO_LABEL} mb-3 text-[9px]`} style={{ color: 'var(--faint)' }}>
            what did not move
          </div>
          {invariant}
        </div>
      </div>
    </Frame>
  );
}

export default AssumptionSlider;
