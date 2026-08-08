/**
 * The client contract for the run shell.
 *
 * Everything below is either plain data or a **node the server already rendered**. That split
 * is the performance discipline the slice was given: the registry, the seventeen-record graph
 * and Beacon's evidence pack never cross into the browser bundle — the page resolves them
 * during the static export and hands the shell finished markup plus the handful of strings it
 * needs to navigate, label and count. The islands underneath decide what is *visible*; they
 * never decide what is *true* (the same rule the S3 interaction islands obey).
 */

import type { ReactNode } from 'react';
import type { ClaimStatus } from '@/components';

export type RunInteractionKind =
  | 'prediction'
  | 'assumption-slider'
  | 'lens-compare'
  | 'event-injection'
  | 'consequence'
  | 'replay';

/** One line of the save file, already resolved: field, value, status, sourced chips. */
export interface RailRow {
  /** Stable key — `step:field:index`. */
  readonly key: string;
  readonly step: number;
  readonly field: string;
  readonly label: string;
  readonly value: string;
  readonly status: ClaimStatus;
  /** A second write to a field an earlier step populated. Rendered as a revision. */
  readonly revises: boolean;
  /** Server-rendered evidence chips, where the value carries a figure. */
  readonly sourced: ReactNode;
  /** The framework that wrote it. */
  readonly frameworkName: string;
}

/** One step, fully rendered on the server and handed over as nodes. */
export interface StepView {
  readonly n: number;
  readonly frameworkId: string;
  readonly frameworkName: string;
  readonly groupLabel: string;
  readonly coreQuestion: string;
  readonly title: string;
  readonly lede: string;
  /** The one-line finding, printed at the head of the analysis. Digit-free by contract. */
  readonly reveal: string;
  readonly interaction: RunInteractionKind;
  readonly stateInNote: string;
  readonly stateIn: readonly { readonly id: string; readonly label: string }[];
  readonly stage: ReactNode;
  readonly interactionNode: ReactNode;
  readonly analysis: ReactNode;
  readonly handoff: string;
  /** The rows this step writes — shown pending in the rail until the step is left behind. */
  readonly writes: readonly RailRow[];
  readonly minutes: number;
}
