'use client';

/**
 * The state rail — **the save file, visibly growing**.
 *
 * This is the run's signature move and the product thesis rendered as UI. A visitor watching
 * a framework perform learns what that framework does; a visitor watching typed fields
 * accumulate in a rail that never empties learns the thing the site actually exists to argue —
 * that the frameworks are one system writing into one model, and that the model is the
 * deliverable rather than any single canvas.
 *
 * ## How it accretes
 *
 * Rows arrive in three states, and the distinction is doing real work:
 *
 *   **committed** — written by a step the visitor has already left. Always present, always in
 *   full colour, and a pure function of the step number: at step *k* the rail holds exactly
 *   the writes of steps 1…*k*−1. That is what makes `?step=7` land on the same save file every
 *   time, for every visitor, with nothing read from the browser (04-phases S5: *resumable by
 *   URL*).
 *
 *   **pending** — the current step's writes, drawn as empty slots with their field names. The
 *   run tells you what this step is about to write *before* it writes it, which is the same
 *   contract the state-in panel makes at the other end.
 *
 *   **landed** — a pending row the moment the step's interaction is completed. It arrives with
 *   `motion/ingest` (fade + 12px rise, expo-out), which is the recipe for *data entering the
 *   system* and therefore the only correct one here.
 *
 * A field written twice is a **revision**, not a duplicate: `risk_register` collects from both
 * the terrain read and the injected event, and a save file that overwrote the first silently
 * would be lying about where the second came from. Revisions are marked and stack.
 *
 * ## Why `mounted` is a prop rather than a hook here
 *
 * The whole run renders every step and every row on the server, so the page is complete with
 * JavaScript off (00-LAW Ruling 7). After hydration the shell collapses to the active step,
 * and the rail collapses with it — driven by the shell's single mount flag so the two can
 * never disagree about which pass they are in.
 */

import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL, StatusChip } from '@/components';
import { DUR, EASE_EXPO_OUT, INGEST_RISE, useReducedMotion } from '@/lib/motion-utils';
import type { RailRow } from './types';

export interface StateRailProps {
  /** Every row the run will ever write, in step order. */
  rows: readonly RailRow[];
  /** 1-based active step. */
  current: number;
  /** Has the current step's interaction been completed? */
  landed: boolean;
  /** False on the server pass and the first client render — see the note above. */
  mounted: boolean;
  className?: string;
}

type RowState = 'committed' | 'landed' | 'pending' | 'future';

function rowState(row: RailRow, current: number, landed: boolean): RowState {
  if (row.step < current) return 'committed';
  if (row.step > current) return 'future';
  return landed ? 'landed' : 'pending';
}

export function StateRail({ rows, current, landed, mounted, className = '' }: StateRailProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  const states = rows.map((row) => ({ row, state: rowState(row, current, landed) }));
  const visible = mounted ? states.filter((r) => r.state !== 'future') : states;
  const written = states.filter((r) => r.state === 'committed' || r.state === 'landed');
  const pending = states.filter((r) => r.state === 'pending');
  const distinct = new Set(written.map((r) => r.row.field)).size;

  return (
    <aside
      data-testid="state-rail"
      data-fields={written.length}
      data-distinct-fields={distinct}
      data-pending={pending.length}
      data-rows={visible.length}
      data-open={open ? 'true' : 'false'}
      aria-label="Company state — the run's save file"
      className={`rounded-lg border ${className}`}
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--surface) 62%, transparent)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: 'var(--line)' }}
      >
        <div>
          <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
            company state
          </div>
          <div className="mt-1 text-[12px]" style={{ color: 'var(--faint)' }}>
            the save file, as it fills
          </div>
        </div>
        <div className="text-right">
          <div
            data-testid="rail-count"
            className="font-system text-[18px] tabular-nums"
            style={{ color: 'var(--ink)' }}
          >
            {written.length}
          </div>
          <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
            writes
          </div>
        </div>
      </div>

      {/* Collapsible below the rail's own breakpoint; always open on wide screens. */}
      <button
        type="button"
        data-testid="rail-toggle"
        aria-expanded={open}
        aria-controls="state-rail-body"
        onClick={() => setOpen((v) => !v)}
        className={`${MONO_LABEL} ${FOCUS_RING} flex w-full items-center justify-between px-4 py-2 text-[10px] lg:hidden`}
        style={{ color: 'var(--muted)' }}
      >
        <span>{open ? 'hide the state' : 'show the state'}</span>
        <span aria-hidden="true" style={{ color: 'var(--faint)' }}>
          {open ? '—' : '+'}
        </span>
      </button>

      <div
        id="state-rail-body"
        className={`${open ? 'block' : 'hidden'} max-h-[58vh] overflow-y-auto px-4 py-4 lg:block lg:max-h-[calc(100vh-14rem)]`}
      >
        {visible.length === 0 ? (
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--faint)' }}>
            Empty. Nothing has been written yet — which is exactly what a company model looks
            like before the first framework runs.
          </p>
        ) : (
          <ol className="grid gap-2">
            {visible.map(({ row, state }) => (
              <RailEntry key={row.key} row={row} state={state} reduced={reduced} />
            ))}
          </ol>
        )}
      </div>

      <div
        className="border-t px-4 py-3"
        style={{ borderColor: 'var(--line)' }}
      >
        <p className={`${MONO_LABEL} text-[9px] leading-relaxed`} style={{ color: 'var(--faint)' }}>
          typed fields · every value carries its status
        </p>
      </div>
    </aside>
  );
}

function RailEntry({
  row,
  state,
  reduced,
}: {
  row: RailRow;
  state: RowState;
  reduced: boolean;
}): ReactNode {
  const isPending = state === 'pending';
  const isFuture = state === 'future';
  const landing = state === 'landed';

  return (
    <motion.li
      data-rail-row={row.key}
      data-rail-field={row.field}
      data-rail-step={row.step}
      data-rail-state={state}
      {...(landing ? { 'data-recipe': 'motion/ingest' } : {})}
      hidden={isFuture}
      initial={landing ? (reduced ? { opacity: 0 } : { opacity: 0, y: INGEST_RISE }) : false}
      animate={{ opacity: isPending ? 0.7 : 1, y: 0 }}
      transition={{
        duration: reduced ? DUR.reduced : DUR.ingest,
        ease: reduced ? 'linear' : EASE_EXPO_OUT,
      }}
      className="rounded-md border px-3 py-2"
      style={{
        borderColor: isPending ? 'var(--line)' : 'var(--line-strong)',
        background: isPending
          ? 'transparent'
          : 'color-mix(in srgb, var(--raised) 55%, transparent)',
        borderStyle: isPending ? 'dashed' : 'solid',
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-system text-[11px]" style={{ color: 'var(--flow)' }}>
          {row.field}
        </span>
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          step {row.step}
          {row.revises ? ' · revised' : ''}
        </span>
      </div>
      <div className="mt-1 text-[13px] leading-snug" style={{ color: isPending ? 'var(--faint)' : 'var(--ink)' }}>
        {isPending ? 'waiting on this step' : row.value}
      </div>
      {!isPending ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusChip status={row.status} bare />
          {row.sourced}
        </div>
      ) : null}
    </motion.li>
  );
}

export default StateRail;
