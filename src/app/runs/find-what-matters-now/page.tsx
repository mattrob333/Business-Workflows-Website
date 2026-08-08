import type { Metadata } from 'next';

import { EvidenceChips } from '@/components/framework-page';
import { GraphMiniMap } from '@/components/GraphMiniMap';
import { RunShell } from '@/components/run';
import type { RailRow, RunInteractionKind, StepView } from '@/components/run';
import {
  RUN_CONTENT,
  assertRunContentMatchesRegistry,
} from '@/content/runs/find-what-matters-now';
import { company } from '@/content/runs/find-what-matters-now/pack';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';
import { GROUPS, byId, runById, stateField } from '@/registry';

/**
 * `/runs/find-what-matters-now` — the flagship scripted Strategy Run (04-phases S5).
 *
 * ## What this route is
 *
 * Twelve scripted steps on Beacon Mechanical, BMC → Five Forces + VRIO → SWOT/TOWS → Theory of
 * Constraints → RACI, every step interactive, a `SIMULATION` chip pinned in the header for the
 * entire run, and a state rail in which the company's model visibly accretes. It is the site's
 * conversion engine: the twelve-to-eighteen minutes in which a visitor stops reading about a
 * compiler and watches one run.
 *
 * ## Where the work happens
 *
 *   `src/registry/runs.ts`                     the structure — framework, state in, state out,
 *                                              mechanic, per step. Not edited by this slice.
 *   `src/content/runs/find-what-matters-now/`  the substance — twelve `RunStepContent` records,
 *                                              checked against the registry at build time.
 *   `src/components/run/`                      the machinery — shell, rail, stage, replay, and
 *                                              the six interaction islands.
 *
 * This file is the seam between them, and it is deliberately thin: it resolves the registry and
 * Beacon's pack into finished nodes and plain data, and hands them to a client shell that has
 * never heard of either. That is what keeps the seventeen-record graph and the twenty-object
 * evidence pack out of the browser bundle while a page made of twelve framework diagrams still
 * stays inside the performance budget (00-LAW Ruling 7).
 *
 * ## Resumable by URL
 *
 * `?step=N`, parsed on the client (`components/run/RunShell` documents the choice and the
 * alternatives). One exported document, no extra routes, and the same URL grammar S3 uses for
 * framework handoffs. What makes the resume *honest* rather than cosmetic is that the state rail
 * is a pure function of the step number: arriving at `?step=7` shows exactly the writes of steps
 * one to six, because those writes are authored content and not session state. Nothing is stored
 * in the browser and nothing needs to be.
 *
 * ## The amber law
 *
 * The run's only amber is at steps eleven and twelve, inside declared constraint surfaces —
 * `fw/toc-flow`'s computed stage, `ConstraintBadge`, and `ConstraintVerdict`, all three of which
 * already carry the pragma and are reused rather than re-implemented. Before step eleven those
 * surfaces are not merely hidden, they are **not mounted**: `RunShell` renders one step at a
 * time after hydration, so a colour audit at step one finds nothing to forgive (00-LAW Ruling 2,
 * team rule 3). `tests/run.spec.ts` asserts both halves.
 */

export const metadata: Metadata = {
  title: 'Find What Matters Now — a Strategy Run — The Strategy Stack',
  description:
    'Twelve scripted steps on one company: model it, read the terrain, test the advantage, mint the options, find the one constraint that binds, and route the work.',
};

const FOOTER_LINE =
  'THE STRATEGY STACK · POWERED BY INSTINCT · BUSINESS FRAMEWORKS, FINALLY RUNNING.';

/** Twelve to eighteen minutes (04-phases S5), printed in words rather than as a claim. */
const DURATION_LABEL = 'about fifteen minutes, end to end';

export default function FindWhatMattersNowPage() {
  // Fails the static export rather than shipping a run that disagrees with the graph.
  assertRunContentMatchesRegistry();

  const run = runById('find-what-matters-now');

  /* ------------------------------------------------------------------ the rail */

  const seen = new Set<string>();
  const rail: RailRow[] = RUN_CONTENT.flatMap((step) =>
    step.writes.map((write, i) => {
      const revises = write.revises ?? seen.has(write.field);
      seen.add(write.field);
      return {
        key: `${step.n}:${write.field}:${i}`,
        step: step.n,
        field: write.field,
        label: stateField(write.field).label,
        value: write.value,
        status: write.status,
        revises,
        frameworkName: byId(step.framework).name,
        sourced:
          write.refs && write.refs.length > 0 ? (
            <EvidenceChips company={company} refs={write.refs} />
          ) : null,
      } satisfies RailRow;
    }),
  );

  /* ----------------------------------------------------------------- the steps */

  const steps: StepView[] = RUN_CONTENT.map((content) => {
    const record = run.steps[content.n - 1];
    if (!record) throw new Error(`No registry record for run step ${content.n}`);
    const framework = byId(content.framework);
    const group = GROUPS.find((g) => g.id === framework.group);

    return {
      n: content.n,
      frameworkId: framework.id,
      frameworkName: framework.name,
      groupLabel: group?.label ?? framework.group,
      coreQuestion: framework.coreQuestion,
      title: record.title,
      lede: content.lede,
      reveal: content.reveal,
      interaction: content.interaction as RunInteractionKind,
      stateInNote: content.stateInNote,
      stateIn: record.stateIn.map((field) => ({ id: field, label: stateField(field).label })),
      stage: content.stage,
      interactionNode: content.interactionNode,
      analysis: content.analysis,
      handoff: content.handoff,
      writes: rail.filter((row) => row.step === content.n),
      minutes: content.minutes,
    } satisfies StepView;
  });

  /* -------------------------------------------------- one locator per instrument */

  const locators: Record<string, React.ReactNode> = {};
  for (const id of new Set(RUN_CONTENT.map((s) => s.framework))) {
    locators[id] = <GraphMiniMap current={id} showLabel={false} />;
  }

  return (
    <main data-testid="run-page-root" data-run={run.id} className="relative">
      {/*
        Ruling 7: with JavaScript off, every diagram must be readable in its final state.
        Framer's initial variants would otherwise hold the recipes at opacity 0.
      */}
      <noscript>
        <style>{`[data-recipe],[data-recipe] *{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>

      <AtmoMeshDrift seed={12} count={3} intensity={0.07} />
      <Grain />

      <RunShell
        runTitle={run.title}
        businessQuestion={run.businessQuestion}
        companyName={company.name}
        durationLabel={DURATION_LABEL}
        steps={steps}
        rail={rail}
        locators={locators}
        footerLine={FOOTER_LINE}
      />
    </main>
  );
}
