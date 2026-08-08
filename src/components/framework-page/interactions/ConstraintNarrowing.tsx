'use client';

/**
 * The Theory-of-Constraints explore interaction: **set narrowing**.
 *
 * Five candidate explanations for why Beacon finished the same number of projects on a
 * quarter more revenue. All five are true statements about the business. Four of them are
 * not binding, and the only honest way to show that is to test them one at a time against
 * the evidence pack and watch the set shrink.
 *
 * This is the page where the site's thesis has to land, so the mechanic is deliberately
 * not a reveal button. The visitor eliminates candidates themselves, each elimination costs
 * a click and returns a sourced claim, and the verdict does not appear until the set is
 * down to one. *"A hundred true findings. One binding constraint"* is a sentence you can
 * write on a slide; this is the same sentence as a thing you did with your hands.
 *
 * Every claim is rendered on the server and handed in as a node — the island decides what
 * is visible, never what is true. Counts are words, not numerals, so the walk's rule for
 * this section holds: any digit in the explore body sits inside a block that cites a source.
 */

import { useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';

export interface NarrowingCandidate {
  id: string;
  label: string;
  /** One digit-free line: why this is a plausible answer. */
  basis: string;
  /** `binding` survives the test; everything else is eliminated by evidence. */
  outcome: 'rejected' | 'binding';
  /** The sourced claim that settles it, rendered on the server. */
  detail: ReactNode;
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const count = (n: number): string => WORDS[n] ?? String(n);

export interface ConstraintNarrowingProps {
  candidates: NarrowingCandidate[];
  /** Shown once every candidate has been tested. The one amber surface on the page. */
  verdict: ReactNode;
}

export function ConstraintNarrowing({ candidates, verdict }: ConstraintNarrowingProps) {
  const [tested, setTested] = useState<string[]>([]);

  const remaining = candidates.filter(
    (candidate) => candidate.outcome === 'binding' || !tested.includes(candidate.id),
  );
  const settled = candidates.every((candidate) => tested.includes(candidate.id));

  return (
    <div
      data-testid="constraint-narrowing"
      data-remaining={remaining.length}
      data-settled={settled ? 'true' : 'false'}
      className="grid gap-5"
    >
      <div
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md border px-4 py-3"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--paper) 75%, transparent)',
        }}
        aria-live="polite"
      >
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          candidates standing
        </span>
        <span className="font-system text-[13px]" style={{ color: settled ? 'var(--evidence)' : 'var(--ink)' }}>
          {count(remaining.length)} of {count(candidates.length)}
        </span>
        <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
          {settled
            ? 'Every alternative has been tested against the pack. What is left is the constraint.'
            : 'Test each one against the evidence. Being true is not the same as being binding.'}
        </span>
      </div>

      <ul className="grid gap-3">
        {candidates.map((candidate) => {
          const done = tested.includes(candidate.id);
          const rejected = done && candidate.outcome === 'rejected';
          return (
            <li
              key={candidate.id}
              data-candidate={candidate.id}
              data-tested={done ? 'true' : 'false'}
              data-outcome={done ? candidate.outcome : 'untested'}
              className="rounded-lg border p-4"
              style={{
                borderColor: rejected ? 'var(--line)' : 'var(--line-strong)',
                background: rejected
                  ? 'transparent'
                  : 'color-mix(in srgb, var(--surface) 55%, transparent)',
                opacity: rejected ? 0.72 : 1,
              }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <div>
                  <span
                    className="text-[15px]"
                    style={{
                      color: rejected ? 'var(--faint)' : 'var(--ink)',
                      textDecoration: rejected ? 'line-through' : undefined,
                    }}
                  >
                    {candidate.label}
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
                    {candidate.basis}
                  </span>
                </div>
                {done ? (
                  <span
                    className={`${MONO_LABEL} text-[9px]`}
                    style={{ color: rejected ? 'var(--faint)' : 'var(--evidence)' }}
                  >
                    {rejected ? 'not binding' : 'still standing'}
                  </span>
                ) : (
                  <button
                    type="button"
                    data-test-candidate={candidate.id}
                    onClick={() => setTested((prev) => (prev.includes(candidate.id) ? prev : [...prev, candidate.id]))}
                    className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-3 py-2 text-[10px] transition-colors`}
                    style={{
                      color: 'var(--ink)',
                      borderColor: 'color-mix(in srgb, var(--flow) 50%, transparent)',
                      background: 'color-mix(in srgb, var(--flow-deep) 16%, transparent)',
                    }}
                  >
                    test against the evidence
                  </button>
                )}
              </div>
              {done ? <div className="mt-3">{candidate.detail}</div> : null}
            </li>
          );
        })}
      </ul>

      {settled ? <div data-testid="narrowing-verdict">{verdict}</div> : null}
    </div>
  );
}

export default ConstraintNarrowing;
