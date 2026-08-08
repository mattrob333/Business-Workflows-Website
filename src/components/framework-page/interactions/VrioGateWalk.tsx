'use client';

/**
 * The VRIO explore interaction: **guess the gate, then walk it**.
 *
 * The showpiece drops four capability tokens through four gates and shelves them. This is
 * the same model with the answer withheld: for each capability the visitor commits to the
 * gate they think it fails at — or to it clearing all four — and only then does the walk
 * run, gate by gate, carrying the pack's own assessment as the rebuttal.
 *
 * Committing per capability rather than once for the set is deliberate. The failure mode
 * this lesson is about is a table where everything passes, and the only way to feel that
 * pull is to be asked four separate times whether the flattering answer is the true one.
 *
 * The walk stops at the first failure, because that is what the model does: the gates are a
 * filter and the ones after the stop are never asked. Saying so out loud is worth a line of
 * copy — plenty of published VRIO tables score all four columns for capabilities that were
 * eliminated at the first.
 *
 * Dumb-island rules apply (`./BmcStaleExplorer`): every gate rebuttal and every verdict is a
 * claim node rendered on the server, counts are words rather than numerals, and this file
 * holds no evidence of its own.
 */

import { useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';

export type GateKey = 'v' | 'r' | 'i' | 'o';
/** Where a capability stops. `none` clears every gate. */
export type GateStop = GateKey | 'none';

export interface GateStep {
  key: GateKey;
  letter: string;
  /** valuable / rare / inimitable / organised. */
  label: string;
  passed: boolean;
  /** The sourced line that decides this gate, rendered on the server. */
  detail: ReactNode;
}

export interface GateCandidate {
  id: string;
  label: string;
  /** One digit-free line: what the business believes about this capability. */
  billing: string;
  gates: GateStep[];
  /** The gate it actually fails at. */
  failsAt: GateStop;
  /** parity / temporary / uncaptured / sustained. */
  outcome: string;
  /** What the verdict means for the business, rendered on the server. */
  verdict: ReactNode;
}

const CHOICES: { id: GateStop; label: string; caption: string }[] = [
  { id: 'v', label: 'V', caption: 'not valuable' },
  { id: 'r', label: 'R', caption: 'not rare' },
  { id: 'i', label: 'I', caption: 'copyable' },
  { id: 'o', label: 'O', caption: 'not organised' },
  { id: 'none', label: 'all four', caption: 'clears every gate' },
];

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const count = (n: number): string => WORDS[n] ?? String(n);

export interface VrioGateWalkProps {
  candidates: GateCandidate[];
}

export function VrioGateWalk({ candidates }: VrioGateWalkProps) {
  const [picks, setPicks] = useState<Record<string, GateStop>>({});

  const walked = candidates.filter((c) => picks[c.id] !== undefined);
  const called = candidates.filter((c) => picks[c.id] === c.failsAt);
  const settled = walked.length === candidates.length;

  return (
    <div
      data-testid="vrio-walk"
      data-walked={walked.length}
      data-called={called.length}
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
          capabilities walked
        </span>
        <span
          className="font-system text-[13px]"
          style={{ color: settled ? 'var(--evidence)' : 'var(--ink)' }}
        >
          {count(walked.length)} of {count(candidates.length)}
        </span>
        <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
          {settled
            ? `You called ${count(called.length)} of ${count(candidates.length)}. The gates are asked in order, and most capabilities never reach the fourth.`
            : 'Commit to the gate you think stops it. The order matters — a capability that fails early is never asked the rest.'}
        </span>
      </div>

      <ul className="grid gap-3">
        {candidates.map((candidate) => {
          const picked = picks[candidate.id];
          const done = picked !== undefined;
          const right = picked === candidate.failsAt;
          const stopIndex =
            candidate.failsAt === 'none'
              ? candidate.gates.length - 1
              : candidate.gates.findIndex((g) => g.key === candidate.failsAt);
          const shown = candidate.gates.slice(0, stopIndex + 1);
          const skipped = candidate.gates.length - shown.length;

          return (
            <li
              key={candidate.id}
              data-candidate={candidate.id}
              data-picked={picked ?? 'none-yet'}
              data-outcome={done ? candidate.outcome : 'unwalked'}
              className="rounded-lg border p-4"
              style={{
                borderColor: done ? 'var(--line-strong)' : 'var(--line)',
                background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
              }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <div>
                  <span className="text-[15px]" style={{ color: 'var(--ink)' }}>
                    {candidate.label}
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
                    {candidate.billing}
                  </span>
                </div>
                {done ? (
                  <span
                    className={`${MONO_LABEL} text-[9px]`}
                    style={{
                      color:
                        candidate.outcome === 'sustained' ? 'var(--evidence)' : 'var(--muted)',
                    }}
                  >
                    {candidate.outcome}
                  </span>
                ) : null}
              </div>

              {!done ? (
                <div className="mt-3">
                  <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                    where does it stop?
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CHOICES.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        data-gate-pick={`${candidate.id}:${choice.id}`}
                        onClick={() =>
                          setPicks((prev) => ({ ...prev, [candidate.id]: choice.id }))
                        }
                        className={`${FOCUS_RING} rounded-md border px-3 py-2 text-left transition-colors`}
                        style={{
                          borderColor: 'color-mix(in srgb, var(--flow) 40%, transparent)',
                          background: 'color-mix(in srgb, var(--flow-deep) 12%, transparent)',
                        }}
                      >
                        <span
                          className={`${MONO_LABEL} block text-[10px]`}
                          style={{ color: 'var(--ink)' }}
                        >
                          {choice.label}
                        </span>
                        <span
                          className="mt-[2px] block text-[11px]"
                          style={{ color: 'var(--faint)' }}
                        >
                          {choice.caption}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  <div className={`${MONO_LABEL} text-[9px]`} style={{ color: right ? 'var(--evidence)' : 'var(--muted)' }}>
                    {right ? 'you called it' : 'the filter stops somewhere else'}
                  </div>
                  <ol className="grid gap-3">
                    {shown.map((gate) => (
                      <li
                        key={gate.key}
                        data-gate={`${candidate.id}:${gate.key}`}
                        data-gate-passed={gate.passed ? 'true' : 'false'}
                        className="grid gap-2 rounded-md border p-3"
                        style={{
                          borderColor: gate.passed
                            ? 'color-mix(in srgb, var(--evidence) 35%, transparent)'
                            : 'var(--line)',
                          background: gate.passed ? 'var(--evidence-soft)' : 'transparent',
                        }}
                      >
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span
                            className="font-system text-[13px]"
                            style={{ color: gate.passed ? 'var(--evidence)' : 'var(--faint)' }}
                          >
                            {gate.letter}
                          </span>
                          <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                            {gate.label}
                          </span>
                          <span
                            className={`${MONO_LABEL} text-[9px]`}
                            style={{ color: gate.passed ? 'var(--evidence)' : 'var(--contradiction)' }}
                          >
                            {gate.passed ? 'passes' : 'stops here'}
                          </span>
                        </div>
                        {gate.detail}
                      </li>
                    ))}
                  </ol>
                  {skipped > 0 ? (
                    <p className="text-[13px] leading-snug" style={{ color: 'var(--faint)' }}>
                      The remaining {skipped === 1 ? 'gate is' : 'gates are'} never asked. A
                      filter that keeps scoring after the first no is a scorecard wearing a
                      filter's name.
                    </p>
                  ) : null}
                  {candidate.verdict}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default VrioGateWalk;
