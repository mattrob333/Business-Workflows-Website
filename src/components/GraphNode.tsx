'use client';

/**
 * `GraphNode` — 01-design-system §6, an SVG primitive.
 *
 * Shape carries meaning and never decoration:
 *   - **round = human**, **square = agent**. Inherited from `fw/raci-route`
 *     ("accountability is always a round node") and used everywhere a routing diagram
 *     shows who or what holds a piece of work.
 *   - **hex = framework**, for the S2 Framework Graph, where the nodes are instruments
 *     rather than actors.
 *
 * State is carried by stroke, not fill: `idle` is a hairline, `active` picks up
 * `--flow`, `done` picks up `--evidence`, `waiting` pulses. Stroke-first is the §2
 * data-layer rule, and it keeps a 17-node graph from turning into a bag of sweets.
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { DUR, EASE_EXPO_OUT, useReducedMotion } from '@/lib/motion-utils';

export type GraphNodeKind = 'human' | 'agent' | 'framework';
export type GraphNodeState = 'idle' | 'active' | 'done' | 'waiting';

const STATE_STROKE: Record<GraphNodeState, string> = {
  idle: 'var(--line-strong)',
  active: 'var(--flow)',
  done: 'var(--evidence)',
  waiting: 'var(--flow)',
};

const STATE_FILL: Record<GraphNodeState, string> = {
  idle: 'var(--surface)',
  active: 'color-mix(in srgb, var(--flow-deep) 22%, var(--surface))',
  done: 'color-mix(in srgb, var(--evidence) 14%, var(--surface))',
  waiting: 'color-mix(in srgb, var(--flow-deep) 14%, var(--surface))',
};

export interface GraphNodeProps {
  x: number;
  y: number;
  label: string;
  kind?: GraphNodeKind;
  state?: GraphNodeState;
  /** Radius / half-width in user units. */
  size?: number;
  /** A one- or two-letter badge inside the node — RACI letters, framework initials. */
  badge?: string;
  /** Caption under the node, mono, small. */
  caption?: string;
  /** Makes the node a focusable, activatable control. */
  onSelect?: () => void;
  selected?: boolean;
}

function hexPath(cx: number, cy: number, r: number): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

export function GraphNode({
  x,
  y,
  label,
  kind = 'framework',
  state = 'idle',
  size = 22,
  badge,
  caption,
  onSelect,
  selected = false,
}: GraphNodeProps) {
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const stroke = selected ? 'var(--flow)' : STATE_STROKE[state];
  const fill = STATE_FILL[state];
  const interactive = typeof onSelect === 'function';

  const shape =
    kind === 'human' ? (
      <circle cx={x} cy={y} r={size} fill={fill} stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    ) : kind === 'agent' ? (
      <rect
        x={x - size}
        y={y - size}
        width={size * 2}
        height={size * 2}
        rx={3}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    ) : (
      <path d={hexPath(x, y, size)} fill={fill} stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    );

  return (
    <motion.g
      data-component="graph-node"
      data-kind={kind}
      data-state={state}
      role={interactive ? 'button' : 'img'}
      aria-label={`${label}${caption ? `, ${caption}` : ''}${kind === 'agent' ? ', agent' : kind === 'human' ? ', human' : ''}`}
      tabIndex={interactive ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      onFocus={interactive ? () => setFocused(true) : undefined}
      onBlur={interactive ? () => setFocused(false) : undefined}
      style={{ cursor: interactive ? 'pointer' : 'default', outline: 'none' }}
      animate={
        state === 'waiting' && !reduced
          ? { opacity: [1, 0.55, 1] }
          : { opacity: 1 }
      }
      transition={
        state === 'waiting' && !reduced
          ? { duration: 1.6, repeat: Infinity, ease: EASE_EXPO_OUT }
          : { duration: reduced ? DUR.reduced : DUR.state }
      }
    >
      {/* Focus halo — drawn as geometry so it survives the SVG stacking context. */}
      {interactive ? (
        <circle
          cx={x}
          cy={y}
          r={size + 6}
          fill="none"
          stroke="var(--flow)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
          style={{ opacity: focused ? 1 : 0, transition: 'opacity 120ms linear' }}
        />
      ) : null}
      {shape}
      {badge ? (
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          className="font-system"
          fontSize={12}
          fill={state === 'idle' ? 'var(--muted)' : 'var(--ink)'}
          pointerEvents="none"
        >
          {badge}
        </text>
      ) : null}
      <text
        x={x}
        y={y + size + 15}
        textAnchor="middle"
        className="font-system"
        fontSize={10}
        letterSpacing="0.08em"
        fill="var(--muted)"
        pointerEvents="none"
      >
        {label}
      </text>
      {caption ? (
        <text
          x={x}
          y={y + size + 28}
          textAnchor="middle"
          className="font-system"
          fontSize={9}
          letterSpacing="0.12em"
          fill="var(--faint)"
          pointerEvents="none"
        >
          {caption.toUpperCase()}
        </text>
      ) : null}
    </motion.g>
  );
}

export default GraphNode;
