'use client';

/**
 * ACT II's instrument panel — an authored crop of the Framework Graph.
 *
 * 03-content-spec asks for *"the Framework Graph fades in around the canvas … the graph
 * edges light as outputs hand off (`motion/route`)"*, and the teaching line is one
 * sentence: **frameworks don't pass paragraphs — they pass typed state.**
 *
 * It is deliberately *not* `components/FrameworkGraph`. That surface renders seventeen
 * nodes and fifty-eight edges, each one focusable and inspectable, and hydrates all of
 * them — the measured cost behind S2's open Lighthouse question. On a page whose hard
 * line is `LCP < 2.0s` (00-LAW Ruling 7) the homepage cannot afford the interactive
 * canvas, and does not need it: what has to be legible while scrolling is seven
 * instruments and the wires between them.
 *
 * So this uses the same primitives (`GraphNode`, `GraphEdge`), the same hand-placed
 * layout idiom as `components/graph-layout` (two bands, a spine, the conductor's
 * convergence bundled), and the same recipes (`motion/transform`'s draw, then
 * `motion/route`'s travelling dot). It reads as a crop of `/frameworks` because it *is*
 * one — every node and every edge here is a registry record, and the fields printed in
 * the readout are the real intersection of what the source writes and the target reads.
 *
 * Every prop is plain data, computed at build time in `./data`. Neither the registry nor
 * Beacon's pack is reachable from this bundle.
 *
 * Reduced motion: `useStage` reports the terminal step, so every edge renders drawn,
 * every node resolved, and the readout rests on the last handoff. The finished map, not
 * a frozen first frame.
 */

import type { ReactNode } from 'react';
import { GraphEdge } from '@/components/GraphEdge';
import { GraphNode, type GraphNodeState } from '@/components/GraphNode';
import { MONO_LABEL } from '@/components/styles';
import { useStage } from '@/motion/acts';
import type { InstrumentEdge, InstrumentNode } from './data';

export interface InstrumentGraphProps {
  nodes: readonly InstrumentNode[];
  edges: readonly InstrumentEdge[];
  /** Drawn ghosted and never lit — the loop, visible as a shape. */
  returnEdge?: InstrumentEdge;
  viewBox: { width: number; height: number };
  /**
   * The act's editorial block, rendered on the server and laid out *beside* the readout.
   * It is a prop rather than a sibling because the readout is driven by this component's
   * stage clock, and a pinned act is one viewport: stacking sentence, readout and map in
   * three separate rows overflows a short screen, and a pinned stage clips rather than
   * scrolls.
   */
  header?: ReactNode;
  className?: string;
}

export function InstrumentGraph({
  nodes,
  edges,
  returnEdge,
  viewBox,
  header,
  className = '',
}: InstrumentGraphProps) {
  /** One step per handoff, plus a settled final reading. */
  const { step, ref } = useStage(edges.length + 1);

  /** The node nothing feeds — the canvas ACT I just assembled. Resolved from the start. */
  const origin = nodes.find((n) => !edges.some((e) => e.toId === n.id));
  const current = edges[Math.min(step, edges.length - 1)];

  function stateOf(node: InstrumentNode): GraphNodeState {
    if (node.id === origin?.id) return step === 0 ? 'active' : 'done';
    const arrived = edges.some((e, i) => e.toId === node.id && i < step);
    if (arrived) return 'done';
    if (edges[step]?.toId === node.id) return 'active';
    return 'idle';
  }

  const readout = (
    <div
      data-testid="instrument-readout"
      className="rounded-md border p-3"
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
      }}
    >
      <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
        {step >= edges.length ? 'the last handoff' : 'on the wire'}
      </div>
      {current ? (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-system text-[12px]" style={{ color: 'var(--ink)' }}>
              {current.from}
            </span>
            <span aria-hidden="true" style={{ color: 'var(--flow)' }}>
              →
            </span>
            <span className="font-system text-[12px]" style={{ color: 'var(--ink)' }}>
              {current.to}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {current.fields.map((field) => (
              <span
                key={field}
                data-state-field={field}
                className="font-system rounded-sm border px-2 py-[3px] text-[10px]"
                style={{
                  color: 'var(--flow)',
                  borderColor: 'color-mix(in srgb, var(--flow) 35%, transparent)',
                  background: 'color-mix(in srgb, var(--flow-deep) 14%, transparent)',
                }}
              >
                {field}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <div ref={ref} data-testid="instrument-graph" data-step={step} className={className}>
      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-end">
        {header}
        {/* The lesson, in the state vocabulary: what is on the wire right now. */}
        {readout}
      </div>

      <div
        className="relative overflow-hidden rounded-lg"
        style={{
          border: '1px solid var(--line)',
          background: 'color-mix(in srgb, var(--paper) 60%, transparent)',
        }}
      >
        <svg
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
          className="w-full"
          role="img"
          aria-label={`Seven frameworks and the state fields that travel between them: ${edges
            .map((e) => `${e.from} writes ${e.fields.join(', ')} to ${e.to}`)
            .join('; ')}.`}
        >
          {returnEdge ? (
            <GraphEdge key={returnEdge.id} d={returnEdge.d} tone="ghost" dashed draw={false} />
          ) : null}

          {edges.map((edge, i) => (
            <GraphEdge
              key={edge.id}
              d={edge.d}
              tone={i < step ? 'active' : 'idle'}
              draw={i <= step}
              drawDelay={0}
              route={i === step}
              routeRepeat
            />
          ))}

          {nodes.map((node) => (
            <GraphNode
              key={node.id}
              x={node.x}
              y={node.y}
              label={node.label}
              caption={node.caption}
              size={node.r}
              state={stateOf(node)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export default InstrumentGraph;
