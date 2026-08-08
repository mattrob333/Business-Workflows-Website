/**
 * The framework-page contract (S3).
 *
 * 03-content-spec's seven-section pattern is *structure*, and structure belongs to the
 * page, not to the framework. What varies between the six full pages is small and
 * enumerable, so it lives here as one typed record per framework:
 *
 *   showpiece  · the 01 §5 motion recipe, already bound to its example company
 *   lesson     · the MDX file from the content model (02-architecture)
 *   explore    · the prediction, the interaction island, and the compare surface
 *   unlocked   · what section 6 says this framework just made possible
 *
 * Everything else — the READS FROM / WRITES TO / BEST NEXT panel, the handoff targets and
 * the state they carry, the locked "run it on my business" door, the share row, the graph
 * locator — is derived from `src/registry` and rendered identically on all six pages. A
 * new page is therefore a config module plus a lesson, and nothing else.
 */

import type { ComponentType, ReactNode } from 'react';
import type { PredictionOption } from '@/components';
import type { FrameworkId } from '@/registry';

/** Section 1 — the animated explanation, act-pinned on the example company. */
export interface ShowpieceSpec {
  /** Must equal the registry record's `motionRecipe`; asserted at build. */
  readonly recipe: string;
  /** Printed in the margin rail (`motion/acts`). */
  readonly actTitle: string;
  /** Narrative headline over the diagram. One line, Newsreader. */
  readonly headline: ReactNode;
  /** The single supporting sentence. What the diagram is doing, not what it looks like. */
  readonly note: string;
  /** Viewport heights to pin for. Spec range 1.5–2.5 (01 §4). */
  readonly pin?: number;
  /** The recipe element, props already fed from the company's authored pack. */
  readonly diagram: ReactNode;
  /** Evidence objects the diagram was assembled from — chips under the stage. */
  readonly evidenceRefs: readonly string[];
  /** A short sourced line inside the pinned stage — usually the evidence-chip row. */
  readonly caption?: ReactNode;
  /**
   * The sourced reading of the diagram, rendered *below* the act in the normal column.
   * Anything taller than a line belongs here: a pinned stage is one viewport, and a table
   * that overflows it would be clipped rather than scrolled.
   */
  readonly reading?: ReactNode;
}

/** Section 3's predict-before-reveal step (appendix §9, adopted by Ruling 8). */
export interface PredictionSpec {
  readonly kicker?: string;
  readonly question: string;
  readonly options: PredictionOption[];
  /** Omit where the prompt has no single right answer. */
  readonly correctId?: string;
  /** Revealed only after a pick is recorded. */
  readonly reveal: ReactNode;
}

/** Section 3 — interact, predict, run, compare, inspect evidence. */
export interface ExploreSpec {
  readonly title: ReactNode;
  readonly lede: string;
  readonly prediction: PredictionSpec;
  /** The client island: change an input, watch the model react. */
  readonly interaction: ReactNode;
  /** Optional compare-lenses surface (`LensSwitch`). */
  readonly compare?: ReactNode;
}

/** Section 2 — the MDX lesson from `src/content/frameworks/<id>/lesson.mdx`. */
export interface LessonSpec {
  readonly Body: ComponentType;
  /** Repo-relative path; must equal the registry record's `lesson`. Asserted at build. */
  readonly path: string;
}

export interface FrameworkPageConfig {
  /** Must name a registry record at `depth: 'full'`. */
  readonly id: FrameworkId;
  readonly showpiece: ShowpieceSpec;
  readonly lesson: LessonSpec;
  readonly explore: ExploreSpec;
  /** Section 6: what running this just made possible. Two to four short lines. */
  readonly unlocked: readonly string[];
}
