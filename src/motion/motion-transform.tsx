'use client';

/**
 * Recipe `motion/transform` — 01-design-system §4, meaning: *a framework transforms
 * information*.
 *
 * Spec: input elements travel along SVG paths (stroke-dashoffset draw, 800ms) into an
 * output slot; the output lands with `motion/ingest`.
 *
 * Reduced motion: paths render fully drawn, travellers sit at their arrival point, and
 * the output slot crossfades in over 200ms. The finished picture — inputs, connective
 * tissue, output — is identical; only the reading of it as an *event* is dropped.
 */

import { animate, motion, useMotionValue } from 'framer-motion';
import { forwardRef, useEffect, useRef, type ReactNode } from 'react';
import {
  DUR,
  EASE_EXPO_OUT,
  usePathGeometry,
  usePathSlots,
  useReducedMotion,
  useSvgId,
} from '@/lib/motion-utils';
import { Ingest } from './motion-ingest';

/* ------------------------------------------------------------------ DrawPath */

/**
 * Framer's motion props redefine React's animation/drag handlers with different
 * signatures, so those names are dropped from the passthrough surface. `style` goes with
 * them: a drawn path's style is the recipe's business, not the caller's.
 */
type PathPassthrough = Omit<
  React.SVGProps<SVGPathElement>,
  | 'ref'
  | 'style'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDrop'
  | 'values'
>;

export interface DrawPathProps extends PathPassthrough {
  d: string;
  /** Fires the draw. */
  active?: boolean;
  /** Seconds. Spec default 0.8. */
  duration?: number;
  delay?: number;
  /** Stroke colour; defaults to the inactive hairline. */
  stroke?: string;
}

/**
 * A connective line that *draws itself*. The stroke-dashoffset technique is used rather
 * than a scale/clip because the line must appear to be laid down in the direction the
 * information flows.
 */
export const DrawPath = forwardRef<SVGPathElement, DrawPathProps>(function DrawPath(
  { d, active = true, duration = DUR.draw, delay = 0, stroke = 'var(--line-strong)', ...rest },
  ref,
) {
  const reduced = useReducedMotion();

  return (
    <motion.path
      ref={ref}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      data-recipe="motion/transform"
      initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0.001 }}
      animate={{ pathLength: active ? 1 : reduced ? 1 : 0, opacity: 1 }}
      transition={{
        pathLength: {
          duration: reduced ? 0 : duration,
          ease: EASE_EXPO_OUT,
          delay: reduced ? 0 : delay,
        },
        opacity: { duration: reduced ? DUR.reduced : 0.2, delay: reduced ? 0 : delay },
      }}
      {...rest}
    />
  );
});

/* -------------------------------------------------------------- PathTraveler */

export interface PathTravelerProps {
  /** The measured path. Hold it in state via a callback ref, not a plain `useRef`. */
  path: SVGPathElement | null;
  /** Fires the travel. */
  active?: boolean;
  duration?: number;
  delay?: number;
  /** Easing; `motion/route` overrides this to linear. */
  ease?: [number, number, number, number] | 'linear';
  /** Loop forever (throughput streams). */
  repeat?: boolean;
  /** Where the traveller rests when inactive / under reduced motion. */
  restAt?: number;
  children: ReactNode;
}

/**
 * Carries `children` along a measured SVG path.
 *
 * Position is written straight to a `transform` attribute rather than through React
 * state: a traveller updates every frame and must never cost a render. Coordinates come
 * from `getPointAtLength`, so this works inside `preserveAspectRatio="none"` diagrams
 * where CSS `offset-path` would drift.
 */
export function PathTraveler({
  path,
  active = true,
  duration = DUR.route,
  delay = 0,
  ease = EASE_EXPO_OUT,
  repeat = false,
  restAt = 1,
  children,
}: PathTravelerProps) {
  const reduced = useReducedMotion();
  const geo = usePathGeometry(path);
  const t = useMotionValue(reduced ? restAt : 0);
  const groupRef = useRef<SVGGElement | null>(null);
  const hidden = geo.length === 0;

  useEffect(() => {
    if (geo.length === 0) return;
    const place = (v: number) => {
      const p = geo.pointAt(v);
      groupRef.current?.setAttribute('transform', `translate(${p.x} ${p.y})`);
    };
    place(t.get());
    return t.on('change', place);
  }, [geo, t]);

  useEffect(() => {
    if (reduced) {
      t.set(restAt);
      return;
    }
    if (!active) {
      t.set(0);
      return;
    }
    const controls = animate(t, 1, {
      duration,
      delay,
      ease,
      ...(repeat ? { repeat: Infinity, repeatType: 'loop' as const, repeatDelay: 0 } : {}),
    });
    return () => controls.stop();
  }, [active, reduced, duration, delay, repeat, restAt, t, ease]);

  return (
    <g
      ref={groupRef}
      data-recipe="motion/transform"
      data-traveler="true"
      style={{ opacity: hidden ? 0 : 1 }}
    >
      {children}
    </g>
  );
}

/* ------------------------------------------------------------ TransformFlow */

export interface TransformInput {
  id: string;
  label: string;
}

export interface TransformFlowProps {
  /** The state fields going in. 2–4 reads best. */
  inputs: TransformInput[];
  /** The field that comes out the other side. */
  output: string;
  /** The framework doing the transforming — shown on the output slot. */
  operator?: string;
  /** Drive the recipe from an act, a step index, or leave it in-view driven. */
  active?: boolean;
  className?: string;
}

const VB_W = 520;
const VB_H = 220;

/**
 * The canonical demonstration of the recipe: typed state fields travel curved paths
 * into an operator, and a new field lands on the far side.
 *
 * This is the site's whole thesis in fifteen seconds — frameworks do not pass prose to
 * each other, they pass fields (02-architecture) — so it is worth building properly
 * rather than as a generic "three boxes and an arrow".
 */
export function TransformFlow({
  inputs,
  output,
  operator = 'FRAMEWORK',
  active = true,
  className = '',
}: TransformFlowProps) {
  const reduced = useReducedMotion();
  const gradId = useSvgId('xform');
  const rows = inputs.slice(0, 4);
  const { paths, setPath } = usePathSlots(rows.length);

  const outX = VB_W - 108;
  const outY = VB_H / 2;

  return (
    <div className={`relative ${className}`} data-recipe="motion/transform">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full"
        role="img"
        aria-label={`${rows.map((r) => r.label).join(', ')} transformed by ${operator} into ${output}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--line-strong)" />
            <stop offset="100%" stopColor="var(--flow)" />
          </linearGradient>
        </defs>

        {rows.map((input, i) => {
          const y = VB_H / 2 + (i - (rows.length - 1) / 2) * 46;
          const d = `M 116 ${y} C 200 ${y}, 240 ${outY}, ${outX - 14} ${outY}`;
          return (
            <g key={input.id}>
              <DrawPath
                ref={setPath[i]}
                d={d}
                active={active}
                stroke={`url(#${gradId})`}
                delay={i * 0.08}
              />
              <PathTraveler
                path={paths[i] ?? null}
                active={active}
                duration={DUR.draw}
                delay={DUR.draw * 0.55 + i * 0.08}
              >
                <circle r={3.5} fill="var(--flow)" />
              </PathTraveler>
            </g>
          );
        })}

        {rows.map((input, i) => {
          const y = VB_H / 2 + (i - (rows.length - 1) / 2) * 46;
          return (
            <g key={`${input.id}-chip`}>
              <rect
                x={8}
                y={y - 14}
                width={108}
                height={28}
                rx={4}
                fill="var(--surface)"
                stroke="var(--line)"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={62}
                y={y + 4}
                textAnchor="middle"
                className="font-system"
                fontSize={10}
                letterSpacing="0.08em"
                fill="var(--muted)"
              >
                {input.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* The output slot lands with motion/ingest, per the recipe's last clause. */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 flex w-[26%] items-center justify-end"
        style={{ paddingRight: '1%' }}
      >
        <Ingest
          trigger="controlled"
          active={active}
          delay={reduced ? 0 : DUR.draw * 0.9}
          className="w-full"
        >
          <div
            className="rounded-md px-3 py-2 text-center"
            style={{
              background: 'color-mix(in srgb, var(--surface) 66%, transparent)',
              backdropFilter: 'blur(14px)',
              border: '1px solid color-mix(in srgb, var(--flow) 45%, transparent)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div
              className="font-system text-[9px] uppercase"
              style={{ letterSpacing: '.14em', color: 'var(--faint)' }}
            >
              {operator}
            </div>
            <div className="font-system mt-1 text-[11px]" style={{ color: 'var(--ink)' }}>
              {output}
            </div>
          </div>
        </Ingest>
      </div>
    </div>
  );
}

export default TransformFlow;
