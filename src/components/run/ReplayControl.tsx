'use client';

/**
 * `replay` — the last of the appendix §9 learning mechanics, in two sizes.
 *
 * **Replay this step** re-keys the current step's diagram so its recipe performs again from
 * the first frame. It deliberately does *not* touch the interaction: a visitor who wants to
 * watch the gates open a second time has not thereby un-predicted anything, and throwing away
 * their answer to give them the animation would be a strange trade.
 *
 * **Restart the run** is the honest reset — step one, every island blank, the state rail back
 * to an empty save file. It is the only control that discards work, so it lives behind its own
 * button with its own word.
 *
 * Under reduced motion a replay is still meaningful: the recipes render their terminal state,
 * so the diagram re-arrives rather than re-animating. That is the designed behaviour, not a
 * degraded one (01-design-system §4).
 */

import { FOCUS_RING, MONO_LABEL } from '@/components';
import { useRunControls } from './controls';

export interface ReplayControlProps {
  /** `header` is the compact pair; `panel` is the bordered block used inside a step. */
  variant?: 'header' | 'panel';
  className?: string;
}

export function ReplayControl({ variant = 'header', className = '' }: ReplayControlProps) {
  const { replayStep, restartRun } = useRunControls();
  const compact = variant === 'header';

  return (
    <div
      data-testid="replay-control"
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      <button
        type="button"
        data-testid="replay-step"
        onClick={replayStep}
        className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-3 ${
          compact ? 'py-[5px] text-[9px]' : 'py-2 text-[10px]'
        } transition-colors`}
        style={{
          color: 'var(--muted)',
          borderColor: 'var(--line)',
          background: 'transparent',
        }}
      >
        replay this step
      </button>
      <button
        type="button"
        data-testid="restart-run"
        onClick={restartRun}
        className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-3 ${
          compact ? 'py-[5px] text-[9px]' : 'py-2 text-[10px]'
        } transition-colors`}
        style={{
          color: 'var(--muted)',
          borderColor: 'var(--line)',
          background: 'transparent',
        }}
      >
        restart the run
      </button>
    </div>
  );
}

export default ReplayControl;
