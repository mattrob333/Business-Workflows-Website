'use client';

/**
 * `consequence` — pick a move, then read what it actually does.
 *
 * The appendix §9 consequence mechanic. Its whole design problem is that a list of options
 * with a "best" one teaches nothing: the visitor learns to look for the option that sounds
 * most like the last reveal. So this island scores each choice on a *declared* axis instead —
 * does it release capacity at the stage that sets the rate, does it load more onto it, or does
 * it move something real somewhere that was never the limit — and it does not hide the
 * unpicked options once one has been opened. Reading three consequences side by side is the
 * lesson; picking the right one first time is not.
 *
 * Every consequence is a server-rendered claim block. The island holds no figures.
 */

import { useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';
import { useRunControls } from '../controls';
import { Frame } from './Frame';

/** What the move does to the stage that sets the rate. Declared, never inferred. */
export type ConsequenceEffect = 'releases' | 'loads' | 'elsewhere';

const EFFECT_LABEL: Record<ConsequenceEffect, string> = {
  releases: 'gives hours back',
  loads: 'adds to the queue',
  elsewhere: 'moves a number that was never the limit',
};

const EFFECT_TONE: Record<ConsequenceEffect, string> = {
  releases: 'var(--evidence)',
  loads: 'var(--contradiction)',
  elsewhere: 'var(--muted)',
};

export interface ConsequenceOption {
  readonly id: string;
  readonly label: string;
  /** One digit-free line: why somebody would propose this. */
  readonly basis: string;
  readonly effect: ConsequenceEffect;
  /** What it does, sourced. Server-rendered. */
  readonly consequence: ReactNode;
}

export interface ConsequencePickerProps {
  prompt: string;
  instruction?: string;
  options: readonly ConsequenceOption[];
  /** Shown once every option has been opened. */
  settled?: ReactNode;
}

export function ConsequencePicker({
  prompt,
  instruction,
  options,
  settled,
}: ConsequencePickerProps) {
  const { markInteracted } = useRunControls();
  const [opened, setOpened] = useState<string[]>([]);

  const open = (id: string) => {
    setOpened((prev) => (prev.includes(id) ? prev : [...prev, id]));
    markInteracted();
  };

  const allOpen = options.every((o) => opened.includes(o.id));

  return (
    <Frame
      kind="consequence"
      prompt={prompt}
      done={opened.length > 0}
      {...(instruction !== undefined ? { instruction } : {})}
    >
      <div
        data-testid="consequence-picker"
        data-opened={opened.length}
        data-settled={allOpen ? 'true' : 'false'}
        className="grid gap-3"
      >
        {options.map((option) => {
          const isOpen = opened.includes(option.id);
          return (
            <div
              key={option.id}
              data-consequence={option.id}
              data-open={isOpen ? 'true' : 'false'}
              data-effect={option.effect}
              className="rounded-lg border p-4"
              style={{
                borderColor: isOpen ? 'var(--line-strong)' : 'var(--line)',
                background: isOpen
                  ? 'color-mix(in srgb, var(--surface) 55%, transparent)'
                  : 'transparent',
              }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <div className="max-w-[52ch]">
                  <span className="text-[15px]" style={{ color: 'var(--ink)' }}>
                    {option.label}
                  </span>
                  <span
                    className="mt-1 block text-[13px] leading-snug"
                    style={{ color: 'var(--muted)' }}
                  >
                    {option.basis}
                  </span>
                </div>
                {isOpen ? (
                  <span
                    className={`${MONO_LABEL} text-[9px]`}
                    style={{ color: EFFECT_TONE[option.effect] }}
                  >
                    {EFFECT_LABEL[option.effect]}
                  </span>
                ) : (
                  <button
                    type="button"
                    data-consequence-pick={option.id}
                    onClick={() => open(option.id)}
                    className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-3 py-2 text-[10px] transition-colors`}
                    style={{
                      color: 'var(--ink)',
                      borderColor: 'color-mix(in srgb, var(--flow) 50%, transparent)',
                      background: 'color-mix(in srgb, var(--flow-deep) 16%, transparent)',
                    }}
                  >
                    run it forward
                  </button>
                )}
              </div>
              {isOpen ? <div className="mt-3">{option.consequence}</div> : null}
            </div>
          );
        })}

        {allOpen && settled ? (
          <div data-testid="consequence-settled" className="mt-1">
            {settled}
          </div>
        ) : null}
      </div>
    </Frame>
  );
}

export default ConsequencePicker;
