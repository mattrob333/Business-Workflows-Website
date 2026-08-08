'use client';

/**
 * `replay` as step twelve's mechanic.
 *
 * The run's last interaction is not another puzzle — the argument is already made. It is the
 * offer the whole site is built to earn: *watch it again, and watch it knowing what it means*.
 * Pressing replay re-keys the routing diagram above, so the packet travels the route a second
 * time and stops at the same human checkpoint, now with the reason in hand.
 *
 * The recap underneath is server-rendered: the twelve steps as one sentence each, which is the
 * closest thing this build has to an exported report, and the honest version of it — a list of
 * what was decided and how sure the run is about each piece.
 */

import { useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';
import { useRunControls } from '../controls';
import { Frame } from './Frame';

export interface RunReplayStepProps {
  prompt: string;
  instruction?: string;
  /** The run in twelve lines, rendered on the server. */
  recap: ReactNode;
}

export function RunReplayStep({ prompt, instruction, recap }: RunReplayStepProps) {
  const { replayStep, restartRun, markInteracted } = useRunControls();
  const [replayed, setReplayed] = useState(false);

  return (
    <Frame
      kind="replay"
      prompt={prompt}
      done={replayed}
      {...(instruction !== undefined ? { instruction } : {})}
    >
      <div data-testid="run-replay" data-replayed={replayed ? 'true' : 'false'} className="grid gap-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="replay-routing"
            onClick={() => {
              replayStep();
              setReplayed(true);
              markInteracted();
            }}
            className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-4 py-2 text-[10px]`}
            style={{
              color: 'var(--ink)',
              borderColor: 'color-mix(in srgb, var(--flow) 55%, transparent)',
              background: 'color-mix(in srgb, var(--flow-deep) 20%, transparent)',
            }}
          >
            route the packet again
          </button>
          <button
            type="button"
            data-testid="restart-from-step-twelve"
            onClick={restartRun}
            className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-4 py-2 text-[10px]`}
            style={{ color: 'var(--muted)', borderColor: 'var(--line)' }}
          >
            run it again from the top
          </button>
        </div>

        {replayed ? (
          <div data-testid="run-recap" className="grid gap-3">
            {recap}
          </div>
        ) : (
          <p className="max-w-[62ch] text-[13px] leading-relaxed" style={{ color: 'var(--faint)' }}>
            Route it once more and the run prints what it decided, step by step, with the status
            on every line.
          </p>
        )}
      </div>
    </Frame>
  );
}

export default RunReplayStep;
