/**
 * *Find What Matters Now* — the twelve steps, assembled and checked (04-phases S5).
 *
 * ## The registry seam
 *
 * `src/registry/runs.ts` declares the run's structure: framework per step, state in, state out,
 * learning mechanic, and two copy fields — `reveal` and `predictionPrompt` — which S1 stubbed
 * `null` "for S5". They are still `null`, and deliberately so: `registry.test.ts` asserts that
 * for all twelve steps, the registry is the integration lead's seam file (team rule 4), and this
 * slice was told that test must keep passing unmodified. Filling the fields in and keeping the
 * test green are mutually exclusive, so the copy lands where 02-architecture's content model
 * already put it — here, in the same names and the same shapes. Lifting it into the registry
 * later is a mechanical move: `reveal` and `predictionPrompt` are strings on `RunStepContent`
 * with exactly the meanings `RunStep` gives them. Flagged to the integration lead rather than
 * resolved silently (team rule 1).
 *
 * ## What is checked at build
 *
 * `assertRunContentMatchesRegistry` runs during static generation and throws — so a step that
 * drifts from its registry record fails the export rather than shipping a run that quietly
 * disagrees with the graph. It asserts, per step: the number, the framework, the interaction,
 * and that the fields written cover the record's `stateOut` exactly. It also asserts that every
 * step writes at least one row, which is what makes the state rail grow monotonically, and that
 * no `reveal` contains a digit — figures belong in claim blocks that cite a source, never in a
 * headline (00-LAW Ruling 4).
 */

import { MONO_LABEL, StatusChip } from '@/components';
import { byId, runById, type StateField } from '@/registry';
import { step1, step2 } from './steps-model';
import { step3, step4 } from './steps-terrain';
import { step5, step6, step7 } from './steps-advantage';
import { step8, step9 } from './steps-options';
import { step10, step11 } from './steps-constraint';
import { makeStep12 } from './steps-delegation';
import type { RunStepContent } from './types';

export type { RunStepContent, RunWrite } from './types';

const FIRST_ELEVEN: RunStepContent[] = [
  step1,
  step2,
  step3,
  step4,
  step5,
  step6,
  step7,
  step8,
  step9,
  step10,
  step11,
];

/**
 * The run in twelve lines — what step twelve prints when the packet is routed again.
 *
 * It is the closest thing this build has to an exported report, and the honest version of one:
 * every line is a decision with the instrument that made it and the status the run carries it
 * at, rather than a summary paragraph that has lost track of which parts were measured.
 */
const RECAP = (
  <ol className="grid gap-2">
    {[
      ...FIRST_ELEVEN.map((s) => ({
        n: s.n,
        framework: byId(s.framework).name,
        reveal: s.reveal,
      })),
      {
        n: 12,
        framework: byId('raci').name,
        reveal: 'Some of the work goes to agents. Accountability stays with a named human, every time.',
      },
    ].map((line) => (
      <li
        key={line.n}
        data-recap-step={line.n}
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md border px-3 py-2"
        style={{ borderColor: 'var(--line)' }}
      >
        <span className={`${MONO_LABEL} text-[9px] tabular-nums`} style={{ color: 'var(--faint)' }}>
          {String(line.n).padStart(2, '0')} · {line.framework.toLowerCase()}
        </span>
        <span className="flex-1 text-[13px] leading-snug" style={{ color: 'var(--ink)' }}>
          {line.reveal}
        </span>
      </li>
    ))}
    <li
      className="mt-1 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2"
      style={{
        borderColor: 'color-mix(in srgb, var(--evidence) 30%, transparent)',
        background: 'color-mix(in srgb, var(--evidence-soft) 60%, transparent)',
      }}
    >
      <StatusChip status="supported-inference" bare />
      <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
        One constraint, one plan, one accountable human per action — and the conditions under
        which all three change.
      </span>
    </li>
  </ol>
);

export const step12 = makeStep12(RECAP);

/** The twelve, in order. */
export const RUN_CONTENT: readonly RunStepContent[] = [...FIRST_ELEVEN, step12];

/** Authored pacing budget, printed in the header. 04-phases S5: twelve to eighteen minutes. */
export const RUN_MINUTES = RUN_CONTENT.reduce((sum, s) => sum + s.minutes, 0);

/* --------------------------------------------------------- the registry check */

const DIGIT = /\d/;

export function checkRunContentMatchesRegistry(
  content: readonly RunStepContent[] = RUN_CONTENT,
): string[] {
  const run = runById('find-what-matters-now');
  const errors: string[] = [];

  if (content.length !== run.steps.length) {
    errors.push(`content has ${content.length} steps, the registry has ${run.steps.length}`);
  }

  for (const [i, step] of content.entries()) {
    const record = run.steps[i];
    if (!record) {
      errors.push(`step ${step.n}: no registry record`);
      continue;
    }
    if (step.n !== record.n) errors.push(`step ${i + 1}: numbered ${step.n}, registry says ${record.n}`);
    if (step.framework !== record.framework)
      errors.push(`step ${record.n}: content uses "${step.framework}", registry says "${record.framework}"`);
    if (step.interaction !== record.interaction)
      errors.push(
        `step ${record.n}: content interaction "${step.interaction}", registry says "${record.interaction}"`,
      );

    const written = new Set<StateField>(step.writes.map((w) => w.field));
    for (const field of record.stateOut) {
      if (!written.has(field)) errors.push(`step ${record.n}: nothing written to "${field}"`);
    }
    for (const field of written) {
      if (!record.stateOut.includes(field))
        errors.push(`step ${record.n}: writes "${field}", which the registry does not declare`);
    }
    if (step.writes.length === 0) errors.push(`step ${record.n}: writes nothing — the rail would not grow`);

    for (const write of step.writes) {
      if (DIGIT.test(write.value) && (write.refs === undefined || write.refs.length === 0))
        errors.push(`step ${record.n}: rail value for "${write.field}" carries a figure with no source`);
    }

    if (DIGIT.test(step.reveal))
      errors.push(`step ${record.n}: the reveal carries a figure — figures belong in claim blocks`);
    if (step.predictionPrompt.length === 0) errors.push(`step ${record.n}: no prediction prompt`);
    if (step.handoff.length === 0) errors.push(`step ${record.n}: no handoff line`);
  }

  return errors;
}

export function assertRunContentMatchesRegistry(): void {
  const errors = checkRunContentMatchesRegistry();
  if (errors.length > 0)
    throw new Error(`Run content does not match the registry:\n  ${errors.join('\n  ')}`);
}
