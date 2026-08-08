'use client';

/**
 * Recipe `fw/vrio-gates` — 01-design-system §5.
 *
 * Spec: capabilities as mono-labelled tokens queued left; four gates as vertical
 * light-lines (V · R · I · O). Each token travels `motion/route` through the gates;
 * passing a gate flashes it `--evidence`; failing drops the token with a gravity ease
 * into its category shelf below (parity / temporary / uncaptured / sustained).
 * Sustained tokens dock right with a soft `--evidence` glow. Clicking any token opens
 * its evidence popover.
 *
 * Resolved ambiguity — five VRIO outcomes, four shelves. The model produces
 * *disadvantage, parity, temporary advantage, unused advantage, sustained advantage*,
 * but §5 names four shelves. Mapping used, and printed in the legend so no visitor has
 * to guess: failing **V** or **R** lands in *parity*; failing **I** lands in
 * *temporary*; failing **O** lands in *uncaptured* (the advantage exists, the
 * organisation cannot collect it); passing all four docks as *sustained*.
 *
 * Tokens are HTML over an SVG substrate rather than SVG `<g>` elements. They must be
 * focusable buttons that open a positioned popover, and doing that natively in HTML
 * beats reimplementing focus management inside an SVG (Ruling 7: full keyboard
 * operability is not negotiable).
 *
 * Reduced motion: every token renders already docked or shelved, gates render lit for
 * the tokens that passed them, and the travel is replaced by a 200ms crossfade.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { DUR, EASE_EXPO_OUT, EASE_GRAVITY, useReducedMotion } from '@/lib/motion-utils';
import { EvidenceRef, type EvidenceSource } from '@/components/EvidenceRef';
import { FOCUS_RING, MONO_LABEL } from '@/components/styles';
import { useStage } from './acts';

/* ------------------------------------------------------------------- types */

export interface Capability {
  id: string;
  label: string;
  /** Valuable / Rare / Inimitable / Organised. */
  v: boolean;
  r: boolean;
  i: boolean;
  o: boolean;
  /** Optional one-liner shown in the popover. */
  note?: string;
  evidence?: EvidenceSource;
}

export interface VrioGatesProps {
  capabilities: Capability[];
  className?: string;
}

/* ------------------------------------------------------------------ layout */

const GATES = [
  { key: 'v', letter: 'V', label: 'valuable', x: 25 },
  { key: 'r', letter: 'R', label: 'rare', x: 42 },
  { key: 'i', letter: 'I', label: 'inimitable', x: 59 },
  { key: 'o', letter: 'O', label: 'organised', x: 76 },
] as const;

const SHELVES = [
  { id: 'parity', label: 'parity', x: 14 },
  { id: 'temporary', label: 'temporary', x: 38 },
  { id: 'uncaptured', label: 'uncaptured', x: 60 },
  { id: 'sustained', label: 'sustained', x: 86 },
] as const;

type ShelfId = (typeof SHELVES)[number]['id'];

const LANE_Y = 26;
const SHELF_TOP = 62;
const SHELF_STEP = 11;

/** Leading gates passed before the first failure. 4 = passed everything. */
function passCount(c: Capability): number {
  if (!c.v) return 0;
  if (!c.r) return 1;
  if (!c.i) return 2;
  if (!c.o) return 3;
  return 4;
}

function shelfFor(passed: number): ShelfId {
  if (passed <= 1) return 'parity';
  if (passed === 2) return 'temporary';
  if (passed === 3) return 'uncaptured';
  return 'sustained';
}

function laneX(passed: number): number {
  if (passed === 0) return 6;
  const gate = GATES[passed - 1];
  return (gate?.x ?? 6) + 5;
}

/* --------------------------------------------------------------- component */

export function VrioGates({ capabilities, className = '' }: VrioGatesProps) {
  const reduced = useReducedMotion();
  /** queue, four gates, settled. */
  const { step, ref } = useStage(GATES.length + 2);
  const [openId, setOpenId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [openId]);

  /** Stable stacking order inside each shelf. */
  const shelfIndex = new Map<string, number>();
  const shelfCounts: Record<string, number> = {};
  for (const c of capabilities) {
    const shelf = shelfFor(passCount(c));
    shelfCounts[shelf] = (shelfCounts[shelf] ?? 0) + 1;
    shelfIndex.set(c.id, shelfCounts[shelf]! - 1);
  }

  const open = capabilities.find((c) => c.id === openId) ?? null;
  const openPassed = open ? passCount(open) : 0;

  return (
    <div
      ref={ref}
      data-recipe="fw/vrio-gates"
      data-step={step}
      className={className}
    >
      <div
        ref={rootRef}
        className="relative w-full"
        style={{ minHeight: 360, aspectRatio: '16 / 8.5' }}
      >
        {/* Substrate: the four gates as vertical light-lines, plus shelf rules. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <line
            x1={4}
            y1={LANE_Y}
            x2={96}
            y2={LANE_Y}
            stroke="var(--line)"
            strokeWidth={1.5}
            strokeDasharray="2 5"
            vectorEffect="non-scaling-stroke"
          />
          {GATES.map((gate, gi) => {
            const lit = step >= gi + 1;
            return (
              <motion.line
                key={gate.key}
                x1={gate.x}
                y1={6}
                x2={gate.x}
                y2={48}
                stroke={lit ? 'var(--evidence)' : 'var(--line-strong)'}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: lit ? 1 : 0.4 }}
                transition={{ duration: reduced ? DUR.reduced : DUR.state }}
              />
            );
          })}
          {SHELVES.map((shelf) => (
            <line
              key={shelf.id}
              x1={shelf.x - 11}
              y1={SHELF_TOP - 6}
              x2={shelf.x + 11}
              y2={SHELF_TOP - 6}
              stroke="var(--line)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Gate captions */}
        {GATES.map((gate, gi) => {
          const lit = step >= gi + 1;
          return (
            <div
              key={gate.key}
              className="absolute -translate-x-1/2 text-center"
              style={{ left: `${gate.x}%`, top: '1%' }}
            >
              <div
                className="font-system text-[13px]"
                style={{ color: lit ? 'var(--evidence)' : 'var(--faint)' }}
              >
                {gate.letter}
              </div>
              <div
                className={`${MONO_LABEL} mt-[2px] text-[8px]`}
                style={{ color: 'var(--faint)' }}
              >
                {gate.label}
              </div>
            </div>
          );
        })}

        {/* Shelf captions */}
        {SHELVES.map((shelf) => (
          <div
            key={shelf.id}
            className={`${MONO_LABEL} absolute -translate-x-1/2 text-[8px] whitespace-nowrap`}
            style={{
              left: `${shelf.x}%`,
              top: `${SHELF_TOP - 12}%`,
              color: shelf.id === 'sustained' ? 'var(--evidence)' : 'var(--faint)',
            }}
          >
            {shelf.label}
          </div>
        ))}

        {/* Tokens */}
        {capabilities.map((c) => {
          const passed = passCount(c);
          const dropped = step > passed && passed < 4;
          const docked = passed === 4 && step >= GATES.length;
          const shelf = shelfFor(passed);
          const shelfX = SHELVES.find((s) => s.id === shelf)?.x ?? 50;
          const stack = shelfIndex.get(c.id) ?? 0;

          const x = dropped ? shelfX : docked ? SHELVES[3].x : laneX(Math.min(step, passed));
          const y = dropped ? SHELF_TOP + stack * SHELF_STEP : LANE_Y;
          const isOpen = openId === c.id;

          return (
            <motion.button
              key={c.id}
              type="button"
              data-capability={c.id}
              data-shelf={dropped || docked ? shelf : 'lane'}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              onClick={() => setOpenId(isOpen ? null : c.id)}
              className={`${FOCUS_RING} absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-[10px] py-[6px] text-left`}
              style={{
                borderColor: docked
                  ? 'color-mix(in srgb, var(--evidence) 55%, transparent)'
                  : isOpen
                    ? 'color-mix(in srgb, var(--flow) 55%, transparent)'
                    : 'var(--line-strong)',
                background: docked
                  ? 'color-mix(in srgb, var(--evidence-soft) 88%, transparent)'
                  : 'color-mix(in srgb, var(--surface) 88%, transparent)',
                boxShadow: docked
                  ? '0 0 22px color-mix(in srgb, var(--evidence) 22%, transparent)'
                  : 'var(--shadow)',
              }}
              initial={false}
              animate={{ left: `${x}%`, top: `${y}%` }}
              transition={
                reduced
                  ? { duration: DUR.reduced, ease: 'linear' }
                  : dropped
                    ? { duration: DUR.route * 0.7, ease: EASE_GRAVITY }
                    : { duration: DUR.route, ease: EASE_EXPO_OUT }
              }
            >
              <span
                className="font-system block text-[10px] whitespace-nowrap"
                style={{ color: docked ? 'var(--evidence)' : 'var(--ink)' }}
              >
                {c.label}
              </span>
              <span
                className={`${MONO_LABEL} mt-[2px] block text-[8px]`}
                style={{ color: 'var(--faint)' }}
              >
                {'vrio'
                  .split('')
                  .map((k, i) => ([c.v, c.r, c.i, c.o][i] ? k.toUpperCase() : '·'))
                  .join(' ')}
              </span>
            </motion.button>
          );
        })}

        {/* Evidence popover */}
        <AnimatePresence>
          {open ? (
            <motion.div
              role="dialog"
              aria-label={`${open.label} — VRIO verdict`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? DUR.reduced : DUR.state, ease: EASE_EXPO_OUT }}
              className="absolute z-20 w-[min(300px,86%)] -translate-x-1/2 rounded-md p-3"
              style={{
                left: `${Math.min(78, Math.max(22, laneX(Math.min(step, openPassed))))}%`,
                top: `${LANE_Y + 14}%`,
                background: 'color-mix(in srgb, var(--raised) 94%, transparent)',
                backdropFilter: 'blur(14px)',
                border: '1px solid var(--line-strong)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-system text-[11px]" style={{ color: 'var(--ink)' }}>
                  {open.label}
                </span>
                <span
                  className={`${MONO_LABEL} text-[9px]`}
                  style={{
                    color:
                      shelfFor(openPassed) === 'sustained'
                        ? 'var(--evidence)'
                        : 'var(--muted)',
                  }}
                >
                  {shelfFor(openPassed)}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1">
                {GATES.map((gate, gi) => {
                  const ok = [open.v, open.r, open.i, open.o][gi];
                  return (
                    <div
                      key={gate.key}
                      className="rounded-[3px] border px-1 py-[3px] text-center"
                      style={{
                        borderColor: ok
                          ? 'color-mix(in srgb, var(--evidence) 40%, transparent)'
                          : 'var(--line)',
                        background: ok ? 'var(--evidence-soft)' : 'transparent',
                      }}
                    >
                      <div
                        className="font-system text-[10px]"
                        style={{ color: ok ? 'var(--evidence)' : 'var(--faint)' }}
                      >
                        {gate.letter}
                      </div>
                      <div
                        className="font-system text-[8px]"
                        style={{ color: 'var(--faint)' }}
                      >
                        {ok ? 'pass' : 'fail'}
                      </div>
                    </div>
                  );
                })}
              </div>
              {open.note ? (
                <p className="mt-2 text-[12px] leading-snug" style={{ color: 'var(--muted)' }}>
                  {open.note}
                </p>
              ) : null}
              {open.evidence ? (
                <div className="mt-2">
                  <EvidenceRef evidence={open.evidence} />
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <p
        className={`${MONO_LABEL} mt-2 text-[9px]`}
        style={{ color: 'var(--faint)' }}
      >
        fails v or r → parity · fails i → temporary · fails o → uncaptured · passes all →
        sustained
      </p>
    </div>
  );
}

export default VrioGates;
