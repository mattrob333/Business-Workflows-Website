'use client';

/**
 * The chrome every run interaction wears.
 *
 * Twelve steps, six mechanics, one shape: a mono kicker naming the mechanic, the challenge
 * prompt in the narrative voice, the widget, and — once the visitor has committed — whatever
 * the commitment bought. Keeping the frame in one place is what lets the walk treat all six
 * mechanics identically: find `[data-run-interaction]` inside the active step, do the
 * mechanic-specific thing, assert `data-interacted="true"`.
 *
 * The frame also owns the *reporting*: `useRunControls().markInteracted()` is called from the
 * islands, not from here, because only the island knows what counts as having done the thing
 * (moving a slider counts; focusing it does not).
 */

import type { ReactNode } from 'react';
import { MONO_LABEL } from '@/components';
import type { RunInteractionKind } from '../types';

const KICKER: Record<RunInteractionKind, string> = {
  prediction: 'predict before the reveal',
  'assumption-slider': 'move the assumption',
  'lens-compare': 'compare the lenses',
  'event-injection': 'inject the event',
  consequence: 'choose, then live with it',
  replay: 'replay',
};

export interface FrameProps {
  kind: RunInteractionKind;
  /** The challenge-mode prompt. One sentence, Newsreader. */
  prompt: string;
  /** True once the visitor has done the thing this island asks for. */
  done: boolean;
  /** Quiet line under the prompt — what to do, in the teaching voice. */
  instruction?: string;
  children: ReactNode;
}

export function Frame({ kind, prompt, done, instruction, children }: FrameProps) {
  return (
    <div
      data-run-interaction={kind}
      data-interacted={done ? 'true' : 'false'}
      className="rounded-lg border p-5"
      style={{
        borderColor: done ? 'color-mix(in srgb, var(--flow) 38%, transparent)' : 'var(--line)',
        background: 'color-mix(in srgb, var(--surface) 66%, transparent)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
          {KICKER[kind]}
        </span>
        {done ? (
          <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--evidence)' }}>
            recorded
          </span>
        ) : null}
      </div>
      <p
        className="font-narrative mt-2 text-[clamp(19px,2.2vw,23px)] leading-snug"
        style={{ color: 'var(--ink)' }}
      >
        {prompt}
      </p>
      {instruction ? (
        <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
          {instruction}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default Frame;
