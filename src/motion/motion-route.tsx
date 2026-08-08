'use client';

/**
 * Recipe `motion/route` — 01-design-system §4, meaning: *work/attention moves elsewhere*.
 *
 * Spec: a 6px `--flow` dot travels the connecting path, 900ms, easing **linear**; the
 * destination panel lifts (shadow + 2px rise).
 *
 * The linear easing is deliberate and is the whole tell: `motion/ingest` and
 * `motion/transform` ease *out* because they are arrivals, but routed work moves at a
 * constant rate because it is in transit — nothing is happening to it yet.
 *
 * Reduced motion: the dot rests at the destination end of the path, the destination
 * panel renders already-lifted, and the arrival is announced by a 200ms crossfade of
 * the destination's active border. Nothing travels; the routing is still legible.
 */

import { useEffect, useState, type ReactNode } from 'react';
import {
  DUR,
  usePathSlots,
  useReducedMotion,
  useSvgId,
} from '@/lib/motion-utils';
import { DrawPath, PathTraveler } from './motion-transform';
import { PanelGlass } from './panel-glass';

/* -------------------------------------------------------------------- dot */

export interface RouteDotProps {
  path: SVGPathElement | null;
  active?: boolean;
  /** Diameter in user units. Spec: 6px. */
  size?: number;
  color?: string;
  /** Loop the traverse — used for continuous throughput, not for one-off handoffs. */
  repeat?: boolean;
  delay?: number;
  duration?: number;
}

/** The travelling flow-dot. Halo included: a bare dot reads as a bug, not as work. */
export function RouteDot({
  path,
  active = true,
  size = 6,
  color = 'var(--flow)',
  repeat = false,
  delay = 0,
  duration = DUR.route,
}: RouteDotProps) {
  return (
    <PathTraveler
      path={path}
      active={active}
      duration={duration}
      delay={delay}
      ease="linear"
      repeat={repeat}
      restAt={1}
    >
      <circle r={size} fill={color} opacity={0.16} />
      <circle r={size / 2} fill={color} />
    </PathTraveler>
  );
}

/* ------------------------------------------------------------------- edge */

export interface RouteEdgeProps {
  d: string;
  active?: boolean;
  repeat?: boolean;
  delay?: number;
  /** Draw the path first (motion/transform) before routing along it. */
  draw?: boolean;
  stroke?: string;
  dotColor?: string;
  dotSize?: number;
}

/** One connective path plus its travelling dot. The unit of a routing diagram. */
export function RouteEdge({
  d,
  active = true,
  repeat = false,
  delay = 0,
  draw = true,
  stroke = 'var(--line-strong)',
  dotColor = 'var(--flow)',
  dotSize = 6,
}: RouteEdgeProps) {
  const { paths, setPath } = usePathSlots(1);
  return (
    <g data-recipe="motion/route">
      <DrawPath
        ref={setPath[0]}
        d={d}
        active={draw ? active : true}
        stroke={stroke}
        delay={delay}
      />
      <RouteDot
        path={paths[0] ?? null}
        active={active}
        repeat={repeat}
        delay={draw ? delay + DUR.draw * 0.5 : delay}
        color={dotColor}
        size={dotSize}
      />
    </g>
  );
}

/* --------------------------------------------------------------- handoff */

export interface RouteHandoffProps {
  from: { label: string; caption?: string };
  to: { label: string; caption?: string };
  /** What is being routed — printed along the wire, mono, small. */
  payload?: string;
  active?: boolean;
  className?: string;
}

const CONNECTOR_W = 240;
const CONNECTOR_H = 72;

/**
 * The canonical demonstration: a finished framework hands its output to the next one,
 * and the receiving panel *lifts* to acknowledge it. This is the site's north-star
 * behaviour rendered as a two-second animation — the handoff has to feel like an
 * invitation, which is why the destination moves rather than merely highlighting.
 */
export function RouteHandoff({
  from,
  to,
  payload = 'state',
  active = true,
  className = '',
}: RouteHandoffProps) {
  const reduced = useReducedMotion();
  const gradId = useSvgId('route');
  const { paths, setPath } = usePathSlots(1);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (!active) {
      setArrived(false);
      return;
    }
    if (reduced) {
      setArrived(true);
      return;
    }
    const id = window.setTimeout(
      () => setArrived(true),
      (DUR.draw * 0.5 + DUR.route) * 1000,
    );
    return () => window.clearTimeout(id);
  }, [active, reduced]);

  const d = `M 8 ${CONNECTOR_H / 2} C 76 ${CONNECTOR_H / 2}, 164 ${CONNECTOR_H / 2}, ${CONNECTOR_W - 8} ${CONNECTOR_H / 2}`;

  return (
    <div
      data-recipe="motion/route"
      className={`flex flex-col items-stretch gap-3 sm:flex-row sm:items-center ${className}`}
    >
      <PanelGlass className="flex-1 px-4 py-3" border="line">
        <div
          className="font-system text-[10px] uppercase"
          style={{ letterSpacing: '.14em', color: 'var(--faint)' }}
        >
          source
        </div>
        <div className="font-narrative mt-1 text-xl leading-tight" style={{ color: 'var(--ink)' }}>
          {from.label}
        </div>
        {from.caption ? (
          <div className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
            {from.caption}
          </div>
        ) : null}
      </PanelGlass>

      <div className="relative w-full shrink-0 sm:w-[240px]">
        <svg
          viewBox={`0 0 ${CONNECTOR_W} ${CONNECTOR_H}`}
          className="w-full"
          role="img"
          aria-label={`${from.label} routes ${payload} to ${to.label}`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--line-strong)" />
              <stop offset="55%" stopColor="var(--flow-deep)" />
              <stop offset="100%" stopColor="var(--flow)" />
            </linearGradient>
          </defs>
          <DrawPath ref={setPath[0]} d={d} active={active} stroke={`url(#${gradId})`} />
          <RouteDot path={paths[0] ?? null} active={active} delay={DUR.draw * 0.5} />
          <text
            x={CONNECTOR_W / 2}
            y={CONNECTOR_H / 2 - 12}
            textAnchor="middle"
            className="font-system"
            fontSize={10}
            letterSpacing="0.14em"
            fill="var(--faint)"
          >
            {payload.toUpperCase()}
          </text>
        </svg>
      </div>

      <PanelGlass
        className="flex-1 px-4 py-3"
        lifted={arrived}
        border={arrived ? 'flow' : 'line'}
        data-arrived={arrived ? 'true' : 'false'}
      >
        <div
          className="font-system text-[10px] uppercase"
          style={{ letterSpacing: '.14em', color: arrived ? 'var(--flow)' : 'var(--faint)' }}
        >
          destination
        </div>
        <div className="font-narrative mt-1 text-xl leading-tight" style={{ color: 'var(--ink)' }}>
          {to.label}
        </div>
        {to.caption ? (
          <div className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
            {to.caption}
          </div>
        ) : null}
      </PanelGlass>
    </div>
  );
}

export default RouteHandoff;
