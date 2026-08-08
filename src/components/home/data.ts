/**
 * The homepage's authored data — S4.
 *
 * **This module is a server module and must stay one.** Everything the five acts render
 * is derived here, from the registry and from Beacon Mechanical's evidence pack, and
 * handed to the client recipes as plain arrays of strings and numbers. That is S3-A's
 * precedent applied to the front door: the registry (seventeen records, fifty-eight
 * edges) and the company pack (twenty evidence objects, a full profile) never cross into
 * the browser bundle — only the handful of values the diagrams actually draw.
 *
 * Two consequences worth stating, because both are load-bearing for 00-LAW Ruling 7's
 * `LCP < 2.0s`:
 *
 * 1. No act component may import `@/registry` or `@/content/companies` from a file
 *    carrying `'use client'`. If a diagram needs a fact, it arrives as a prop.
 * 2. The lookups below (`sharedFields`, `operating`, `capacity`) **throw** rather than
 *    fall back. A homepage that silently renders an invented number would break Ruling 4
 *    on the one page every visitor sees.
 */

import {
  BEACON_DERIVED as D,
  BEACON_FIGURES as F,
  beaconProfile,
  beaconStory,
} from '@/content/companies/beacon-mechanical';
import type { Claim, Metric } from '@/lib/claim';
import { round } from '@/lib/format';
import type { ActDefinition } from '@/motion/acts';
import type { BmcBlock } from '@/motion/fw-bmc-assemble';
import type { RaciNode } from '@/motion/fw-raci-route';
import type { TocIntervention, TocStage } from '@/motion/fw-toc-flow';
import { GROUPS, byId, edgesFor, type FrameworkId } from '@/registry';

export const COMPANY = beaconProfile.name;

/**
 * The honesty affordance the homepage cannot do without (Ruling 4). The Strategy Run
 * wears `SIMULATION`; the homepage wears this, pinned beside the canvas, because the
 * canvas is the first thing a visitor will mistake for a real diagnosis.
 */
export const FICTION_CHIP = `${COMPANY} — a fictional company, every number authored`;

export const FOOTER_LINE =
  'THE STRATEGY STACK · POWERED BY INSTINCT · BUSINESS FRAMEWORKS, FINALLY RUNNING.';

/* --------------------------------------------------------------- the acts */

/**
 * The five acts of 03-content-spec, in order. The titles print in the margin rail
 * (`ActMarker`), so they are set as the chapter names a reader would skim, not as
 * sentences.
 */
export const ACTS: ActDefinition[] = [
  { id: 'board', title: 'the board state' },
  { id: 'instruments', title: 'the instruments' },
  { id: 'conductor', title: 'the conductor' },
  { id: 'delegation', title: 'the delegation' },
  { id: 'bridge', title: 'the bridge' },
];

/* ------------------------------------------------------- pack accessors */

function operating(label: string): Metric {
  const found = beaconProfile.operating.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's operating measures have no "${label}"`);
  return found;
}

function headlineClaim(prefix: string): Claim {
  const found = beaconProfile.headline.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's profile has no headline claim starting "${prefix}"`);
  return found;
}

function misreading(prefix: string): Claim {
  const found = beaconStory.constraint.misreadings.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's story has no misreading starting "${prefix}"`);
  return found;
}

/* ----------------------------------------------------- the hero case file */

/**
 * The three readings that state the case before a single framework runs: the crews are
 * full, the queue is long, and the wait has trebled. They are the *symptom*; ACTs I–III
 * are the diagnosis. Each one is a `Metric`, so each one arrives on the page carrying the
 * evidence object it came from — the honesty engine, above the fold.
 */
export const HERO_METRICS: Metric[] = [
  operating('Installation utilisation'),
  operating('Signed projects awaiting a crew'),
  operating('Median wait, signature to start'),
];

/**
 * Shorter labels for the case-file rows. The pack's own labels are written for a report;
 * an instrument readout wants three words, so each row stays on one line and the column
 * reads as a gauge cluster rather than as prose.
 */
export const HERO_METRIC_LABELS: Readonly<Record<string, string>> = {
  'Installation utilisation': 'crews booked',
  'Signed projects awaiting a crew': 'signed, waiting',
  'Median wait, signature to start': 'wait to start',
};

export const HERO_SECTOR = beaconProfile.sector;

/* ------------------------------------------- ACT I · fw/bmc-assemble */

/**
 * Nine blocks, two claims each — the homepage canvas is a *portrait*, not the working
 * canvas of `/frameworks/bmc`, so it carries the fewest items that still let the
 * contradiction land. Strengths are the recipe's three grades; the one `contradiction`
 * is the block the revenue line leans on, which is the whole point of the act.
 */
export const BMC_BLOCKS: BmcBlock[] = [
  {
    id: 'cs',
    label: 'customer segments',
    items: [
      {
        text: `Property management · ${round(D.segmentPropertyShare, 0)}% of revenue`,
        strength: 'confirmed',
      },
      {
        text: `Industrial and logistics · ${round(D.segmentIndustrialShare, 0)}%`,
        strength: 'confirmed',
      },
    ],
  },
  {
    id: 'vp',
    label: 'value proposition',
    items: [
      { text: 'One contractor for the plant and the contract', strength: 'confirmed' },
      { text: 'A start date the crews can hold', strength: 'weak' },
    ],
  },
  {
    id: 'ch',
    label: 'channels',
    items: [
      { text: 'Direct to facilities and property managers', strength: 'confirmed' },
      { text: 'Referral from mechanical contractors', strength: 'weak' },
    ],
  },
  {
    id: 'cr',
    label: 'customer relationships',
    items: [
      { text: 'Annual agreements, auto-renewing', strength: 'confirmed' },
      { text: 'One project manager across three crews', strength: 'weak' },
    ],
  },
  {
    id: 'rev',
    label: 'revenue streams',
    items: [
      { text: 'Installation projects — the line that grew', strength: 'confirmed' },
      { text: 'Service contracts — funds the field organisation', strength: 'confirmed' },
    ],
  },
  {
    id: 'kr',
    label: 'key resources',
    items: [
      {
        text: `${F.installTechs} installation technicians · ${D.installUtilization}% booked`,
        strength: 'contradiction',
      },
      {
        text: `${F.serviceTechs} service technicians · ${D.serviceUtilization}% booked`,
        strength: 'confirmed',
      },
    ],
  },
  {
    id: 'ka',
    label: 'key activities',
    items: [
      { text: 'Retrofit and replacement delivery', strength: 'confirmed' },
      { text: 'Change-order approval — one desk', strength: 'weak' },
    ],
  },
  {
    id: 'kp',
    label: 'key partners',
    items: [
      {
        text: `Primary distributor · ${F.distributorShareOfSpend}% of equipment spend`,
        strength: 'confirmed',
      },
      { text: 'Independent sheet-metal shop', strength: 'weak' },
    ],
  },
  {
    id: 'cost',
    label: 'cost structure',
    items: [
      { text: 'Field labour, dominant', strength: 'confirmed' },
      { text: 'Overtime, now scheduled rather than exceptional', strength: 'confirmed' },
    ],
  },
];

/** What the canvas above was assembled from — the landing evidence chips. */
export const BOARD_SOURCES = ['ev_101', 'ev_102', 'ev_103', 'ev_104', 'ev_107'];

/** The two sourced sentences under the canvas. Both come out of the pack verbatim. */
export const BOARD_CLAIMS: Claim[] = [
  headlineClaim('Revenue grew'),
  headlineClaim('The business is selling faster'),
];

/* --------------------------------------------- ACT II · the instruments */

export interface InstrumentNode {
  readonly id: string;
  readonly label: string;
  /** The group this framework belongs to — printed under the node, mono. */
  readonly caption: string;
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

export interface InstrumentEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly from: string;
  readonly to: string;
  /** Authored path. Routed through the gutters, never node to node. */
  readonly d: string;
  /** The state fields that actually travel, straight off the registry. */
  readonly fields: readonly string[];
}

/**
 * The homepage graph is an **authored crop** of the `/frameworks` composition, not the
 * interactive canvas.
 *
 * `FrameworkGraph` renders seventeen nodes and fifty-eight edges and hydrates all of
 * them; on a page whose budget is `LCP < 2.0s` that is the wrong instrument. What ACT II
 * has to teach is one sentence — *frameworks pass typed state* — and that sentence needs
 * seven nodes, not seventeen. So the layout below is hand-placed in the same idiom as
 * `components/graph-layout` (two bands and a spine, the conductor's convergence bundled)
 * and drawn with the same `GraphNode` / `GraphEdge` primitives, so it *reads* as a crop
 * of the real map — which it is, node for node, edge for edge.
 *
 * The seven are the flagship run's sequence (`find-what-matters-now`), which is also the
 * spine of the story the visitor is scrolling.
 */
const PLACEMENTS: readonly {
  id: FrameworkId;
  x: number;
  y: number;
  r: number;
  /**
   * Display name, where the registry's is too wide for the space under the node. Only
   * the canvas needs one: "Business Model Canvas" is a hundred and twenty user units of
   * label under a fifty-six unit node, and the two edges leaving it have to cross it.
   */
  label?: string;
}[] = [
  { id: 'bmc', x: 108, y: 190, r: 28, label: 'Canvas' },
  { id: 'five-forces', x: 272, y: 82, r: 24 },
  { id: 'vrio', x: 272, y: 298, r: 24 },
  { id: 'swot', x: 446, y: 190, r: 24 },
  { id: 'tows', x: 612, y: 102, r: 22 },
  { id: 'theory-of-constraints', x: 792, y: 220, r: 31 },
  { id: 'raci', x: 938, y: 106, r: 24 },
];

/**
 * A wide, shallow band rather than a square canvas: a pinned act is exactly one viewport,
 * and the composition has to leave room above it for the sentence it is illustrating.
 */
export const INSTRUMENT_VIEWBOX = { width: 1020, height: 380 } as const;

export const INSTRUMENT_NODES: readonly InstrumentNode[] = PLACEMENTS.map((p) => {
  const framework = byId(p.id);
  const group = GROUPS.find((g) => g.id === framework.group);
  if (!group) throw new Error(`${framework.id}: unknown group "${framework.group}"`);
  return {
    id: framework.id,
    label: p.label ?? framework.name,
    caption: group.label,
    x: p.x,
    y: p.y,
    r: p.r,
  };
});

/**
 * The fields on an edge are never authored here — they are the intersection of what the
 * source writes and what the target reads, which is exactly what `edgesFor` computes and
 * what `validateRegistry` refuses to let be empty. If someone rewires the registry so one
 * of these pairs is no longer an edge, the homepage fails to build.
 */
function sharedFields(from: FrameworkId, to: FrameworkId): string[] {
  const edge = edgesFor(from).out.find((e) => e.to === to);
  if (!edge) throw new Error(`${from} → ${to} is not an edge in the registry`);
  return edge.fields;
}

/**
 * The handoffs, in the order the flagship run walks them. Paths are authored so that
 * every wire runs in the *gutters* between nodes — the same rule `fw/bmc-assemble` follows
 * for its connector overlay. A line that crosses a node to reach the next one reads as a
 * mistake, and this composition is supposed to look wired, not scribbled on.
 */
const HANDOFFS: readonly { from: FrameworkId; to: FrameworkId; d: string }[] = [
  { from: 'bmc', to: 'five-forces', d: 'M 130 172 C 175 136, 215 104, 249 94' },
  { from: 'bmc', to: 'vrio', d: 'M 130 208 C 175 244, 215 272, 249 286' },
  { from: 'five-forces', to: 'swot', d: 'M 294 94 C 340 122, 385 156, 423 178' },
  { from: 'vrio', to: 'swot', d: 'M 294 286 C 340 258, 385 224, 423 202' },
  { from: 'five-forces', to: 'tows', d: 'M 296 78 C 380 46, 500 42, 590 90' },
  { from: 'swot', to: 'tows', d: 'M 468 176 C 510 152, 555 122, 590 108' },
  { from: 'tows', to: 'theory-of-constraints', d: 'M 632 116 C 680 142, 730 180, 764 202' },
  { from: 'theory-of-constraints', to: 'raci', d: 'M 820 204 C 860 170, 895 138, 915 122' },
];

export const INSTRUMENT_EDGES: readonly InstrumentEdge[] = HANDOFFS.map((h) => ({
  id: `${h.from}--${h.to}`,
  fromId: h.from,
  toId: h.to,
  from: byId(h.from).name,
  to: byId(h.to).name,
  d: h.d,
  fields: sharedFields(h.from, h.to),
}));

/**
 * The return edge. RACI writes work assignments that the conductor reads again — the
 * loop ACT V draws, visible here as a shape. Drawn ghosted and never lit: it is context
 * for the handoffs, not one of them.
 */
export const INSTRUMENT_RETURN: InstrumentEdge = {
  id: 'raci--theory-of-constraints',
  fromId: 'raci',
  toId: 'theory-of-constraints',
  from: byId('raci').name,
  to: byId('theory-of-constraints').name,
  d: 'M 958 128 C 990 190, 900 256, 820 238',
  fields: sharedFields('raci', 'theory-of-constraints'),
};

/* ------------------------------------------------ ACT III · fw/toc-flow */

/**
 * The capacity model, matched to `/frameworks/theory-of-constraints` so the site tells one
 * story about one company. The installation figure is arithmetic on the pack — projects
 * completed divided by crew utilisation — and it is the only capacity that has to be right
 * for the amber to land where it lands.
 */
const INSTALL_CAPACITY = Math.round(F.projectsCompletedTtm / (D.installUtilization / 100));

export const TOC_STAGES: TocStage[] = [
  { id: 'estimating', label: 'estimating', capacity: F.proposalsWonTtm },
  { id: 'approvals', label: 'approvals', capacity: 58 },
  { id: 'installation', label: 'installation', capacity: INSTALL_CAPACITY },
  { id: 'commissioning', label: 'commissioning', capacity: 56 },
  { id: 'invoicing', label: 'invoicing', capacity: 66 },
];

export const TOC_INTERVENTIONS: TocIntervention[] = [
  { id: 'iv-estimator', label: 'add a second estimator', stageId: 'estimating', delta: 18 },
  { id: 'iv-approvals', label: 'delegate change-order approval', stageId: 'approvals', delta: 9 },
  { id: 'iv-crew', label: 'stand up a fourth crew', stageId: 'installation', delta: 16 },
  { id: 'iv-invoice', label: 'automate invoicing', stageId: 'invoicing', delta: 20 },
];

export const TOC_DEMAND = F.proposalsWonTtm;
export const TOC_UNIT = 'projects / yr';

/** The stage the model computes as narrowest — used to name the constraint in copy. */
export const CONSTRAINED_STAGE =
  TOC_STAGES.reduce((min, s) => (s.capacity < min.capacity ? s : min), TOC_STAGES[0]!).label;

/**
 * One claim, not three. A pinned act is one viewport, and the pipe below needs most of
 * it — so the act carries the diagnosis itself (the sentence the whole page is walking
 * toward) and leaves the rejected candidates to `/frameworks/theory-of-constraints`,
 * where there is room to eliminate them one at a time.
 */
export const CONDUCTOR_CLAIMS: Claim[] = [beaconStory.constraint.diagnosis];

/* --------------------------------------------- ACT IV · fw/raci-route */

export const RACI_NODES: RaciNode[] = [
  { id: 'intake', label: 'change-order intake', kind: 'agent', raci: 'R' },
  { id: 'estimator', label: 'estimator', kind: 'human', raci: 'C' },
  { id: 'pm', label: 'installation project manager', kind: 'human', raci: 'A' },
  { id: 'dispatch', label: 'dispatch rebooking', kind: 'agent', raci: 'R' },
  { id: 'account', label: 'account contact', kind: 'human', raci: 'I' },
];

export const RACI_PACKET = 'change order · rooftop replacement';

export const DELEGATION_CLAIMS: Claim[] = [misreading('Approvals are the problem')];

export const DELEGATION_METRICS: Metric[] = [operating('Signed projects awaiting a crew')];

export const DELEGATION_SOURCES = ['ev_115', 'ev_116'];

/* ------------------------------------------------ ACT V · the loop */

export interface LoopStation {
  readonly id: string;
  readonly label: string;
  /** What happens at this station, one clause. Mono, under the ring. */
  readonly note: string;
}

/**
 * observe → model → diagnose → prioritize → delegate → measure → ↺ (03-content-spec).
 * The notes name what the visitor has just watched, in the order they watched it, so the
 * loop reads as a recap rather than as a new diagram.
 */
export const LOOP_STATIONS: readonly LoopStation[] = [
  { id: 'observe', label: 'observe', note: 'evidence arrives' },
  { id: 'model', label: 'model', note: 'the canvas assembles' },
  { id: 'diagnose', label: 'diagnose', note: 'the instruments read' },
  { id: 'prioritize', label: 'prioritize', note: 'one constraint binds' },
  { id: 'delegate', label: 'delegate', note: 'people and agents' },
  { id: 'measure', label: 'measure', note: 'the state updates' },
];
