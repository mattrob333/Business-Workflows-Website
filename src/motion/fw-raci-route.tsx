'use client';

/**
 * Recipe `fw/raci-route` — 01-design-system §5.
 *
 * Spec: a work packet (glass card) travels a routing diagram between human and agent
 * nodes; at an approval checkpoint the packet *stops*, a mono `AWAITING HUMAN JUDGMENT`
 * chip appears, the human node pulses, then signs (a stroke-drawn signature flourish,
 * 600ms) and the packet continues. Agents render as square nodes, humans as round —
 * accountability is always a round node.
 *
 * The stop is the whole recipe. Everything else on this site argues that frameworks can
 * run continuously; this one shows where they must not — the moment a human is
 * accountable, the pipeline waits, visibly, and the wait has a name on it. It is the
 * animated form of the approval-gated state writes that Phase 2's engine is built
 * around (00-LAW Ruling 4).
 *
 * Reduced motion: the packet renders delivered at the final node, the signature is
 * already drawn, and the checkpoint keeps its `signed` marker so the pause is still
 * recorded in the picture rather than merely having happened.
 */

import { motion } from 'framer-motion';
import { DUR, usePathSlots, useReducedMotion } from '@/lib/motion-utils';
import { GraphEdge } from '@/components/GraphEdge';
import { GraphNode } from '@/components/GraphNode';
import { MONO_LABEL } from '@/components/styles';
import { DrawPath, PathTraveler } from './motion-transform';
import { useStage } from './acts';

/* ------------------------------------------------------------------- types */

export type RaciLetter = 'R' | 'A' | 'C' | 'I';

export interface RaciNode {
  id: string;
  label: string;
  kind: 'human' | 'agent';
  raci: RaciLetter;
}

export interface RaciRouteProps {
  /** In routing order. The packet visits them left to right. */
  nodes: RaciNode[];
  /** What is being routed. */
  packet: string;
  /** Node id that must approve. Defaults to the accountable (`A`) node. */
  checkpointId?: string;
  className?: string;
}

const RACI_GLOSS: Record<RaciLetter, string> = {
  R: 'responsible — does the work',
  A: 'accountable — owns the outcome',
  C: 'consulted — asked before',
  I: 'informed — told after',
};

/* ------------------------------------------------------------------ layout */

const VB_W = 940;
const VB_H = 250;
const NODE_R = 24;

function nodePos(i: number, total: number): { x: number; y: number } {
  const span = VB_W - 150;
  const x = 75 + (total <= 1 ? 0 : (span / (total - 1)) * i);
  const y = VB_H / 2 - 34 + (i % 2 === 0 ? -20 : 20);
  return { x, y };
}

function edgePath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const mx = (a.x + b.x) / 2;
  return `M ${a.x + NODE_R + 4} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x - NODE_R - 4} ${b.y}`;
}

/** A hand-drawn-looking flourish. Stroke-only, 1.5px — §7's iconography rule. */
const SIGNATURE =
  'M 0 8 C 6 -6, 12 -6, 15 4 C 18 14, 24 14, 27 2 C 30 -8, 38 -4, 41 6 C 43 12, 48 10, 54 0';

/* --------------------------------------------------------------- component */

export function RaciRoute({ nodes, packet, checkpointId, className = '' }: RaciRouteProps) {
  const reduced = useReducedMotion();
  const n = nodes.length;
  const { paths, setPath } = usePathSlots(Math.max(0, n - 1));

  const rawCheckpoint = checkpointId
    ? nodes.findIndex((node) => node.id === checkpointId)
    : nodes.findIndex((node) => node.raci === 'A');
  /** Clamped: a checkpoint on the first node has nothing to arrive from. */
  const checkpoint = Math.min(Math.max(1, rawCheckpoint), Math.max(1, n - 2));

  /** One arrival per edge, plus the pause and the signing. */
  const steps = n + 1;
  const { step, ref } = useStage(steps);

  const nodeIndex =
    step <= checkpoint ? step : step === checkpoint + 1 ? checkpoint : step - 1;
  const settledIndex = Math.min(nodeIndex, n - 1);
  const edgeIndex =
    step === 0
      ? -1
      : step <= checkpoint
        ? step - 1
        : step === checkpoint + 1
          ? checkpoint - 1
          : step - 2;

  const waiting = step === checkpoint;
  const signing = step >= checkpoint + 1;
  const positions = nodes.map((_, i) => nodePos(i, n));
  const checkpointPos = positions[checkpoint] ?? { x: VB_W / 2, y: VB_H / 2 };
  const startPos = positions[0] ?? { x: 75, y: VB_H / 2 };

  const packetCard = (
    <g>
      <rect
        x={-56}
        y={-17}
        width={112}
        height={34}
        rx={5}
        fill="color-mix(in srgb, var(--raised) 92%, transparent)"
        stroke={
          waiting
            ? 'var(--line-strong)'
            : 'color-mix(in srgb, var(--flow) 60%, transparent)'
        }
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={0}
        y={-2}
        textAnchor="middle"
        className="font-system"
        fontSize={9}
        letterSpacing="0.14em"
        fill="var(--faint)"
      >
        WORK PACKET
      </text>
      <text
        x={0}
        y={10}
        textAnchor="middle"
        className="font-system"
        fontSize={10}
        fill="var(--ink)"
      >
        {packet}
      </text>
    </g>
  );

  return (
    <div ref={ref} data-recipe="fw/raci-route" data-step={step} className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full"
        role="img"
        aria-label={`${packet} routed through ${nodes
          .map((node) => `${node.label} (${node.kind}, ${node.raci})`)
          .join(' then ')}, pausing for approval at ${nodes[checkpoint]?.label ?? 'the accountable node'}.`}
      >
        {/* Edges. Drawn ahead of the packet — the route exists before the work does. */}
        {nodes.slice(0, -1).map((node, i) => {
          const a = positions[i];
          const b = positions[i + 1];
          if (!a || !b) return null;
          const travelled = edgeIndex >= i;
          return (
            <GraphEdge
              key={`${node.id}-edge`}
              d={edgePath(a, b)}
              tone={travelled ? 'active' : 'idle'}
              draw
              drawDelay={i * 0.06}
            />
          );
        })}

        {/* Measurement-only copies: the packet needs real path geometry to ride. */}
        <g opacity={0} aria-hidden="true">
          {nodes.slice(0, -1).map((node, i) => {
            const a = positions[i];
            const b = positions[i + 1];
            if (!a || !b) return null;
            return <path key={`${node.id}-measure`} ref={setPath[i]} d={edgePath(a, b)} fill="none" />;
          })}
        </g>

        {nodes.map((node, i) => {
          const p = positions[i];
          if (!p) return null;
          const state =
            i === checkpoint && waiting
              ? 'waiting'
              : i < settledIndex || (i === checkpoint && signing)
                ? 'done'
                : i === settledIndex
                  ? 'active'
                  : 'idle';
          return (
            <GraphNode
              key={node.id}
              x={p.x}
              y={p.y}
              size={NODE_R}
              label={node.label}
              kind={node.kind}
              state={state}
              badge={node.raci}
              caption={node.kind}
            />
          );
        })}

        {/* The signature flourish: 600ms, stroke-drawn, at the accountable node. */}
        <g transform={`translate(${checkpointPos.x - 27} ${checkpointPos.y + 52})`}>
          <DrawPath
            d={SIGNATURE}
            active={signing}
            duration={DUR.sign}
            stroke="var(--evidence)"
            opacity={signing ? 1 : 0}
          />
        </g>

        {/* The packet itself. */}
        {edgeIndex >= 0 && paths[edgeIndex] ? (
          <PathTraveler
            key={edgeIndex}
            path={paths[edgeIndex] ?? null}
            active
            duration={DUR.route}
            ease="linear"
          >
            {packetCard}
          </PathTraveler>
        ) : (
          <g transform={`translate(${startPos.x} ${startPos.y - 52})`}>{packetCard}</g>
        )}
      </svg>

      {/* The stop, named. */}
      <motion.div
        className="pointer-events-none absolute -translate-x-1/2"
        style={{
          left: `${(checkpointPos.x / VB_W) * 100}%`,
          top: `${((checkpointPos.y - 78) / VB_H) * 100}%`,
        }}
        initial={false}
        animate={{ opacity: waiting ? 1 : 0, y: waiting || reduced ? 0 : -4 }}
        transition={{ duration: reduced ? DUR.reduced : DUR.state }}
      >
        <span
          className={`${MONO_LABEL} rounded-full border px-3 py-[5px] text-[9px] whitespace-nowrap`}
          style={{
            color: 'var(--ink)',
            borderColor: 'var(--line-strong)',
            background: 'color-mix(in srgb, var(--raised) 92%, transparent)',
            boxShadow: 'var(--shadow)',
          }}
        >
          awaiting human judgment
        </span>
      </motion.div>

      <div
        className="mt-3 flex flex-wrap gap-x-5 gap-y-1"
        style={{ color: 'var(--faint)' }}
      >
        {(['R', 'A', 'C', 'I'] as RaciLetter[]).map((letter) => (
          <span key={letter} className={`${MONO_LABEL} text-[9px]`}>
            <span style={{ color: 'var(--muted)' }}>{letter}</span> · {RACI_GLOSS[letter]}
          </span>
        ))}
        <span className={`${MONO_LABEL} text-[9px]`}>round = human · square = agent</span>
      </div>
    </div>
  );
}

export default RaciRoute;
