/**
 * The run machinery (04-phases S5).
 *
 * `RunShell` is the only piece the route touches; everything else is reached by the shell or
 * embedded in a step's authored content. The interaction islands are exported by path so a
 * content module picks up one mechanic without dragging the shell in behind it.
 */

export { RunShell, type RunShellProps } from './RunShell';
export { StateRail, type StateRailProps } from './StateRail';
export { StepStage, type StepStageProps } from './StepStage';
export { ReplayControl, type ReplayControlProps } from './ReplayControl';
export { CapacityLadder, type CapacityLadderProps, type LadderStage } from './CapacityLadder';
export { UtilisationBars, type UtilisationBarsProps, type UtilisationPool } from './UtilisationBars';
export { RunControlsProvider, useRunControls, type RunControls } from './controls';
export type { RailRow, RunInteractionKind, StepView } from './types';
