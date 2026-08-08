/**
 * The 01-design-system §6 component set. Build once, reuse everywhere.
 *
 * Anything a page needs that is not in here is either a recipe (`src/motion/`) or a new
 * component — and a new component means a new row in §6 first (team rule 2).
 */

export { ActMarker, type ActMarkerProps } from './ActMarker';
export { ConstraintBadge, type ConstraintBadgeProps } from './ConstraintBadge';
export { EvidenceRef, type EvidenceRefProps, type EvidenceSource } from './EvidenceRef';
export { GlassPanel, type GlassPanelProps } from './GlassPanel';
export { GraphEdge, type GraphEdgeProps, type EdgeTone } from './GraphEdge';
export {
  GraphNode,
  type GraphNodeProps,
  type GraphNodeKind,
  type GraphNodeState,
} from './GraphNode';
export { Kicker, type KickerProps } from './Kicker';
export { LensSwitch, type Lens, type LensSwitchProps } from './LensSwitch';
export {
  PredictionPrompt,
  type PredictionOption,
  type PredictionPromptProps,
} from './PredictionPrompt';
export {
  StatusChip,
  statusLabel,
  CLAIM_STATUSES,
  type ClaimStatus,
  type StatusChipProps,
} from './StatusChip';
export { WaitlistBar, type WaitlistBarProps, type WaitlistState } from './WaitlistBar';
export { FOCUS_RING, MONO_LABEL } from './styles';
