/**
 * The content contract for the flagship Strategy Run (04-phases S5).
 *
 * 02-architecture puts the run's authored substance here: *"an ordered list of `RunStep`s
 * ({framework, stateIn, interaction, stateOut, reveal copy, prediction prompt}).
 * Deterministic: same walk, same story, every time."* The registry (`src/registry/runs.ts`)
 * owns the run's **structure** — which framework each step uses, what state it is handed and
 * what it writes back, which learning mechanic it carries. This module owns everything the
 * visitor actually reads and touches, and is checked against that structure at build time by
 * `assertRunContentMatchesRegistry`.
 *
 * ## Why `reveal` and `predictionPrompt` live here
 *
 * `RunStep` declares both fields and S1 stubbed them `null` "for S5". They are still `null`:
 * `src/registry/registry.test.ts` asserts exactly that for all twelve steps and is not this
 * slice's to change (team rule 4 — the registry is a seam file). The copy therefore lands
 * where 02-architecture's content model already said it belongs, in the same shape, so that
 * lifting it into the registry later is a mechanical move rather than a rewrite. See the
 * note in `./index.ts`.
 *
 * ## Determinism
 *
 * Nothing in a `RunStepContent` depends on how the visitor arrived, what they clicked on an
 * earlier step, or anything stored in the browser. Step *k* renders identically whether it
 * was reached by walking or by pasting `?step=k` — which is what makes the run resumable by
 * URL and what makes the state rail's contents a pure function of the step number.
 */

import type { ReactNode } from 'react';
import type { ClaimStatus } from '@/components';
import type { EvidenceId } from '@/lib/claim';
import type { FrameworkId, RunInteraction, StateField } from '@/registry';

/**
 * One line of the save file: a typed field, the value this step wrote into it, how sure the
 * run is about that value, and the evidence objects behind it.
 *
 * A write is not a sentence about the business — it is a value in a named field, which is
 * the whole argument the site is making about what frameworks pass to each other.
 */
export interface RunWrite {
  readonly field: StateField;
  /** What landed in the field. Short enough to read in a rail. */
  readonly value: string;
  /** The honesty chip carried into the rail (00-LAW Ruling 4). */
  readonly status: ClaimStatus;
  /** Evidence objects behind the value. Required wherever the value carries a figure. */
  readonly refs?: readonly EvidenceId[];
  /** A second write to a field an earlier step already populated. */
  readonly revises?: boolean;
}

/** One scripted step: the state-in framing, the stage, the interaction, the analysis. */
export interface RunStepContent {
  readonly n: number;
  /** Must equal the registry step's framework. */
  readonly framework: FrameworkId;
  /** Must equal the registry step's interaction. */
  readonly interaction: RunInteraction;
  /** One sentence under the step title. */
  readonly lede: string;
  /** What the step was handed, in the run's own voice. Sits above the state-in fields. */
  readonly stateInNote: string;
  /**
   * The challenge-mode prompt, shown before the step pays out — `RunStep.predictionPrompt`
   * in every sense but its current home. Every step has one, not only the five whose
   * mechanic is `prediction`: committing to an answer is what makes the reveal land.
   */
  readonly predictionPrompt: string;
  /** The one-line authored finding — `RunStep.reveal`'s copy. Heads the analysis panel. */
  readonly reveal: string;
  /** The diagram: a motion recipe bound to Beacon's pack, or an authored SVG. */
  readonly stage: ReactNode;
  /** The interaction island. Carries `data-run-interaction`; see `components/run`. */
  readonly interactionNode: ReactNode;
  /** The authored analysis. Every figure inside a claim block (Ruling 4). */
  readonly analysis: ReactNode;
  /** The handoff line into the next step. Digit-free. */
  readonly handoff: string;
  /** What this step writes to the shared business state. Covers the registry's `stateOut`. */
  readonly writes: readonly RunWrite[];
  /** Authored pacing budget. The twelve sum to the 12–18 minute completion target. */
  readonly minutes: number;
}
