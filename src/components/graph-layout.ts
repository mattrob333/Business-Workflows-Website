/**
 * The Framework Graph's **authored layout** — S2's load-bearing design decision.
 *
 * 02-architecture: *"custom SVG force-free layout (hand-positioned nodes — 17 nodes
 * don't need a physics engine; authored layout beats simulated layout for an award
 * site)"*. This module is that authored layout: every coordinate below was placed by
 * hand and then checked, edge by edge, for clearance against every node it passes.
 *
 * The composition reads left to right in the narrative order of 03-content-spec:
 *
 * ```
 *              TERRAIN     ADVANTAGE        DIRECTION
 *                 pestle      vrio        ansoff  blue-ocean
 *                 forces      swot   tows   3H
 *   MAP  bmc ──────────────────────────────────────────►  CONDUCTOR ──► DELEGATION
 *                 jtbd  vpc  kano                            toc          raci
 *                              7s   bsc   okrs
 *              CUSTOMER            ALIGNMENT
 * ```
 *
 * Three ideas hold it together:
 *
 * 1. **Two bands and a spine.** The outward-looking analysis (terrain → advantage →
 *    direction) runs along the top; the inward-looking analysis (customer → alignment)
 *    runs along the bottom. `bmc`, `theory-of-constraints` and `raci` sit on a single
 *    horizontal spine between them, so the eye has one uninterrupted line from *what is
 *    this business* to *who does the work*.
 * 2. **The conductor's convergence is bundled.** Thirteen of the seventeen frameworks
 *    feed Theory of Constraints. Drawn naively that is thirteen unrelated lines; drawn
 *    through two shared throats — one above the spine for the upper band, one below it
 *    for the lower — it is a *sheaf*, and the pivot of the story becomes visible as a
 *    shape rather than as a caption.
 * 3. **Return edges are drawn as returns.** Five edges point right-to-left (the loop
 *    closing: the constraint re-writes the scorecard, RACI re-enters the constraint).
 *    They leave and enter on the flanks the direction implies, so the loop reads as a
 *    loop instead of as a mistake.
 *
 * Nothing here is data: the registry is the only source of *which* nodes and edges
 * exist. A framework with no entry in `NODE_POSITIONS` still renders — it lands on the
 * fallback shelf — so adding a record can never make the graph silently lose a node.
 */

import {
  FRAMEWORKS,
  GROUPS,
  allEdges,
  stateField,
  type Framework,
  type FrameworkGroup,
  type FrameworkGroupMeta,
  type FrameworkId,
  type StateField,
} from '@/registry';

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** The user-coordinate space every graph surface shares (mini-map included). */
export const GRAPH_VIEWBOX = { width: 1500, height: 840 } as const;

/* ------------------------------------------------------------------- nodes */

/**
 * Hand-placed node centres. Partial by design: `Partial<Record<...>>` forces every
 * consumer through the fallback path, which is what keeps a newly added registry
 * record visible instead of invisible.
 */
export const NODE_POSITIONS: Readonly<Partial<Record<FrameworkId, Point>>> = {
  // the spine
  bmc: { x: 116, y: 410 },
  'theory-of-constraints': { x: 1198, y: 410 },
  raci: { x: 1348, y: 410 },

  // upper band — the outward-looking analysis
  pestle: { x: 288, y: 108 },
  'five-forces': { x: 288, y: 272 },
  vrio: { x: 448, y: 108 },
  swot: { x: 448, y: 272 },
  tows: { x: 592, y: 186 },
  ansoff: { x: 760, y: 92 },
  'three-horizons': { x: 760, y: 248 },
  'blue-ocean': { x: 906, y: 166 },

  // lower band — the inward-looking analysis
  'jobs-to-be-done': { x: 408, y: 560 },
  'value-proposition-canvas': { x: 556, y: 560 },
  kano: { x: 704, y: 560 },
  'mckinsey-7s': { x: 816, y: 706 },
  'balanced-scorecard': { x: 958, y: 662 },
  okrs: { x: 1100, y: 616 },
};

/** Where an unplaced framework lands: a shelf under the composition, in index order. */
export function fallbackPosition(index: number): Point {
  return { x: 160 + (index % 8) * 170, y: 818 };
}

export function nodePosition(id: FrameworkId, index: number): Point {
  return NODE_POSITIONS[id] ?? fallbackPosition(index);
}

/**
 * Radius in user units. Depth is carried by *size and weight*, never by hue — the
 * semantic colour grammar (00-LAW Ruling 2) has no colour that means "important", and
 * inventing one here would be the first crack in it.
 */
export function nodeRadius(depth: 'full' | 'chapter', id?: FrameworkId): number {
  if (id === 'theory-of-constraints') return 36;
  return depth === 'full' ? 28 : 21;
}

/**
 * The framework hexagon — the same construction `GraphNode` uses for `kind="framework"`.
 *
 * It is restated here rather than imported because `GraphNode` is an S0-owned client
 * component and this module is imported by server components (`GraphLegend`, the mini-map).
 * If the shape is ever tuned, both copies move: one geometry, two call sites.
 */
export function hexPath(cx: number, cy: number, r: number): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

/* ------------------------------------------------------------ group labels */

export interface GroupLabelPlacement {
  readonly group: FrameworkGroup;
  readonly x: number;
  readonly y: number;
  readonly anchor: 'start' | 'middle';
}

/** Mono group labels (01 §3, the system voice), placed where the cluster leaves room. */
export const GROUP_LABELS: readonly GroupLabelPlacement[] = [
  { group: 'map', x: 116, y: 336, anchor: 'middle' },
  { group: 'terrain', x: 256, y: 46, anchor: 'start' },
  { group: 'advantage', x: 416, y: 46, anchor: 'start' },
  { group: 'direction', x: 728, y: 34, anchor: 'start' },
  { group: 'customer', x: 376, y: 494, anchor: 'start' },
  { group: 'alignment', x: 784, y: 786, anchor: 'start' },
  { group: 'conductor', x: 1198, y: 330, anchor: 'middle' },
  { group: 'delegation', x: 1348, y: 330, anchor: 'middle' },
];

/* -------------------------------------------------------------------- edges */

export function edgeKey(from: FrameworkId, to: FrameworkId): string {
  return `${from}->${to}`;
}

export interface Cubic {
  readonly p0: Point;
  readonly p1: Point;
  readonly p2: Point;
  readonly p3: Point;
}

export function cubicPoint(c: Cubic, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * c.p0.x + b * c.p1.x + d * c.p2.x + e * c.p3.x,
    y: a * c.p0.y + b * c.p1.y + d * c.p2.y + e * c.p3.y,
  };
}

const round = (n: number): string => (Math.round(n * 10) / 10).toString();

export function cubicPath(c: Cubic): string {
  return `M ${round(c.p0.x)} ${round(c.p0.y)} C ${round(c.p1.x)} ${round(c.p1.y)}, ${round(
    c.p2.x,
  )} ${round(c.p2.y)}, ${round(c.p3.x)} ${round(c.p3.y)}`;
}

/**
 * The conductor's two throats. Every edge into Theory of Constraints passes through one
 * of them, which is what turns thirteen lines into one legible convergence.
 */
const THROAT_ABOVE: Point = { x: 1052, y: 348 };
const THROAT_BELOW: Point = { x: 1052, y: 470 };

/**
 * Per-edge corrections, applied before the router. Every entry exists because the
 * generic route produced a shape that was clear of every node and still read wrong —
 * clearance is checkable by machine, "this looks like a mistake" is not.
 */
const EDGE_TUNING: Readonly<Record<string, Cubic>> = {
  // The four return edges around the conductor. Left to the generic router they kink
  // into a dangling V between the conductor and RACI; authored, they read as what they
  // are — the loop closing back on the diagnosis that produced them.
  'raci->theory-of-constraints': {
    p0: { x: 1348, y: 442 },
    p1: { x: 1342, y: 512 },
    p2: { x: 1254, y: 512 },
    p3: { x: 1198, y: 452 },
  },
  'theory-of-constraints->okrs': {
    p0: { x: 1216, y: 442 },
    p1: { x: 1268, y: 522 },
    p2: { x: 1208, y: 592 },
    p3: { x: 1128, y: 604 },
  },
  'theory-of-constraints->balanced-scorecard': {
    p0: { x: 1172, y: 442 },
    p1: { x: 1118, y: 500 },
    p2: { x: 1028, y: 600 },
    p3: { x: 1004, y: 644 },
  },
  'raci->balanced-scorecard': {
    p0: { x: 1360, y: 440 },
    p1: { x: 1398, y: 648 },
    p2: { x: 1174, y: 782 },
    p3: { x: 986, y: 694 },
  },
  // Blue Ocean's value curve re-enters the TOWS cross through the corridor between
  // Ansoff and Three Horizons — the one gap the upper band leaves open.
  'blue-ocean->tows': {
    p0: { x: 879, y: 166 },
    p1: { x: 820, y: 150 },
    p2: { x: 700, y: 160 },
    p3: { x: 618, y: 180 },
  },
};

export interface EdgeRoute {
  readonly key: string;
  readonly cubic: Cubic;
  readonly d: string;
  /** True when the edge points right-to-left: the loop, not the sequence. */
  readonly returns: boolean;
  /** Closest approach to a node that is not one of this edge's endpoints, in user units. */
  readonly clearance: number;
}

export interface Obstacle {
  readonly id: FrameworkId;
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/**
 * How close a cubic comes to any node it does not connect.
 *
 * A fifty-eight-edge graph will always have crossings — crossings are honest, an edge
 * that appears to touch a node it does not connect is not. This is the number the
 * layout is tuned against, and `tests/graph.spec.ts` asserts it stays positive.
 */
function clearanceOf(c: Cubic, obstacles: readonly Obstacle[]): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i <= 48; i++) {
    const p = cubicPoint(c, i / 48);
    if (
      p.x < 8 ||
      p.x > GRAPH_VIEWBOX.width - 8 ||
      p.y < 8 ||
      p.y > GRAPH_VIEWBOX.height - 8
    ) {
      return -999;
    }
    for (const o of obstacles) {
      const d = Math.hypot(p.x - o.x, p.y - o.y) - o.r;
      if (d < min) min = d;
    }
  }
  return min;
}

/** Symmetric arch offsets tried for a generic edge, calmest first. */
const BOWS = [0, -46, 46, -92, 92, -138, 138, -184, 184] as const;
const TENSIONS = [0.45, 0.62, 0.32] as const;

/**
 * Route one edge.
 *
 * Four cases, in order: an authored correction (the table above); the conductor's
 * bundled funnel; a near-vertical hop within a column; and the default left-to-right
 * cubic, which leaves the writer's right flank and arrives at the reader's left flank
 * so direction stays readable without hanging an arrowhead on all fifty-eight lines.
 *
 * Within a case the shape is chosen by a *deterministic clearance search*: the same
 * handful of arch offsets is tried in a fixed order and the first one that clears every
 * unrelated node by a comfortable margin wins, falling back to the roomiest candidate.
 * Node positions stay hand-placed — this only decides how high a line arches on its way
 * between two hand-placed points, which is the part no human should have to re-derive
 * every time a registry record changes.
 */
export function routeEdge(args: {
  from: Point;
  fromRadius: number;
  to: Point;
  toRadius: number;
  key: string;
  /** The reader is the conductor: bundle this edge through a throat. */
  toConductor: boolean;
  /** Nodes this edge must not appear to touch. */
  obstacles?: readonly Obstacle[];
}): EdgeRoute {
  const { from: a, fromRadius: ra, to: b, toRadius: rb, key, toConductor } = args;
  const obstacles = args.obstacles ?? [];
  const finish = (cubic: Cubic): EdgeRoute => ({
    key,
    cubic,
    d: cubicPath(cubic),
    returns: b.x < a.x,
    clearance: clearanceOf(cubic, obstacles),
  });

  const tuned = EDGE_TUNING[key];
  if (tuned) return finish(tuned);

  const dx = b.x - a.x;
  const dy = b.y - a.y;

  /** Try candidates in order; take the first comfortable one, else the roomiest. */
  const pick = (candidates: Cubic[]): Cubic => {
    let best = candidates[0] as Cubic;
    let bestClearance = -Infinity;
    for (const candidate of candidates) {
      const clearance = clearanceOf(candidate, obstacles);
      if (clearance >= 22) return candidate;
      if (clearance > bestClearance) {
        bestClearance = clearance;
        best = candidate;
      }
    }
    return best;
  };

  if (toConductor && dx > 120) {
    const above = a.y < b.y - 40;
    const below = a.y > b.y + 40;
    if (!above && !below) {
      // The spine: the map runs dead level into the conductor.
      return finish({
        p0: { x: a.x + ra + 6, y: a.y },
        p1: { x: a.x + 340, y: a.y },
        p2: { x: THROAT_ABOVE.x, y: b.y },
        p3: { x: b.x - rb - 9, y: b.y },
      });
    }
    const sign = above ? 1 : -1;
    const throat = above ? THROAT_ABOVE : THROAT_BELOW;
    return finish(
      pick(
        [132, 92, 176, 60].map((lead) => ({
          p0: { x: a.x + ra * 0.72, y: a.y + sign * ra * 0.72 },
          p1: {
            x: a.x + Math.min(104, Math.max(64, (throat.x - a.x) * 0.55)),
            y: a.y + sign * lead,
          },
          p2: throat,
          p3: { x: b.x - rb - 9, y: b.y - sign * 14 },
        })),
      ),
    );
  }

  if (Math.abs(dx) < 70 && Math.abs(dy) > 60) {
    // A hop down (or up) a column: bow sideways so the two nodes stay readable.
    const dir = dy > 0 ? 1 : -1;
    return finish(
      pick(
        [64, -64, 116, -116].map((bow) => ({
          p0: { x: a.x, y: a.y + dir * (ra + 6) },
          p1: { x: a.x + bow, y: a.y + dir * (ra + 40) },
          p2: { x: b.x + bow, y: b.y - dir * (rb + 40) },
          p3: { x: b.x, y: b.y - dir * (rb + 9) },
        })),
      ),
    );
  }

  if (dx > 0) {
    const p0 = { x: a.x + ra + 6, y: a.y };
    const p3 = { x: b.x - rb - 9, y: b.y };
    const span = Math.max(40, p3.x - p0.x);
    const candidates: Cubic[] = [];
    for (const bow of BOWS) {
      for (const tension of TENSIONS) {
        const k = Math.max(24, Math.min(190, span * tension));
        candidates.push({
          p0,
          p1: { x: p0.x + k, y: p0.y + bow },
          p2: { x: p3.x - k, y: p3.y + bow },
          p3,
        });
      }
    }
    return finish(pick(candidates));
  }

  // A return edge with no authored correction: leave left, arrive right, bow away.
  return finish(
    pick(
      [84, -84, 140, -140].map((bow) => ({
        p0: { x: a.x - ra - 6, y: a.y },
        p1: { x: a.x - 110, y: a.y + bow },
        p2: { x: b.x + 140, y: b.y + bow },
        p3: { x: b.x + rb + 9, y: b.y },
      })),
    ),
  );
}

/** Route every edge once. Pure and deterministic, so SSR and hydration agree. */
export function routeAll(
  edges: readonly { from: FrameworkId; to: FrameworkId }[],
  nodes: readonly Obstacle[],
  conductor: FrameworkId = 'theory-of-constraints',
): Map<string, EdgeRoute> {
  const byNode = new Map<FrameworkId, Obstacle>(nodes.map((n) => [n.id, n]));
  const routes = new Map<string, EdgeRoute>();
  for (const e of edges) {
    const from = byNode.get(e.from);
    const to = byNode.get(e.to);
    if (!from || !to) continue;
    routes.set(
      edgeKey(e.from, e.to),
      routeEdge({
        from,
        fromRadius: from.r,
        to,
        toRadius: to.r,
        key: edgeKey(e.from, e.to),
        toConductor: e.to === conductor,
        obstacles: nodes.filter((n) => n.id !== e.from && n.id !== e.to),
      }),
    );
  }
  return routes;
}

/* ------------------------------------------------------------------- model */

export interface GraphNodeModel {
  readonly framework: Framework;
  readonly group: FrameworkGroupMeta;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  /** The registry name, wrapped for the label block under the node. */
  readonly lines: string[];
  /** The link's accessible name: name + group + depth (S2 accessibility bar). */
  readonly accessibleName: string;
}

export interface GraphEdgeModel {
  readonly key: string;
  readonly from: GraphNodeModel;
  readonly to: GraphNodeModel;
  /** The typed state fields this handoff actually carries. Never empty (registry test). */
  readonly fields: StateField[];
  readonly route: EdgeRoute;
}

export interface GraphModel {
  readonly nodes: GraphNodeModel[];
  readonly edges: GraphEdgeModel[];
  /** Nodes in reading order (left to right, then down) — the tab and arrow-key order. */
  readonly order: GraphNodeModel[];
  readonly byId: Map<FrameworkId, GraphNodeModel>;
  readonly byKey: Map<string, GraphEdgeModel>;
  readonly groups: { group: FrameworkGroupMeta; placement: GroupLabelPlacement | undefined }[];
}

const UNGROUPED: FrameworkGroupMeta = { id: 'map', label: 'Unfiled', blurb: '' };

let cachedModel: GraphModel | null = null;

/**
 * The graph, assembled from the registry and nothing else.
 *
 * 04-phases S2 — *"the graph renders from registry alone (delete a record, node
 * vanishes)"*. Every node here is a `FRAMEWORKS` entry and every edge is an `allEdges()`
 * entry; the layout module contributes coordinates, never membership. Memoised because
 * the clearance search costs a few tens of milliseconds and the answer never changes
 * within a process.
 */
export function frameworkGraphModel(): GraphModel {
  if (cachedModel) return cachedModel;

  const nodes: GraphNodeModel[] = FRAMEWORKS.map((framework, index) => {
    const pos = nodePosition(framework.id, index);
    const group = GROUPS.find((g) => g.id === framework.group) ?? UNGROUPED;
    return {
      framework,
      group,
      x: pos.x,
      y: pos.y,
      r: nodeRadius(framework.depth, framework.id),
      lines: wrapLabel(framework.name),
      accessibleName: `${framework.name}, ${group.label} group, ${
        framework.depth === 'full' ? 'full lesson' : 'chapter'
      }`,
    };
  });

  const byId = new Map(nodes.map((n) => [n.framework.id, n]));
  const routes = routeAll(
    allEdges(),
    nodes.map((n) => ({ id: n.framework.id, x: n.x, y: n.y, r: n.r })),
  );

  const edges: GraphEdgeModel[] = [];
  for (const e of allEdges()) {
    const from = byId.get(e.from);
    const to = byId.get(e.to);
    const route = routes.get(edgeKey(e.from, e.to));
    if (!from || !to || !route) continue;
    edges.push({ key: route.key, from, to, fields: e.fields, route });
  }

  const order = [...nodes].sort((a, b) => a.x - b.x || a.y - b.y);
  const groups = GROUPS.filter((g) => nodes.some((n) => n.framework.group === g.id)).map(
    (group) => ({ group, placement: GROUP_LABELS.find((p) => p.group === group.id) }),
  );

  cachedModel = {
    nodes,
    edges,
    order,
    byId,
    byKey: new Map(edges.map((e) => [e.key, e])),
    groups,
  };
  return cachedModel;
}

/** The shared fields of one handoff, as human labels. Used by every surface. */
export function fieldLabels(fields: readonly StateField[]): string[] {
  return fields.map((f) => stateField(f).label);
}

/* -------------------------------------------------------------------- type */

/**
 * Two-line node labels, wrapped from the registry name — the graph never carries a
 * hand-written display string, or deleting a record would leave a caption behind.
 */
export function wrapLabel(name: string, maxChars = 18): string[] {
  const words = name.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}
