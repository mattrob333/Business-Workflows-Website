/**
 * The six §9 learning mechanics, as run interactions.
 *
 * Every one of them wears the same frame (`data-run-interaction`, `data-interacted`), receives
 * its substance as server-rendered nodes, and reports completion up the control channel so the
 * state rail can land the step's writes at the moment they are earned.
 */

export { AssumptionSlider, type AssumptionSliderProps, type AssumptionStop } from './AssumptionSlider';
export {
  ConsequencePicker,
  type ConsequenceEffect,
  type ConsequenceOption,
  type ConsequencePickerProps,
} from './ConsequencePicker';
export { EventInjection, type EventInjectionProps, type EventTarget } from './EventInjection';
export { Frame, type FrameProps } from './Frame';
export { RunLensCompare, type RunLensCompareProps } from './RunLensCompare';
export { RunPrediction, type RunPredictionProps } from './RunPrediction';
export { RunReplayStep, type RunReplayStepProps } from './RunReplayStep';
