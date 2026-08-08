/**
 * Fixtures for the S0 recipe gallery.
 *
 * Every recipe takes DATA, never hard-coded content — S3 will feed these same props
 * from the registry and the example-company packs (02-architecture). What lives here is
 * therefore a *stand-in*, shaped exactly like the real thing, so that swapping the
 * source is a one-line change on each page.
 *
 * Ruling 4 applies even to a gallery: the company is fictional (Beacon Mechanical, one
 * of the three authored examples), every number traces to an evidence object below, and
 * nothing claims to be more certain than it is.
 */

import type { BmcBlock } from '@/motion/fw-bmc-assemble';
import type { Force } from '@/motion/fw-forces-gauges';
import type { Capability } from '@/motion/fw-vrio-gates';
import type { TocIntervention, TocStage } from '@/motion/fw-toc-flow';
import type { RaciNode } from '@/motion/fw-raci-route';
import type { TowsCard, TowsCrossing } from '@/motion/fw-tows-cross';
import type { EvidenceSource } from '@/components/EvidenceRef';

export const COMPANY = 'Beacon Mechanical';

/* ---------------------------------------------------------------- evidence */

export const EVIDENCE = {
  ev_103: {
    id: 'ev_103',
    source: 'Dispatch log export, Q2',
    date: '2026-04-30',
    kind: 'crm-export',
    excerpt:
      'Median time from booking to first van on site: 6.1 days. 214 of 388 jobs waited on a licensed tech, not on parts.',
    reliability: 'Primary system export — counted, not estimated.',
  },
  ev_118: {
    id: 'ev_118',
    source: 'Interview — Dana Ruiz, service manager',
    date: '2026-05-12',
    kind: 'interview',
    excerpt:
      '“We turn down about two commercial retrofits a month. Not because we cannot sell them — because we cannot staff them.”',
    reliability: 'Single informant; consistent with the dispatch log.',
  },
  ev_141: {
    id: 'ev_141',
    source: 'Maintenance contract renewals, FY25',
    date: '2026-02-08',
    kind: 'invoice',
    excerpt:
      '38 of 41 annual maintenance agreements renewed without a competing quote being requested.',
    reliability: 'Complete population, not a sample.',
  },
  ev_155: {
    id: 'ev_155',
    source: 'Technician certification register',
    date: '2026-03-19',
    kind: 'record',
    excerpt:
      'Four technicians hold the refrigerant-handling certification required for commercial retrofit work. Two are within five years of retirement.',
  },
} satisfies Record<string, EvidenceSource>;

/* -------------------------------------------------------- fw/bmc-assemble */

export const BMC_BLOCKS: BmcBlock[] = [
  {
    id: 'kp',
    label: 'key partners',
    items: [
      { text: 'Two regional equipment distributors', strength: 'confirmed' },
      { text: 'Independent sheet-metal shop', strength: 'weak' },
    ],
  },
  {
    id: 'ka',
    label: 'key activities',
    items: [
      { text: 'Emergency repair dispatch', strength: 'confirmed' },
      { text: 'Planned maintenance visits', strength: 'confirmed' },
      { text: 'Commercial retrofit design', strength: 'weak' },
    ],
  },
  {
    id: 'kr',
    label: 'key resources',
    items: [
      { text: '4 certified retrofit technicians', strength: 'confirmed' },
      { text: '11 service vans', strength: 'confirmed' },
    ],
  },
  {
    id: 'vp',
    label: 'value proposition',
    items: [
      { text: 'Same-week response, every season', strength: 'contradiction' },
      { text: 'One crew that knows your building', strength: 'confirmed' },
      { text: 'Fixed-price maintenance cover', strength: 'confirmed' },
    ],
  },
  {
    id: 'cr',
    label: 'customer relationships',
    items: [
      { text: 'Named account manager', strength: 'weak' },
      { text: 'Annual agreement, auto-renewing', strength: 'confirmed' },
    ],
  },
  {
    id: 'ch',
    label: 'channels',
    items: [
      { text: 'Referral from mechanical contractors', strength: 'confirmed' },
      { text: 'Inbound phone', strength: 'confirmed' },
    ],
  },
  {
    id: 'cs',
    label: 'customer segments',
    items: [
      { text: 'Mid-size commercial property managers', strength: 'confirmed' },
      { text: 'Light-industrial facilities', strength: 'weak' },
    ],
  },
  {
    id: 'cost',
    label: 'cost structure',
    items: [
      { text: 'Certified labour (dominant)', strength: 'confirmed' },
      { text: 'Fleet and fuel', strength: 'confirmed' },
    ],
  },
  {
    id: 'rev',
    label: 'revenue streams',
    items: [
      { text: 'Maintenance agreements — recurring', strength: 'confirmed' },
      { text: 'Emergency call-outs — variable', strength: 'confirmed' },
      { text: 'Retrofit projects — lumpy, high margin', strength: 'weak' },
    ],
  },
];

/** The claim the canvas contradicts, quoted on the page. */
export const BMC_CONTRADICTION =
  '“Same-week response, every season” sits against a dispatch log showing a 6.1-day median. The canvas does not resolve it — it shows it.';

/* ------------------------------------------------------ fw/forces-gauges */

export const FORCES: Force[] = [
  {
    id: 'rivalry',
    label: 'rivalry',
    score: 5.5,
    note: 'Four comparable firms in the metro; none competing on response time.',
  },
  {
    id: 'buyers',
    label: 'buyer power',
    score: 3.0,
    note: 'Renewals rarely go out to quote (ev_141).',
  },
  {
    id: 'suppliers',
    label: 'supplier power',
    score: 4.0,
    note: 'Two distributors, comparable terms.',
  },
  {
    id: 'entrants',
    label: 'new entrants',
    score: 2.5,
    note: 'Certification requirement is a real gate.',
  },
  {
    id: 'substitutes',
    label: 'substitutes',
    score: 6.5,
    note: 'In-house facilities teams at the larger accounts.',
  },
];

/* --------------------------------------------------------- fw/vrio-gates */

export const CAPABILITIES: Capability[] = [
  {
    id: 'cert-crew',
    label: 'certified retrofit crew',
    v: true,
    r: true,
    i: true,
    o: false,
    note: 'Genuinely scarce locally, and slow to copy — but the scheduling system cannot route around it.',
    evidence: EVIDENCE.ev_155,
  },
  {
    id: 'renewals',
    label: 'renewal relationships',
    v: true,
    r: true,
    i: true,
    o: true,
    note: 'Held by the firm rather than by individuals, and actively worked.',
    evidence: EVIDENCE.ev_141,
  },
  {
    id: 'dispatch',
    label: 'dispatch software',
    v: true,
    r: false,
    i: false,
    o: true,
    note: 'Off-the-shelf; every competitor can buy the same licence.',
    evidence: EVIDENCE.ev_103,
  },
  {
    id: 'fleet',
    label: 'van fleet',
    v: true,
    r: false,
    i: false,
    o: true,
    note: 'Necessary, not distinguishing.',
  },
  {
    id: 'brand',
    label: 'local reputation',
    v: true,
    r: true,
    i: false,
    o: true,
    note: 'Real, but reproducible by a competitor with three good years.',
    evidence: EVIDENCE.ev_118,
  },
];

/* --------------------------------------------------------- fw/tows-cross */

export const STRENGTHS: TowsCard[] = [
  { id: 's1', text: 'Certified crew competitors cannot staff' },
  { id: 's2', text: 'Renewals that never go to quote' },
];

export const WEAKNESSES: TowsCard[] = [
  { id: 'w1', text: 'Scheduling cannot protect scarce techs' },
  { id: 'w2', text: 'Retrofit pipeline depends on referrals' },
];

export const OPPORTUNITIES: TowsCard[] = [
  { id: 'o1', text: 'Commercial retrofit demand rising' },
  { id: 'o2', text: 'Accounts asking for planned upgrades' },
];

export const THREATS: TowsCard[] = [
  { id: 't1', text: 'Two certified techs near retirement' },
  { id: 't2', text: 'Large accounts building in-house teams' },
];

export const CROSSINGS: TowsCrossing[] = [
  {
    id: 'so1',
    kind: 'SO',
    internal: 's1',
    external: 'o1',
    option: 'Sell retrofit capacity as a scheduled quarterly slot, not a bid.',
  },
  {
    id: 'st1',
    kind: 'ST',
    internal: 's2',
    external: 't2',
    option: 'Convert renewal accounts to multi-year cover before they staff up.',
  },
  {
    id: 'wo1',
    kind: 'WO',
    internal: 'w1',
    external: 'o2',
    option: 'Reserve certified hours for planned work before dispatch consumes them.',
  },
  {
    id: 'wt1',
    kind: 'WT',
    internal: 'w2',
    external: 't1',
    option: 'Apprentice two techs onto certification this year, or lose the segment.',
  },
];

/* ----------------------------------------------------------- fw/toc-flow */

export const TOC_STAGES: TocStage[] = [
  { id: 'intake', label: 'intake', capacity: 60 },
  { id: 'survey', label: 'site survey', capacity: 48 },
  { id: 'certified', label: 'certified work', capacity: 22 },
  { id: 'commission', label: 'commissioning', capacity: 40 },
  { id: 'invoice', label: 'invoicing', capacity: 70 },
];

export const TOC_INTERVENTIONS: TocIntervention[] = [
  { id: 'iv-intake', label: 'add intake staff', stageId: 'intake', delta: 20 },
  { id: 'iv-survey', label: 'faster surveys', stageId: 'survey', delta: 14 },
  { id: 'iv-cert', label: 'certify two techs', stageId: 'certified', delta: 16 },
  { id: 'iv-invoice', label: 'automate invoicing', stageId: 'invoice', delta: 25 },
];

export const TOC_DEMAND = 52;

/* --------------------------------------------------------- fw/raci-route */

export const RACI_NODES: RaciNode[] = [
  { id: 'intake-agent', label: 'intake agent', kind: 'agent', raci: 'R' },
  { id: 'planner', label: 'planner', kind: 'agent', raci: 'C' },
  { id: 'service-lead', label: 'service lead', kind: 'human', raci: 'A' },
  { id: 'scheduler', label: 'scheduler', kind: 'agent', raci: 'R' },
  { id: 'account', label: 'account manager', kind: 'human', raci: 'I' },
];

/* ------------------------------------------------------------ misc copy */

export const FOOTER_LINE =
  'THE STRATEGY STACK · POWERED BY INSTINCT · BUSINESS FRAMEWORKS, FINALLY RUNNING.';
