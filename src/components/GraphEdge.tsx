'use client';

/**
 * `GraphEdge` — 01-design-system §6, an SVG primitive.
 *
 * An edge is a hairline (1.5px, `--line-strong` at rest, `--flow` when active — §2's
 * stroke-first data layer) with two motion hooks bolted on, both drawn from the named
 * recipes so no page has to invent edge behaviour:
 *
 *   - `draw` — `motion/transform`'s stroke-dashoffset reveal, 800ms. The edge is being
 *     *asserted*.
 *   - `route` — `motion/route`'s 6px flow dot travelling it, 900ms linear. Work is
 *     *moving* along an edge that already exists.
 *
 * Reduced motion: the edge renders drawn and the dot rests at the destination end.
 */

import { usePathSlots } from '@/lib/motion-utils';
import { DrawPath } from '@/motion/motion-transform';
import { RouteDot } from '@/motion/motion-route';

export type EdgeTone = 'idle' | 'active' | 'evidence' | 'ghost';

const TONE: Record<EdgeTone, string> = {
  idle: 'var(--line-strong)',
  active: 'var(--flow)',
  evidence: 'var(--evidence)',
  ghost: 'var(--line)',
};

export interface GraphEdgeProps {
  /** Explicit path data. Takes precedence over `from`/`to`. */
  d?: string;
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  /** Curvature for generated paths; 0 draws a straight line. */
  curve?: number;
  tone?: EdgeTone;
  /** Play the stroke-dashoffset draw. */
  draw?: boolean;
  drawDelay?: number;
  /** Send a `motion/route` dot along the edge. */
  route?: boolean;
  routeRepeat?: boolean;
  routeDelay?: number;
  dashed?: boolean;
  /** Accessible description; omit for edges already described by their diagram. */
  label?: string;
}

function autoPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  curve: number,
): string {
  if (curve === 0) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * curve;
  const ny = (dx / len) * curve;
  return `M ${from.x} ${from.y} Q ${mx + nx} ${my + ny} ${to.x} ${to.y}`;
}

export function GraphEdge({
  d,
  from,
  to,
  curve = 0,
  tone = 'idle',
  draw = true,
  drawDelay = 0,
  route = false,
  routeRepeat = false,
  routeDelay = 0,
  dashed = false,
  label,
}: GraphEdgeProps) {
  const { paths, setPath } = usePathSlots(1);
  const geometry = d ?? (from && to ? autoPath(from, to, curve) : undefined);
  if (!geometry) return null;

  return (
    <g data-component="graph-edge" data-tone={tone} aria-hidden={label ? undefined : 'true'}>
      {label ? <title>{label}</title> : null}
      {/*
        A dashed edge cannot also be a drawn edge: Framer implements `pathLength` by
        writing `stroke-dasharray`, so the two would fight over the same property. Weak
        or provisional connections are dashed and simply fade in.
      */}
      {dashed ? (
        <path
          ref={setPath[0]}
          d={geometry}
          fill="none"
          stroke={TONE[tone]}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={tone === 'ghost' ? 0.6 : 0.85}
        />
      ) : (
        <DrawPath
          ref={setPath[0]}
          d={geometry}
          active={draw}
          delay={drawDelay}
          stroke={TONE[tone]}
          opacity={tone === 'ghost' ? 0.6 : 1}
        />
      )}
      {route ? (
        <RouteDot
          path={paths[0] ?? null}
          active
          repeat={routeRepeat}
          delay={routeDelay}
          color={tone === 'evidence' ? 'var(--evidence)' : 'var(--flow)'}
        />
      ) : null}
    </g>
  );
}

export default GraphEdge;
