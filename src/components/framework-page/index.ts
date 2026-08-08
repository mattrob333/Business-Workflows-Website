/**
 * The framework-page pattern (S3) — 03-content-spec's seven sections as composable pieces.
 *
 * Import the *pattern* from here. The per-framework configs live in `./configs` and are
 * reached through `frameworkPageConfig()`, which is what `app/frameworks/[slug]` calls.
 *
 * The pieces are server components unless interaction forces otherwise; the four client
 * islands are `ExplanationAct` (it must read `prefers-reduced-motion` to stage the act),
 * `ShareRow`, `IncomingState`, and the two per-framework interaction widgets.
 */

export { ClaimLine, ClaimList, EvidenceChips, MetricLine } from './Claims';
export type { ClaimLineProps, ClaimListProps, EvidenceChipsProps, MetricLineProps } from './Claims';
export { ConstraintVerdict } from './ConstraintVerdict';
export type { ConstraintVerdictProps } from './ConstraintVerdict';
export { ExplanationAct } from './ExplanationAct';
export type { ExplanationActProps } from './ExplanationAct';
export { HandoffSection } from './HandoffSection';
export type { HandoffSectionProps } from './HandoffSection';
export { IncomingState } from './IncomingState';
export type { IncomingCompany, IncomingSource, IncomingStateProps } from './IncomingState';
export { LockedPanel } from './LockedPanel';
export { PageSection } from './PageSection';
export type { PageSectionProps } from './PageSection';
export { ShareRow } from './ShareRow';
export { StatePanel } from './StatePanel';
export type { StatePanelProps } from './StatePanel';
export { chipStatus, evidenceSource, metricText } from './evidence';
export { handoffHref, handoffTargets, incomingSources } from './handoff';
export type { HandoffTarget } from './handoff';
export type {
  ExploreSpec,
  FrameworkPageConfig,
  LessonSpec,
  PredictionSpec,
  ShowpieceSpec,
} from './types';
