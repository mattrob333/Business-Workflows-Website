'use client';

/**
 * The run's control channel.
 *
 * The twelve steps are rendered on the server and handed to `RunShell` as nodes, which means
 * every interaction island inside them is mounted *within* the shell's client tree — so a
 * context provider on the shell reaches them without any of the step content becoming a
 * client module. That is the whole trick that keeps the registry and Beacon's pack out of the
 * browser bundle while still letting a slider three levels down tell the state rail that this
 * step's writes have been earned.
 *
 * Two things travel down this channel:
 *
 *   `markInteracted()` — an island reporting that the visitor has done the thing. The rail
 *   uses it to land the current step's fields (`motion/ingest`); the shell uses it to enable
 *   the "this step is done" affordance on the next button.
 *
 *   `replayStep()` / `restartRun()` — the appendix §9 replay mechanic, reachable from the
 *   header and from step twelve.
 *
 * The default value is a working no-op set, so an island renders in isolation (and during the
 * no-JS server pass) without a provider above it.
 */

import { createContext, useContext, type ReactNode } from 'react';

export interface RunControls {
  /** 1-based index of the step currently on screen. */
  readonly step: number;
  /** Has the visitor completed this step's interaction? */
  readonly interacted: boolean;
  /** Called by an island the first time the visitor does something that counts. */
  readonly markInteracted: () => void;
  /** Re-key the current step's diagram so its recipe performs again. */
  readonly replayStep: () => void;
  /** Back to step one with every island reset. */
  readonly restartRun: () => void;
}

const NOOP: RunControls = {
  step: 1,
  interacted: false,
  markInteracted: () => undefined,
  replayStep: () => undefined,
  restartRun: () => undefined,
};

const RunControlsContext = createContext<RunControls>(NOOP);

export function RunControlsProvider({
  value,
  children,
}: {
  value: RunControls;
  children: ReactNode;
}) {
  return <RunControlsContext.Provider value={value}>{children}</RunControlsContext.Provider>;
}

export function useRunControls(): RunControls {
  return useContext(RunControlsContext);
}
