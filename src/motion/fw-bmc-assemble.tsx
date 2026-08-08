'use client';

/**
 * Recipe `fw/bmc-assemble` — 01-design-system §5.
 *
 * Spec: nine empty cells drawn as stroke rectangles; as the narrative introduces each
 * block, its card `motion/ingest`s into place; then connection lines draw between
 * related cells (`motion/transform` paths: segment → VP → channel → revenue). Weak
 * claims render with `--faint` dashed borders; confirmed with an `--evidence` left bar;
 * a contradiction pulses `--contradiction` once. Final state: the canvas breathing as
 * one connected organism — paths shimmer with a 12s `--flow` gradient sweep.
 *
 * Two decisions worth recording:
 *
 * 1. **Fill order is the teaching order**, not reading order: customers, value prop,
 *    channels, relationships, revenue, resources, activities, partners, cost. The
 *    canvas assembles right-to-left because that is how the model is actually reasoned
 *    about — you cannot know what resources you need until you know who you serve.
 * 2. **The connector overlay is analytic, not measured.** The grid is a fixed 5x3, so
 *    anchor points are authored as percentages against a `0 0 100 100` viewBox with
 *    `preserveAspectRatio="none"` and `vector-effect="non-scaling-stroke"`. No
 *    `ResizeObserver`, no layout thrash, correct on the server, correct at every width.
 *    The routes deliberately run in the *gutters* between cards rather than centre to
 *    centre: a wire that crosses three cards to reach a fourth reads as a mistake, and
 *    the canvas is supposed to look wired, not scribbled on.
 *
 * Below the desktop breakpoint the nine cells stack into a single column in fill order
 * and the connector overlay is dropped — a 5x3 grid at 390px is unreadable, and a wiring
 * diagram over a stacked list would be a lie about the layout.
 */

import { motion, type MotionStyle } from 'framer-motion';
import { DUR, EASE_EXPO_OUT, useMediaQuery, useSvgId } from '@/lib/motion-utils';
import { useStage } from './acts';
import { ContradictionPulse } from './motion-state';
import { Ingest } from './motion-ingest';

/* ------------------------------------------------------------------- types */

export type ClaimStrength = 'weak' | 'confirmed' | 'contradiction';

export interface BmcItem {
  text: string;
  strength: ClaimStrength;
}

export type BmcBlockId = 'kp' | 'ka' | 'kr' | 'vp' | 'cr' | 'ch' | 'cs' | 'cost' | 'rev';

export interface BmcBlock {
  id: BmcBlockId;
  label: string;
  items: BmcItem[];
}

export interface BmcAssembleProps {
  blocks: BmcBlock[];
  /** Printed as the canvas' subject. Fictional companies only (Ruling 4). */
  company?: string;
  className?: string;
}

/* ------------------------------------------------------------------ layout */

interface CellGeometry {
  /** CSS grid placement. */
  col: number;
  colSpan: number;
  row: number;
  rowSpan: number;
}

/**
 * The canonical Osterwalder arrangement. Cost takes the left two columns and revenue
 * the right three, so revenue sits under value prop → channels → segments: the chain
 * that actually produces it.
 */
const GEOMETRY: Record<BmcBlockId, CellGeometry> = {
  kp: { col: 1, colSpan: 1, row: 1, rowSpan: 2 },
  ka: { col: 2, colSpan: 1, row: 1, rowSpan: 1 },
  kr: { col: 2, colSpan: 1, row: 2, rowSpan: 1 },
  vp: { col: 3, colSpan: 1, row: 1, rowSpan: 2 },
  cr: { col: 4, colSpan: 1, row: 1, rowSpan: 1 },
  ch: { col: 4, colSpan: 1, row: 2, rowSpan: 1 },
  cs: { col: 5, colSpan: 1, row: 1, rowSpan: 2 },
  cost: { col: 1, colSpan: 2, row: 3, rowSpan: 1 },
  rev: { col: 3, colSpan: 3, row: 3, rowSpan: 1 },
};

/** Fill order = teaching order. */
const FILL_ORDER: BmcBlockId[] = ['cs', 'vp', 'ch', 'cr', 'rev', 'kr', 'ka', 'kp', 'cost'];

interface Connector {
  id: string;
  /** Path in canvas percent. Column gutters sit at x = 20/40/60/80, rows at y = 35/71. */
  d: string;
  /** The spec'd chain (segment → VP → channel → revenue) is primary; the rest are ghosts. */
  primary: boolean;
}

const CONNECTORS: Connector[] = [
  // The spec'd chain, routed along the row gutter and the column gutters.
  { id: 'cs-vp', d: 'M 80 35 L 60 35', primary: true },
  { id: 'vp-ch', d: 'M 60 35 C 60.4 42, 60.4 47, 61 53', primary: true },
  { id: 'ch-rev', d: 'M 70 70.5 C 70 71.2, 72 71.2, 72 72', primary: true },
  // Supporting structure.
  { id: 'ka-vp', d: 'M 39.6 18 C 40 22, 40 22, 40.4 26', primary: false },
  { id: 'kp-ka', d: 'M 19.6 35 C 20 28, 20 24, 20.4 18', primary: false },
  { id: 'kr-cost', d: 'M 30 70.5 C 30 71.3, 22 71.3, 22 72', primary: false },
];

/* -------------------------------------------------------------------- item */

const STRENGTH_STYLE: Record<ClaimStrength, MotionStyle> = {
  weak: {
    border: '1px dashed var(--faint)',
    color: 'var(--muted)',
    background: 'transparent',
  },
  confirmed: {
    borderLeft: '2px solid var(--evidence)',
    color: 'var(--ink)',
    background: 'color-mix(in srgb, var(--evidence-soft) 60%, transparent)',
  },
  contradiction: {
    border: '1px solid color-mix(in srgb, var(--contradiction) 50%, transparent)',
    color: 'var(--ink)',
    background: 'var(--contradiction-soft)',
  },
};

/* --------------------------------------------------------------- component */

export function BmcAssemble({ blocks, company, className = '' }: BmcAssembleProps) {
  /** 9 fills, then the connectors, then the finished organism. */
  const steps = FILL_ORDER.length + 2;
  const { step, reduced, ref } = useStage(steps);
  const sweepId = useSvgId('bmcsweep');

  const byId = new Map(blocks.map((b) => [b.id, b]));
  const connected = step >= FILL_ORDER.length;
  const settled = step >= FILL_ORDER.length + 1;
  const wide = useMediaQuery('(min-width: 768px)');

  return (
    <div
      ref={ref}
      data-recipe="fw/bmc-assemble"
      data-step={step}
      className={`relative ${className}`}
    >
      {company ? (
        <div
          className="font-system mb-3 text-[10px] uppercase"
          style={{ letterSpacing: '.14em', color: 'var(--faint)' }}
        >
          business model canvas · {company}
        </div>
      ) : null}

      <div className="relative">
        {/* The nine cells. Outlines exist from the first frame — the canvas is a form
            waiting to be filled, and that emptiness is the point. */}
        <div
          className="relative grid gap-[6px]"
          style={
            wide
              ? {
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  gridTemplateRows:
                    'minmax(84px, auto) minmax(84px, auto) minmax(64px, auto)',
                }
              : { gridTemplateColumns: 'minmax(0, 1fr)' }
          }
        >
          {FILL_ORDER.map((id, order) => {
            const geo = GEOMETRY[id];
            const block = byId.get(id);
            const filled = step >= order;
            return (
              <div
                key={id}
                data-block={id}
                data-filled={filled ? 'true' : 'false'}
                className="relative rounded-md p-2"
                style={{
                  ...(wide
                    ? {
                        gridColumn: `${geo.col} / span ${geo.colSpan}`,
                        gridRow: `${geo.row} / span ${geo.rowSpan}`,
                      }
                    : {}),
                  border: '1px solid var(--line)',
                  background: filled
                    ? 'color-mix(in srgb, var(--surface) 66%, transparent)'
                    : 'transparent',
                  backdropFilter: filled ? 'blur(14px)' : undefined,
                  transition: `background ${DUR.state}s linear`,
                }}
              >
                <div
                  className="font-system text-[9px] uppercase"
                  style={{
                    letterSpacing: '.14em',
                    color: filled ? 'var(--muted)' : 'var(--faint)',
                  }}
                >
                  {block?.label ?? id}
                </div>

                <Ingest
                  trigger="controlled"
                  active={filled}
                  className="mt-2 grid gap-[5px]"
                  distance={reduced ? 0 : 10}
                >
                  {(block?.items ?? []).map((item, i) => (
                    <ContradictionPulse
                      key={i}
                      active={filled && item.strength === 'contradiction'}
                      className="rounded-[4px] px-2 py-[5px] text-[11px] leading-snug"
                      style={STRENGTH_STYLE[item.strength]}
                    >
                      {item.text}
                    </ContradictionPulse>
                  ))}
                </Ingest>
              </div>
            );
          })}
        </div>

        {/* Connector overlay. Percentage geometry against a non-uniform viewBox, with
            non-scaling strokes so the hairlines stay 1.5px at any width. Each wire is
            drawn twice: a wide `--void` casing first, so a route that has to cross a
            card edge still reads as one continuous line rather than a broken one. */}
        {wide ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <defs>
              {/*
                animate stays mounted in both states: unmounting it (spreading the prop
                away) makes Framer write `undefined` into x1/x2 when a backward scrub
                flips `settled` off, and Chromium logs an SVG length error.
              */}
              <motion.linearGradient
                id={sweepId}
                x1="0"
                y1="0"
                x2="0.35"
                y2="0"
                initial={{ x1: 0, x2: 0.35 }}
                animate={
                  settled && !reduced
                    ? { x1: [-0.4, 1.1], x2: [0, 1.5] }
                    : { x1: 0, x2: 0.35 }
                }
                transition={
                  settled && !reduced
                    ? { duration: DUR.sweep, ease: 'linear' as const, repeat: Infinity }
                    : { duration: 0 }
                }
              >
                <stop offset="0%" stopColor="var(--flow-deep)" />
                <stop offset="50%" stopColor="var(--flow)" />
                <stop offset="100%" stopColor="var(--flow-deep)" />
              </motion.linearGradient>
            </defs>

            {CONNECTORS.map((c, i) => {
              const draw = {
                initial: { pathLength: 0, opacity: 0 },
                transition: {
                  duration: reduced ? 0 : DUR.draw,
                  ease: EASE_EXPO_OUT,
                  delay: reduced ? 0 : i * 0.08,
                },
              };
              return (
                <g key={c.id}>
                  <motion.path
                    d={c.d}
                    fill="none"
                    stroke="var(--void)"
                    strokeWidth={5}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={draw.initial}
                    animate={{ pathLength: connected ? 1 : 0, opacity: connected ? 1 : 0 }}
                    transition={draw.transition}
                  />
                  <motion.path
                    d={c.d}
                    fill="none"
                    strokeWidth={c.primary ? 1.75 : 1.5}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    stroke={
                      c.primary && settled
                        ? `url(#${sweepId})`
                        : c.primary
                          ? 'var(--flow)'
                          : 'var(--line-strong)'
                    }
                    strokeDasharray={c.primary ? undefined : '3 4'}
                    initial={draw.initial}
                    animate={{
                      pathLength: connected ? 1 : 0,
                      opacity: connected ? (c.primary ? 1 : 0.7) : 0,
                    }}
                    transition={draw.transition}
                  />
                </g>
              );
            })}
          </svg>
        ) : null}
      </div>

      <div
        className="font-system mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] uppercase"
        style={{ letterSpacing: '.12em', color: 'var(--faint)' }}
      >
        <span className="inline-flex items-center gap-[6px]">
          <span
            aria-hidden="true"
            className="inline-block h-[10px] w-[10px] rounded-[2px]"
            style={{ border: '1px dashed var(--faint)' }}
          />
          weak claim
        </span>
        <span className="inline-flex items-center gap-[6px]">
          <span
            aria-hidden="true"
            className="inline-block h-[10px] w-[10px] rounded-[2px]"
            style={{ borderLeft: '2px solid var(--evidence)', background: 'var(--evidence-soft)' }}
          />
          confirmed
        </span>
        <span className="inline-flex items-center gap-[6px]">
          <span
            aria-hidden="true"
            className="inline-block h-[10px] w-[10px] rounded-[2px]"
            style={{
              border: '1px solid color-mix(in srgb, var(--contradiction) 50%, transparent)',
              background: 'var(--contradiction-soft)',
            }}
          />
          contradiction
        </span>
      </div>
    </div>
  );
}

export default BmcAssemble;
