'use client';

/**
 * One step of the run, staged.
 *
 * The rhythm is fixed and repeats twelve times, because a visitor who has read one step should
 * be able to read the next without looking for anything:
 *
 *   **handed in** — the typed fields this step was given, named, with one line of framing. The
 *   run never starts a framework from a blank page; saying so at the top of every step is what
 *   makes the twelve feel like one program rather than twelve exercises.
 *   **the instrument** — the framework's own motion recipe, bound to Beacon's pack. Re-keyed on
 *   replay so it performs again from the first frame.
 *   **the interaction** — one of the six §9 mechanics. Never optional, never decorative.
 *   **what it found** — the authored analysis, every figure inside a claim block that cites its
 *   source. This is the panel the walk sweeps for unsourced digits (00-LAW Ruling 4).
 *   **handed on** — `motion/route`: the output travelling to the next instrument. The recipe
 *   for *work moving elsewhere* is the correct one for a handoff and the wrong one for
 *   anything else, which is why it appears here and nowhere else in the step.
 *
 * The component is deliberately ignorant of frameworks: everything above arrives as a node the
 * page already rendered.
 */

import type { ReactNode } from 'react';
import { Kicker, MONO_LABEL } from '@/components';
import { RouteHandoff } from '@/motion/motion-route';
import type { StepView } from './types';

export interface StepStageProps {
  view: StepView;
  totalSteps: number;
  /** Bumped by the replay control; re-keys the diagram subtree only. */
  replayKey: number;
  /** Hidden on the server pass for every step but the first — see `RunShell`. */
  hidden?: boolean;
  /** The next step, for the handoff. Absent on step twelve. */
  next?: { n: number; frameworkName: string; title: string } | undefined;
  /**
   * Render the diagram and the interaction. False for the eleven steps the *server* pass emits
   * behind the active one: their editorial content is in the document (so the run reads as a
   * document with JavaScript off) while their SVG stages are not, which is what keeps a page
   * made of twelve framework diagrams inside the DOM-size half of the performance budget
   * (00-LAW Ruling 7). After hydration exactly one step is mounted and it always shows both.
   */
  showStage?: boolean;
  onNext?: (() => void) | undefined;
}

export function StepStage({
  view,
  totalSteps,
  replayKey,
  hidden = false,
  next,
  showStage = true,
  onNext,
}: StepStageProps) {
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <article
      data-run-step={view.n}
      data-framework={view.frameworkId}
      data-interaction={view.interaction}
      hidden={hidden}
      aria-labelledby={`run-step-${view.n}-title`}
      className="grid gap-10"
    >
      <header>
        <Kicker index={`${pad(view.n)} / ${pad(totalSteps)}`} variant="rule">
          {view.frameworkName.toLowerCase()} · {view.groupLabel.toLowerCase()}
        </Kicker>
        <h2
          id={`run-step-${view.n}-title`}
          data-testid={`run-step-title-${view.n}`}
          className="font-narrative mt-5 max-w-[20ch] text-[clamp(30px,4.4vw,52px)] leading-[1.04] text-balance"
          style={{ color: 'var(--ink)' }}
        >
          {view.title}
        </h2>
        <p className="mt-4 max-w-[64ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
          {view.lede}
        </p>
      </header>

      {/* ------------------------------------------------------------ handed in */}
      <section
        data-testid={`run-state-in-${view.n}`}
        aria-label="State handed to this step"
        className="rounded-lg border p-5"
        style={{
          borderColor: 'color-mix(in srgb, var(--flow) 26%, transparent)',
          background: 'color-mix(in srgb, var(--flow-deep) 9%, transparent)',
        }}
      >
        <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
          handed in
        </div>
        <p className="mt-2 max-w-[64ch] text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>
          {view.stateInNote}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {view.stateIn.map((field) => (
            <li
              key={field.id}
              data-state-in={field.id}
              className={`${MONO_LABEL} rounded-full border px-3 py-[5px] text-[9px]`}
              style={{ color: 'var(--ink)', borderColor: 'var(--line-strong)' }}
            >
              {field.id}
            </li>
          ))}
        </ul>
      </section>

      {showStage ? (
        <>
          {/* ------------------------------------------------------- the instrument */}
          <section data-testid={`run-stage-${view.n}`} aria-label="The framework, running">
            <div key={`stage-${view.n}-${replayKey}`}>{view.stage}</div>
          </section>

          {/* ------------------------------------------------------ the interaction */}
          <section aria-label="Your move">{view.interactionNode}</section>
        </>
      ) : (
        <p
          data-testid={`run-stage-deferred-${view.n}`}
          className="rounded-md border border-dashed px-4 py-3 text-[13px] leading-relaxed"
          style={{ borderColor: 'var(--line)', color: 'var(--faint)' }}
        >
          The {view.frameworkName} diagram and this step&apos;s interaction load with the step. The
          finding it produced is below, in full, with its sources — and the instrument itself runs
          on its own page at /frameworks.
        </p>
      )}

      {/* -------------------------------------------------------------- the analysis */}
      <section
        data-testid="run-analysis"
        data-analysis-step={view.n}
        aria-label="What this step found"
        className="grid gap-5"
      >
        <div>
          <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--evidence)' }}>
            what it found
          </div>
          <p
            className="font-narrative mt-3 max-w-[26ch] text-[clamp(22px,3vw,32px)] leading-[1.1] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            {view.reveal}
          </p>
        </div>
        {view.analysis}
      </section>

      {/* ---------------------------------------------------------------- handed on */}
      <section data-testid={`run-handoff-${view.n}`} aria-label="Handoff" className="grid gap-4">
        <p className="max-w-[64ch] text-[15px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
          {view.handoff}
        </p>
        {next ? (
          <>
            <RouteHandoff
              from={{ label: view.frameworkName, caption: `step ${pad(view.n)}` }}
              to={{ label: next.frameworkName, caption: `step ${pad(next.n)}` }}
              payload={view.writes
                .slice(0, 2)
                .map((w) => w.field)
                .join(' · ')}
            />
            {onNext ? (
              <button
                type="button"
                data-testid={`run-continue-${view.n}`}
                onClick={onNext}
                className={`${MONO_LABEL} justify-self-start rounded-md border px-4 py-2 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]`}
                style={{
                  color: 'var(--ink)',
                  borderColor: 'color-mix(in srgb, var(--flow) 55%, transparent)',
                  background: 'color-mix(in srgb, var(--flow-deep) 18%, transparent)',
                }}
              >
                continue · {next.title.toLowerCase()}
              </button>
            ) : null}
          </>
        ) : null}
      </section>
    </article>
  );
}

export default StepStage;
