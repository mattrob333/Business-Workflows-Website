'use client';

/**
 * `FrameworkGraph` — the ACT II centrepiece (03-content-spec) and S2's deliverable.
 *
 * The page teaches one sentence: **frameworks don't pass paragraphs to each other, they
 * pass typed state.** Everything here exists to make that sentence touchable rather than
 * argued. Hover or focus a node and its handoffs light up; hover an edge and a glass
 * panel names the actual `StateField`s travelling along it, straight out of the registry.
 * If the claim were false the panel would be empty — and a registry test guarantees it
 * never is (`validateRegistry`: "edge carries no shared state field").
 *
 * Composition and coordinates: `graph-layout.ts`, which documents the two-band spine and
 * the conductor's bundled convergence. Node and edge *membership* is `src/registry`
 * alone: delete a record and the node and its edges vanish with it (04-phases S2).
 *
 * Colour. The graph has no constraint surface, so it has no amber — not on the
 * conductor, not on hover, not anywhere (00-LAW Ruling 2, team rule 3). Depth is carried
 * by size and stroke weight; connection and activity are carried by `--flow`, which is
 * exactly what that token means.
 *
 * Motion. Nodes arrive with `motion/ingest` (stagger halved — seventeen items at the
 * full 60ms would run for a second before the graph settled); edges assert themselves
 * with `GraphEdge`'s built-in draw (`motion/transform`'s stroke-dashoffset); and
 * `motion/route`'s flow dot only ever runs on an edge you are actually pointing at,
 * because that recipe means *work is moving*, not *a line exists*. Under reduced motion
 * every one of those resolves to its terminal state on the first frame.
 */

import { motion } from 'framer-motion';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { FrameworkId } from '@/registry';
import { GraphEdge } from './GraphEdge';
import { GlassPanel } from './GlassPanel';
import { MONO_LABEL } from './styles';
import {
  GRAPH_VIEWBOX,
  cubicPoint,
  fieldLabels,
  frameworkGraphModel,
  hexPath,
  type GraphEdgeModel,
  type GraphNodeModel,
} from './graph-layout';
import {
  DUR,
  ingestContainerVariants,
  ingestVariants,
  useReducedMotion,
} from '@/lib/motion-utils';

/* --------------------------------------------------------------- selection */

export type GraphSelection =
  | { readonly kind: 'node'; readonly id: FrameworkId }
  | { readonly kind: 'edge'; readonly key: string };

type NodeState = 'active' | 'related' | 'dim' | 'rest';
type EdgeState = 'active' | 'related' | 'dim' | 'rest';

/**
 * Rest state is not a dimmed state. The graph is the page's substance, so at rest it is
 * fully legible — a full-depth node wears a `--muted`-leaning hairline, a chapter node
 * wears `--line-strong`, and the difference between them is weight, never hue.
 */
const NODE_STROKE: Record<NodeState, (full: boolean) => string> = {
  active: () => 'var(--flow)',
  related: () => 'color-mix(in srgb, var(--flow) 62%, var(--line-strong))',
  dim: (full) => (full ? 'var(--line-strong)' : 'var(--line)'),
  rest: (full) =>
    full ? 'color-mix(in srgb, var(--muted) 55%, var(--line-strong))' : 'var(--line-strong)',
};

const NODE_FILL: Record<NodeState, string> = {
  active: 'color-mix(in srgb, var(--flow-deep) 30%, var(--raised))',
  related: 'var(--raised)',
  dim: 'var(--surface)',
  rest: 'var(--raised)',
};

const EDGE_TONE = {
  active: 'active',
  related: 'active',
  dim: 'ghost',
  rest: 'idle',
} as const;

const EDGE_OPACITY: Record<EdgeState, number> = {
  active: 1,
  related: 0.92,
  dim: 0.12,
  rest: 0.44,
};

/**
 * At rest the thirteen edges into the conductor carry more weight than the other
 * forty-five. Emphasis by *opacity*, never by hue: the convergence should be the first
 * thing the eye finds, and the colour grammar has nothing that means "look here".
 */
const REST_CONDUCTOR_OPACITY = 0.8;

/* -------------------------------------------------------------------- node */

function GraphFrameworkNode({
  node,
  state,
  focused,
  onEnter,
  onLeave,
  onFocus,
  onBlur,
  onKeyDown,
  registerRef,
}: {
  node: GraphNodeModel;
  state: NodeState;
  focused: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  /**
   * React types an `<a>` as `HTMLAnchorElement` even inside an `<svg>`, where the DOM
   * actually builds an `SVGAElement`. Both implement `focus()`, which is all the arrow-key
   * navigation needs, so the React type is taken at its word rather than cast around.
   */
  registerRef: (el: HTMLAnchorElement | null) => void;
}) {
  const { framework, x, y, r, lines } = node;
  const full = framework.depth === 'full';
  const labelFill =
    state === 'active' ? 'var(--flow)' : full ? 'var(--ink)' : 'var(--muted)';

  return (
    <g
      data-node={framework.id}
      data-node-state={state}
      data-depth={framework.depth}
      style={{ opacity: state === 'dim' ? 0.4 : 1, transition: 'opacity 300ms linear' }}
    >
      <a
        href={`/frameworks/${framework.slug}`}
        aria-label={node.accessibleName}
        data-slug={framework.slug}
        style={{ outline: 'none', cursor: 'pointer' }}
        ref={registerRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      >
        {/* Hit area first: a hexagon is a hard target, and the label belongs to the link. */}
        <circle cx={x} cy={y} r={r + 8} fill="transparent" />

        {/* The focus ring is drawn as geometry so it survives the SVG stacking context. */}
        <circle
          data-focus-ring="true"
          cx={x}
          cy={y}
          r={r + 9}
          fill="none"
          stroke="var(--flow)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
          style={{ opacity: focused ? 1 : 0, transition: 'opacity 120ms linear' }}
        />

        <path
          d={hexPath(x, y, r)}
          fill={NODE_FILL[state]}
          stroke={NODE_STROKE[state](full)}
          strokeWidth={full ? 2 : 1.5}
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 300ms linear, fill 300ms linear' }}
        />

        {/* The depth field: a full lesson is a double-walled instrument. */}
        {full ? (
          <path
            d={hexPath(x, y, r - 7)}
            fill="none"
            stroke={state === 'active' ? 'var(--flow-deep)' : 'var(--line-strong)'}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            opacity={0.85}
          />
        ) : null}

      </a>

      {/*
        The label lives OUTSIDE the link: wrapped names render as separate <text>
        elements, which accessibility tools concatenate without spaces — as link
        content, every two-line name fails the visible-text ⊆ accessible-name check.
        They were pointer-events:none anyway; the link's name is its aria-label.
      */}
      <g aria-hidden="true">
        {lines.map((line, i) => (
          <text
            key={line}
            x={x}
            y={y + r + 16 + i * 13}
            textAnchor="middle"
            className="font-system"
            fontSize={11}
            letterSpacing="0.04em"
            fill={labelFill}
            pointerEvents="none"
            style={{ transition: 'fill 300ms linear' }}
          >
            {line}
          </text>
        ))}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------- panel */

function SelectionPanel({
  selection,
  model,
}: {
  selection: GraphSelection;
  model: ReturnType<typeof frameworkGraphModel>;
}) {
  const anchor =
    selection.kind === 'node'
      ? model.byId.get(selection.id)
      : model.byKey.get(selection.key);
  if (!anchor) return null;

  const point =
    selection.kind === 'node'
      ? { x: (anchor as GraphNodeModel).x, y: (anchor as GraphNodeModel).y }
      : cubicPoint((anchor as GraphEdgeModel).route.cubic, 0.5);

  /**
   * Where the panel goes. A node keeps its label below it, so the panel sits above; an
   * edge is pushed toward the nearer horizontal margin, which is the emptier half of a
   * canvas whose density is all in the middle. Either way it never lands on the thing it
   * is describing.
   */
  const above =
    selection.kind === 'node'
      ? point.y > GRAPH_VIEWBOX.height * 0.28
      : point.y > GRAPH_VIEWBOX.height * 0.5;
  const leftPct = Math.min(89, Math.max(11, (point.x / GRAPH_VIEWBOX.width) * 100));
  const topPct = (point.y / GRAPH_VIEWBOX.height) * 100;

  return (
    <div
      data-testid="graph-panel"
      data-selection-kind={selection.kind}
      className="pointer-events-none absolute z-20 w-[min(19rem,72vw)]"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: above
          ? 'translate(-50%, calc(-100% - 1.15rem))'
          : 'translate(-50%, 1.15rem)',
      }}
    >
      <GlassPanel pad="sm" elevated border="flow" tone="raised">
        {selection.kind === 'edge' ? (
          <EdgePanelBody edge={anchor as GraphEdgeModel} />
        ) : (
          <NodePanelBody node={anchor as GraphNodeModel} model={model} />
        )}
      </GlassPanel>
    </div>
  );
}

function EdgePanelBody({ edge }: { edge: GraphEdgeModel }) {
  const labels = fieldLabels(edge.fields);
  return (
    <div data-testid="graph-panel-edge">
      <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
        handoff
      </div>
      <p
        className="font-system mt-2 text-[11px] leading-snug"
        style={{ color: 'var(--ink)' }}
      >
        <span>{edge.from.framework.name}</span>
        <span style={{ color: 'var(--flow)' }}> writes → </span>
        <span>{edge.to.framework.name}</span>
        <span style={{ color: 'var(--flow)' }}> reads</span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {labels.map((label) => (
          <li
            key={label}
            data-field-label={label}
            className="font-system rounded-sm px-1.5 py-1 text-[10px] leading-none"
            style={{
              color: 'var(--ink)',
              border: '1px solid color-mix(in srgb, var(--flow) 40%, transparent)',
              background: 'color-mix(in srgb, var(--flow-deep) 16%, transparent)',
            }}
          >
            {label}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] leading-snug" style={{ color: 'var(--muted)' }}>
        {labels.length === 1 ? 'One typed field' : `${labels.length} typed fields`}, not a
        paragraph.
      </p>
    </div>
  );
}

function NodePanelBody({
  node,
  model,
}: {
  node: GraphNodeModel;
  model: ReturnType<typeof frameworkGraphModel>;
}) {
  const { framework } = node;
  const incoming = model.edges.filter((e) => e.to.framework.id === framework.id).length;
  return (
    <div data-testid="graph-panel-node">
      <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
        {node.group.label} · {framework.depth === 'full' ? 'full lesson' : 'chapter'}
      </div>
      <p
        className="font-narrative mt-1.5 text-[19px] leading-[1.15]"
        style={{ color: 'var(--ink)' }}
      >
        {framework.name}
      </p>
      <p className="mt-2 text-[12px] leading-snug" style={{ color: 'var(--muted)' }}>
        {framework.coreQuestion}
      </p>
      <dl
        className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-2"
        style={{ borderColor: 'var(--line)' }}
      >
        {[
          ['reads', `${framework.readsFrom.length}`],
          ['writes', `${framework.writesTo.length}`],
          ['feeds', `${framework.feedsInto.length}`],
          ['fed by', `${incoming}`],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-1.5">
            <dt className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              {k}
            </dt>
            <dd
              className="font-system text-[11px] tabular-nums"
              style={{ color: 'var(--flow)' }}
            >
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------- graph */

export interface FrameworkGraphProps {
  className?: string;
  /** Controlled selection, for pages that inspect an edge in a rail. */
  selectedEdge?: string | null;
  onSelectEdge?: (key: string | null) => void;
  /** The floating explanation panel. Off where a rail does the explaining. */
  inlinePanel?: boolean;
  /** Entrance choreography. */
  animate?: boolean;
  id?: string;
}

export function FrameworkGraph({
  className = '',
  selectedEdge = null,
  onSelectEdge,
  inlinePanel = true,
  animate = true,
  id = 'framework-graph',
}: FrameworkGraphProps) {
  const reduced = useReducedMotion();
  const model = useMemo(() => frameworkGraphModel(), []);
  const [hovered, setHovered] = useState<GraphSelection | null>(null);
  const [focusedNode, setFocusedNode] = useState<FrameworkId | null>(null);
  const nodeRefs = useRef(new Map<FrameworkId, HTMLAnchorElement>());

  /**
   * Two layers of "what is live". `preview` is what the pointer or the keyboard is on
   * right now and is what the floating panel describes; `selection` adds the page's
   * pinned edge, which lights the canvas but never raises a panel — on `/graph` the rail
   * is already answering, and two answers in two places is one too many.
   */
  const preview: GraphSelection | null = focusedNode
    ? { kind: 'node', id: focusedNode }
    : hovered;
  const selection: GraphSelection | null =
    preview ?? (selectedEdge ? { kind: 'edge', key: selectedEdge } : null);

  const activeNode = selection?.kind === 'node' ? selection.id : null;
  const activeEdge = selection?.kind === 'edge' ? selection.key : null;

  const related = useMemo(() => {
    const nodes = new Set<FrameworkId>();
    const edges = new Set<string>();
    if (activeNode) {
      for (const e of model.edges) {
        if (e.from.framework.id === activeNode || e.to.framework.id === activeNode) {
          edges.add(e.key);
          nodes.add(e.from.framework.id);
          nodes.add(e.to.framework.id);
        }
      }
    }
    if (activeEdge) {
      const e = model.byKey.get(activeEdge);
      if (e) {
        edges.add(e.key);
        nodes.add(e.from.framework.id);
        nodes.add(e.to.framework.id);
      }
    }
    return { nodes, edges };
  }, [activeEdge, activeNode, model]);

  const quiet = !activeNode && !activeEdge;

  const nodeState = (node: GraphNodeModel): NodeState => {
    if (quiet) return 'rest';
    if (node.framework.id === activeNode) return 'active';
    if (related.nodes.has(node.framework.id)) return 'related';
    return 'dim';
  };

  const edgeState = (edge: GraphEdgeModel): EdgeState => {
    if (quiet) return 'rest';
    if (edge.key === activeEdge) return 'active';
    if (related.edges.has(edge.key)) return 'related';
    return 'dim';
  };

  /**
   * Arrow keys walk the graph in reading order. Tab already does this — the arrows are
   * there because a graph invites directional movement, and a keyboard user who reaches
   * for them should not fall through to the page scroll.
   */
  const moveFocus = useCallback(
    (from: FrameworkId, delta: number) => {
      const index = model.order.findIndex((n) => n.framework.id === from);
      if (index < 0) return;
      const next = model.order[(index + delta + model.order.length) % model.order.length];
      if (!next) return;
      nodeRefs.current.get(next.framework.id)?.focus();
    },
    [model],
  );

  const onNodeKeyDown = (nodeId: FrameworkId) => (event: React.KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    const delta = map[event.key];
    if (delta) {
      event.preventDefault();
      moveFocus(nodeId, delta);
      return;
    }
    if (event.key === 'Escape') {
      (event.currentTarget as HTMLAnchorElement).blur();
      setFocusedNode(null);
    }
  };

  /**
   * Reduced motion gets the terminal state on the first frame, not a shortened entrance.
   *
   * The subtlety: a statically exported page renders with `reduced === false` and only
   * learns the truth at hydration, by which point Framer has already scheduled a
   * seventeen-item stagger. Re-keying the group on that flip remounts it *without* any
   * entrance props at all, so the graph is simply there. Full-motion visitors never see
   * the flip, so they never see a remount.
   */
  const entrance = animate && !reduced;
  const container = ingestContainerVariants(reduced, DUR.stagger / 2);
  const item = ingestVariants(reduced, 8);

  return (
    <div
      data-testid="framework-graph"
      data-reduced={reduced ? 'true' : 'false'}
      className={`w-full overflow-x-auto ${className}`}
    >
      <div
        className="relative min-w-[64rem]"
        style={{ aspectRatio: `${GRAPH_VIEWBOX.width} / ${GRAPH_VIEWBOX.height}` }}
      >
        <svg
          id={id}
          viewBox={`0 0 ${GRAPH_VIEWBOX.width} ${GRAPH_VIEWBOX.height}`}
          className="absolute inset-0 h-full w-full"
          role="group"
          aria-label={`The framework graph: ${model.nodes.length} frameworks and ${model.edges.length} handoffs. Each node links to its page; the list below the graph carries the same information as text.`}
        >
          <desc>
            Frameworks are laid out left to right in the order a diagnosis runs them. Lines
            run from the framework that writes a state field to the framework that reads
            it. Thirteen of them converge on Theory of Constraints.
          </desc>

          {/* Group labels — the system voice, 01 §3. */}
          <g data-layer="groups" aria-hidden="true">
            {model.groups.map(({ group, placement }) =>
              placement ? (
                <g key={group.id}>
                  <text
                    x={placement.x}
                    y={placement.y}
                    textAnchor={placement.anchor}
                    className="font-system"
                    fontSize={10}
                    letterSpacing="0.14em"
                    fill="var(--faint)"
                  >
                    {group.label.toUpperCase()}
                  </text>
                  {/* The rule is only as wide as the word — a long one reads as an edge. */}
                  <line
                    x1={
                      placement.anchor === 'middle'
                        ? placement.x - (group.label.length * 7.6) / 2
                        : placement.x
                    }
                    x2={
                      placement.anchor === 'middle'
                        ? placement.x + (group.label.length * 7.6) / 2
                        : placement.x + group.label.length * 7.6
                    }
                    y1={placement.y + 9}
                    y2={placement.y + 9}
                    stroke="var(--line-strong)"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ) : null,
            )}
          </g>

          {/*
            Edges are painted before nodes (SVG paints in document order) and are hidden
            from assistive technology: fifty-eight paths would drown the seventeen links
            that matter, and every handoff is spelled out in the list below the graph and
            in /graph's inspection rail.
          */}
          <g data-layer="edges" aria-hidden="true" style={{ pointerEvents: 'none' }}>
            {model.edges.map((edge, i) => {
              const state = edgeState(edge);
              return (
                <g
                  key={edge.key}
                  data-edge={edge.key}
                  data-edge-state={state}
                  data-returns={edge.route.returns ? 'true' : 'false'}
                  opacity={
                    state === 'rest' && edge.to.framework.id === 'theory-of-constraints'
                      ? REST_CONDUCTOR_OPACITY
                      : EDGE_OPACITY[state]
                  }
                  style={{ transition: 'opacity 300ms linear' }}
                >
                  <GraphEdge
                    d={edge.route.d}
                    tone={EDGE_TONE[state]}
                    draw={animate}
                    drawDelay={entrance ? 0.25 + Math.min(i, 58) * 0.012 : 0}
                    route={state === 'active'}
                    routeRepeat={state === 'active'}
                  />
                  {/* A 1.5px curve is not a mouse target. This is. */}
                  <path
                    d={edge.route.d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={18}
                    style={{ pointerEvents: 'stroke', cursor: onSelectEdge ? 'pointer' : 'default' }}
                    onMouseEnter={() => setHovered({ kind: 'edge', key: edge.key })}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelectEdge?.(edge.key)}
                  />
                </g>
              );
            })}
          </g>

          <motion.g
            key={entrance ? 'entrance' : 'static'}
            data-layer="nodes"
            data-recipe="motion/ingest"
            {...(entrance
              ? { variants: container, initial: 'hidden' as const, animate: 'shown' as const }
              : {})}
          >
            {model.nodes.map((node) => (
              <motion.g key={node.framework.id} {...(entrance ? { variants: item } : {})}>
                <GraphFrameworkNode
                  node={node}
                  state={nodeState(node)}
                  focused={focusedNode === node.framework.id}
                  onEnter={() => setHovered({ kind: 'node', id: node.framework.id })}
                  onLeave={() => setHovered(null)}
                  onFocus={() => setFocusedNode(node.framework.id)}
                  onBlur={() => setFocusedNode(null)}
                  onKeyDown={onNodeKeyDown(node.framework.id)}
                  registerRef={(el) => {
                    if (el) nodeRefs.current.set(node.framework.id, el);
                    else nodeRefs.current.delete(node.framework.id);
                  }}
                />
              </motion.g>
            ))}
          </motion.g>
        </svg>

        {inlinePanel && preview ? (
          <SelectionPanel selection={preview} model={model} />
        ) : null}
      </div>
    </div>
  );
}

export default FrameworkGraph;
