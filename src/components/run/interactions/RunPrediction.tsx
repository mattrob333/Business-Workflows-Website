'use client';

/**
 * `prediction` — the run's use of the §6 challenge widget.
 *
 * `PredictionPrompt` already owns the mechanic (commit, then earn the reveal, with the reveal
 * absent from the DOM until a pick is recorded). This wrapper adds the two things the run
 * needs on top of it: the uniform `data-run-interaction` frame the walk drives, and the
 * report up the control channel so the state rail lands this step's fields at the moment the
 * visitor commits rather than on a timer.
 *
 * The reveal is a node rendered on the server — claims, chips and evidence refs resolved out
 * of Beacon's pack during the export. This island never holds a figure of its own.
 */

import { useState, type ReactNode } from 'react';
import { PredictionPrompt, type PredictionOption } from '@/components';
import { useRunControls } from '../controls';

export interface RunPredictionProps {
  question: string;
  options: PredictionOption[];
  /** Omit where the prompt genuinely has no single right answer. */
  correctId?: string;
  /** Revealed once a pick is recorded. Server-rendered. */
  reveal: ReactNode;
}

export function RunPrediction({ question, options, correctId, reveal }: RunPredictionProps) {
  const { markInteracted } = useRunControls();
  const [picked, setPicked] = useState(false);

  return (
    <div
      data-run-interaction="prediction"
      data-interacted={picked ? 'true' : 'false'}
      data-testid="run-prediction"
    >
      <PredictionPrompt
        question={question}
        options={options}
        {...(correctId !== undefined ? { correctId } : {})}
        kicker="predict before the reveal"
        onPick={() => {
          setPicked(true);
          markInteracted();
        }}
      >
        {reveal}
      </PredictionPrompt>
    </div>
  );
}

export default RunPrediction;
