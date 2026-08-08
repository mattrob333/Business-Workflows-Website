'use client';

/**
 * The run shell — header, navigation, state rail, and the step machinery (04-phases S5).
 *
 * ## Resumable by URL
 *
 * The step lives in a **query parameter**, `?step=N`, parsed on the client.
 *
 * The route is one statically exported document (`output: 'export'`), so a query string costs
 * no extra pages, survives being pasted anywhere, and — unlike a fragment — never collides
 * with in-page anchors or gets eaten by a browser's scroll restoration. It also matches the
 * URL contract S3 already established for handoffs (`?company=&from=&carries=`), so the site
 * speaks one language about carried state. `useSearchParams` is deliberately not used: on a
 * statically exported route that hook forces the page under a Suspense boundary and returns
 * empty during prerender, which is a lot of machinery for a value the first paint should not
 * depend on anyway (the same reasoning as `framework-page/IncomingState`).
 *
 * Navigation writes history entries with `pushState`, and `popstate` is honoured, so the
 * browser's back button walks the run backwards — which is what a visitor expects from
 * something that looks like twelve pages. Every step link is a real `<a href="?step=N">`, so
 * middle-click, copy-link and keyboard activation all behave; the click handler only
 * intercepts to avoid the round trip.
 *
 * ## The two-pass render, and why it exists
 *
 * The server renders **all twelve steps and every rail row**. With JavaScript off that is the
 * whole run as a readable document with every diagram in its final state, which is the bar
 * 00-LAW Ruling 7 sets. After hydration the shell collapses to the active step and unmounts
 * the rest.
 *
 * Unmounting rather than hiding is load-bearing for the amber law: `display: none` does not
 * stop `getComputedStyle` reporting a colour, so a hidden step eleven would put amber in the
 * document at step one — passing review by eye and failing it by audit. The run keeps the
 * promise structurally instead: before step eleven the constraint surfaces are not in the DOM.
 *
 * ## What the shell knows
 *
 * Nothing about frameworks, companies or evidence. It receives finished nodes and a little
 * plain data (see `./types`), which is what keeps the registry and Beacon's twenty-object pack
 * out of the browser bundle entirely.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';
import { LenisProvider, useHasMounted } from '@/lib/motion-utils';
import { RunControlsProvider, type RunControls } from './controls';
import { ReplayControl } from './ReplayControl';
import { StateRail } from './StateRail';
import { StepStage } from './StepStage';
import type { RailRow, StepView } from './types';

export interface RunShellProps {
  runTitle: string;
  businessQuestion: string;
  companyName: string;
  /** Authored total, printed in the header. Words, not a figure to be sourced. */
  durationLabel: string;
  steps: readonly StepView[];
  /** Every row the run writes, in step order. */
  rail: readonly RailRow[];
  /** Framework id → position-in-graph locator, rendered on the server. */
  locators: Readonly<Record<string, ReactNode>>;
  footerLine: string;
}

const STEP_PARAM = 'step';

function clampStep(value: number, total: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(total, Math.max(1, Math.trunc(value)));
}

function readStepFromLocation(total: number): number {
  if (typeof window === 'undefined') return 1;
  const raw = new URLSearchParams(window.location.search).get(STEP_PARAM);
  if (raw === null) return 1;
  return clampStep(Number(raw), total);
}

export function RunShell({
  runTitle,
  businessQuestion,
  companyName,
  durationLabel,
  steps,
  rail,
  locators,
  footerLine,
}: RunShellProps) {
  const total = steps.length;
  const mounted = useHasMounted();

  const [step, setStep] = useState(1);
  const [runKey, setRunKey] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const [interacted, setInteracted] = useState<readonly number[]>([]);

  /* ------------------------------------------------------------- URL wiring */

  useEffect(() => {
    setStep(readStepFromLocation(total));
    const onPop = () => setStep(readStepFromLocation(total));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [total]);

  const go = useCallback(
    (next: number, push = true) => {
      const target = clampStep(next, total);
      setStep(target);
      setReplayKey(0);
      if (push && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set(STEP_PARAM, String(target));
        window.history.pushState(null, '', url);
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    },
    [total],
  );

  /* ---------------------------------------------------------- run controls */

  const controls = useMemo<RunControls>(
    () => ({
      step,
      interacted: interacted.includes(step),
      markInteracted: () =>
        setInteracted((prev) => (prev.includes(step) ? prev : [...prev, step])),
      replayStep: () => setReplayKey((k) => k + 1),
      restartRun: () => {
        setInteracted([]);
        setReplayKey(0);
        setRunKey((k) => k + 1);
        go(1);
      },
    }),
    [step, interacted, go],
  );

  const active = steps[step - 1] ?? steps[0];
  const next = steps[step];
  const previous = steps[step - 2];
  const landed = interacted.includes(step);

  if (!active) return null;

  const stepHref = (n: number) => `?${STEP_PARAM}=${n}`;

  return (
    <LenisProvider>
      <RunControlsProvider value={controls}>
        <div data-testid="run-root" data-step={step} data-total-steps={total} className="relative">
          {/*
            No-JS: the two-pass render leaves every step but the first with `hidden`, and the
            rail's future rows with it. Without JavaScript there is no second pass, so the
            document reveals itself instead of stopping at step one.
          */}
          <noscript>
            <style>{`[data-run-step],[data-rail-row]{display:block!important}[data-testid="run-nav"],[data-testid="replay-control"]{display:none!important}`}</style>
          </noscript>

          {/* ------------------------------------------------------------- header */}
          <header
            data-testid="run-header"
            className="sticky top-0 z-30 border-b"
            style={{
              borderColor: 'var(--line)',
              background: 'color-mix(in srgb, var(--void) 88%, transparent)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <div className="mx-auto w-full max-w-7xl px-5 py-3 sm:px-8">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/*
                  00-LAW Ruling 4: the run labels itself a simulation, visibly, for its entire
                  length. The chip is in the sticky header rather than beside the first
                  paragraph precisely so that it cannot scroll out of the argument.
                */}
                <span
                  data-testid="simulation-chip"
                  className={`${MONO_LABEL} inline-flex items-center gap-2 rounded-full border px-3 py-[5px] text-[9px]`}
                  style={{
                    color: 'var(--muted)',
                    borderColor: 'var(--line-strong)',
                    background: 'color-mix(in srgb, var(--raised) 60%, transparent)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-[5px] w-[5px] rounded-full"
                    style={{ background: 'var(--flow)' }}
                  />
                  simulation
                </span>

                <div className="min-w-0">
                  <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                    strategy run · {companyName.toLowerCase()}
                  </div>
                  <div className="truncate text-[13px]" style={{ color: 'var(--ink)' }}>
                    {runTitle}
                  </div>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span
                    data-testid="run-progress-label"
                    className={`${MONO_LABEL} text-[10px] tabular-nums`}
                    style={{ color: 'var(--muted)' }}
                  >
                    step {step} / {total}
                  </span>
                  <ReplayControl />
                </div>
              </div>

              {/* progress + direct step links */}
              <nav data-testid="run-nav" aria-label="Run steps" className="mt-3">
                <ol className="flex items-center gap-[3px]">
                  {steps.map((s) => {
                    const state = s.n < step ? 'done' : s.n === step ? 'current' : 'ahead';
                    return (
                      <li key={s.n} className="flex-1">
                        <a
                          href={stepHref(s.n)}
                          data-step-link={s.n}
                          data-state={state}
                          aria-current={s.n === step ? 'step' : undefined}
                          title={`Step ${s.n} · ${s.title}`}
                          onClick={(e) => {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                            e.preventDefault();
                            go(s.n);
                          }}
                          className={`${FOCUS_RING} block h-[6px] rounded-full transition-colors`}
                          style={{
                            background:
                              state === 'current'
                                ? 'var(--flow)'
                                : state === 'done'
                                  ? 'color-mix(in srgb, var(--flow) 45%, transparent)'
                                  : 'var(--line)',
                          }}
                        >
                          <span className="sr-only">
                            Step {s.n}: {s.title}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>
          </header>

          {/* --------------------------------------------------------------- body */}
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:py-16">
            <main key={`run-${runKey}`} className="min-w-0">
              {mounted ? (
                <StepStage
                  key={`step-${active.n}-${runKey}`}
                  view={active}
                  totalSteps={total}
                  replayKey={replayKey}
                  next={
                    next ? { n: next.n, frameworkName: next.frameworkName, title: next.title } : undefined
                  }
                  onNext={next ? () => go(next.n) : undefined}
                />
              ) : (
                steps.map((view) => {
                  const after = steps[view.n];
                  return (
                    <StepStage
                      key={`ssr-step-${view.n}`}
                      view={view}
                      totalSteps={total}
                      replayKey={0}
                      hidden={view.n !== 1}
                      showStage={view.n === 1}
                      next={
                        after
                          ? { n: after.n, frameworkName: after.frameworkName, title: after.title }
                          : undefined
                      }
                    />
                  );
                })
              )}

              {/* prev / next */}
              <nav
                aria-label="Step navigation"
                data-testid="run-step-nav"
                className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
                style={{ borderColor: 'var(--line)' }}
              >
                <a
                  href={stepHref(Math.max(1, step - 1))}
                  data-testid="run-prev"
                  aria-disabled={previous ? undefined : true}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    if (previous) go(previous.n);
                  }}
                  className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-4 py-2 text-[10px]`}
                  style={{
                    color: previous ? 'var(--muted)' : 'var(--faint)',
                    borderColor: 'var(--line)',
                    opacity: previous ? 1 : 0.45,
                    pointerEvents: previous ? 'auto' : 'none',
                  }}
                >
                  ← previous step
                </a>
                <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                  {durationLabel}
                </span>
                <a
                  href={stepHref(Math.min(total, step + 1))}
                  data-testid="run-next"
                  aria-disabled={next ? undefined : true}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    if (next) go(next.n);
                  }}
                  className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-4 py-2 text-[10px]`}
                  style={{
                    color: next ? 'var(--ink)' : 'var(--faint)',
                    borderColor: next
                      ? 'color-mix(in srgb, var(--flow) 45%, transparent)'
                      : 'var(--line)',
                    background: next
                      ? 'color-mix(in srgb, var(--flow-deep) 14%, transparent)'
                      : 'transparent',
                    opacity: next ? 1 : 0.45,
                    pointerEvents: next ? 'auto' : 'none',
                  }}
                >
                  next step →
                </a>
              </nav>
            </main>

            {/* ---------------------------------------------------------- the rail */}
            <div className="lg:sticky lg:top-[7.5rem] lg:self-start">
              <div className="mb-4">
                <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                  the question
                </div>
                <p className="mt-1 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
                  {businessQuestion}
                </p>
              </div>
              {/*
                One locator, in the rail, swapped as the run moves between instruments — rather
                than one per step. `GraphMiniMap` embeds the whole seventeen-node graph, so
                twelve of them is fifty kilobytes of duplicated SVG for a sentence that only
                ever needs to be true about the step you are on.
              */}
              {/*
                `GraphMiniMap` prints the current framework's name inside its own viewBox, and a
                node near either edge of the 1500-unit canvas has that label clipped by the SVG.
                At rail width it reads as breakage, so the internal label is suppressed here and
                the caption below carries the name instead. The map itself is untouched.
              */}
              <div data-testid="run-locator" className="mb-4 [&_svg_text]:hidden">
                {locators[active.frameworkId]}
                <div className={`${MONO_LABEL} mt-2 text-[9px]`} style={{ color: 'var(--faint)' }}>
                  {active.frameworkName.toLowerCase()} · you are here
                </div>
              </div>
              <StateRail rows={rail} current={step} landed={landed} mounted={mounted} />
            </div>
          </div>

          <footer
            className="mx-auto w-full max-w-7xl border-t px-5 py-10 sm:px-8"
            style={{ borderColor: 'var(--line)' }}
          >
            <p className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              {footerLine}
            </p>
          </footer>
        </div>
      </RunControlsProvider>
    </LenisProvider>
  );
}

export default RunShell;
