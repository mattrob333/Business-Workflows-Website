'use client';

/**
 * `lens-compare` — the same evidence, read by two or four different instruments.
 *
 * `LensSwitch` is the §6 component and does the work; the run adds the frame, the challenge
 * prompt, and one rule of its own: **switching a lens counts as an interaction only when the
 * visitor moves off the lens they were given.** A tab set that reports "done" for arriving on
 * its first tab would make the walk's "every step is interactive" assertion vacuous, and the
 * teaching point of this mechanic is the *second* reading, not the first.
 */

import { useState } from 'react';
import { LensSwitch, type Lens } from '@/components';
import { useRunControls } from '../controls';
import { Frame } from './Frame';

export interface RunLensCompareProps {
  prompt: string;
  instruction?: string;
  label: string;
  lenses: Lens[];
}

export function RunLensCompare({ prompt, instruction, label, lenses }: RunLensCompareProps) {
  const { markInteracted } = useRunControls();
  const [moved, setMoved] = useState(false);
  const firstId = lenses[0]?.id ?? '';

  return (
    <Frame
      kind="lens-compare"
      prompt={prompt}
      done={moved}
      {...(instruction !== undefined ? { instruction } : {})}
    >
      <LensSwitch
        label={label}
        lenses={lenses}
        onChange={(id) => {
          if (id === firstId) return;
          setMoved(true);
          markInteracted();
        }}
      />
    </Frame>
  );
}

export default RunLensCompare;
