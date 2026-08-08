/**
 * `/frameworks/bmc` — the Business Model Canvas, running on Beacon Mechanical.
 *
 * One of the two reference configs. Everything a framework page *varies* lives in a file
 * like this one; everything it *shares* lives in the pattern (`../`). Read `../types.ts`
 * for the contract, then copy this file's section order: showpiece, lesson, explore,
 * unlocked.
 *
 * Two rules this file obeys and every sibling must:
 *
 * 1. **The company is not chosen here.** The primary example binding comes off the registry
 *    record; the figures come out of that company's authored pack. If a figure is not in the
 *    pack it does not go on the page, and the accessors below throw at build rather than
 *    fall back to a literal (00-LAW Ruling 4).
 * 2. **The interaction island is dumb.** It receives pre-rendered claim nodes and decides
 *    what is visible; it never holds a number of its own. That is what keeps the evidence
 *    on the server and keeps the honesty rule mechanically checkable by the walk.
 */

import { LensSwitch, MONO_LABEL } from '@/components';
import {
  BEACON_DERIVED as D,
  BEACON_FIGURES as F,
  beaconMechanical,
  beaconProfile,
} from '@/content/companies/beacon-mechanical';
import BmcLesson from '@/content/frameworks/bmc/lesson.mdx';
import type { Metric } from '@/lib/claim';
import { BmcAssemble, type BmcBlock } from '@/motion/fw-bmc-assemble';
import { byId, edgesFor, stateField } from '@/registry';
import { ClaimLine, EvidenceChips, MetricLine } from '../Claims';
import {
  BmcStaleExplorer,
  type StaleDownstream,
  type StaleToggle,
} from '../interactions/BmcStaleExplorer';
import type { FrameworkPageConfig } from '../types';

const company = beaconMechanical;
const framework = byId('bmc');

/* --------------------------------------------------- figures, from the pack */

function segmentShare(name: string): Metric {
  const found = beaconProfile.segments.items.find((s) => s.name === name);
  if (!found) throw new Error(`Beacon's profile has no segment "${name}"`);
  return found.shareOfRevenue;
}

function revenueLine(label: string): Metric {
  const found = beaconProfile.revenueMix.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's revenue mix has no line "${label}"`);
  return found;
}

function operating(label: string): Metric {
  const found = beaconProfile.operating.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's operating measures have no "${label}"`);
  return found;
}

const round = (n: number) => Math.round(n);

/* ------------------------------------------------------------- the showpiece */

/**
 * Block order is the canvas'; the recipe owns the fill order. Strengths are the recipe's
 * three grades: `confirmed` where the pack has a system export behind the claim, `weak`
 * where it is real but thinly evidenced, and `contradiction` for the one item that cannot
 * be comfortable at the same time as the block it feeds.
 */
const BLOCKS: BmcBlock[] = [
  {
    id: 'cs',
    label: 'customer segments',
    items: [
      { text: `Property management · ${round(D.segmentPropertyShare)}% of revenue`, strength: 'confirmed' },
      { text: `Industrial and logistics · ${round(D.segmentIndustrialShare)}%`, strength: 'confirmed' },
      { text: `Public sector and schools · ${round(D.segmentPublicShare)}%`, strength: 'confirmed' },
      { text: `Grocery and hospitality · ${round(D.segmentHospitalityShare)}%`, strength: 'weak' },
    ],
  },
  {
    id: 'vp',
    label: 'value proposition',
    items: [
      { text: 'One contractor for the plant and the contract', strength: 'confirmed' },
      { text: 'Retrofits finished without a second visit', strength: 'confirmed' },
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
      { text: 'Emergency and time-and-materials', strength: 'confirmed' },
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
      { text: 'One estimator, fifteen years of local pricing', strength: 'confirmed' },
    ],
  },
  {
    id: 'ka',
    label: 'key activities',
    items: [
      { text: 'Retrofit and replacement delivery', strength: 'confirmed' },
      { text: 'Planned maintenance visits', strength: 'confirmed' },
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

const SHOWPIECE_SOURCES = ['ev_101', 'ev_103', 'ev_104', 'ev_107', 'ev_109', 'ev_112'];

/* ------------------------------------------------------------ the interaction */

const CANVAS_BLOCKS = [
  { id: 'cs', label: 'customer segments', field: stateField('customer_segments').label },
  { id: 'vp', label: 'value propositions', field: stateField('value_propositions').label },
  { id: 'ch', label: 'channels', field: stateField('channels').label },
  { id: 'cr', label: 'customer relationships', field: stateField('customer_relationships').label },
  { id: 'rev', label: 'revenue streams', field: stateField('revenue_streams').label },
  { id: 'kr', label: 'key resources', field: stateField('key_resources').label },
  { id: 'ka', label: 'key activities', field: stateField('key_activities').label },
  { id: 'kp', label: 'key partners', field: stateField('key_partners').label },
  { id: 'cost', label: 'cost structure', field: stateField('cost_structure').label },
];

/**
 * The dependency map is authored, and it is itself a claim: it says a segment cannot change
 * without the promise, the route to market, the relationship and the money changing with it.
 * The registry has no opinion about that. What the registry *does* know is which frameworks
 * read the fields those blocks populate — which is where the change goes next, and that half
 * is derived.
 */
const SEGMENT_INVALIDATES = ['cs', 'vp', 'ch', 'cr', 'rev'];
const SEGMENT_FIELDS = [
  stateField('customer_segments').label,
  stateField('value_propositions').label,
  stateField('channels').label,
  stateField('customer_relationships').label,
  stateField('revenue_streams').label,
];

const VP_INVALIDATES = ['vp', 'cr', 'ch', 'ka', 'kr', 'rev'];
const VP_FIELDS = [
  stateField('value_propositions').label,
  stateField('customer_relationships').label,
  stateField('channels').label,
  stateField('key_activities').label,
  stateField('key_resources').label,
  stateField('revenue_streams').label,
];

const segmentToggle = (id: string, name: string, label: string): StaleToggle => ({
  id,
  label,
  group: 'customer segments',
  note: (
    <MetricLine
      metric={segmentShare(name)}
      company={company}
      label={`${label} · share of revenue`}
    />
  ),
  invalidates: SEGMENT_INVALIDATES,
  fields: SEGMENT_FIELDS,
});

const TOGGLES: StaleToggle[] = [
  segmentToggle('seg-property', 'Multi-tenant property management', 'Property management'),
  segmentToggle('seg-industrial', 'Industrial and logistics facilities', 'Industrial and logistics'),
  segmentToggle('seg-public', 'Public sector and schools', 'Public sector and schools'),
  segmentToggle('seg-hospitality', 'Grocery and hospitality', 'Grocery and hospitality'),
  {
    id: 'vp-start-date',
    label: 'Drop the promise of a start date the crews can hold',
    group: 'value propositions',
    note: (
      <MetricLine
        metric={operating('Median wait, signature to start')}
        company={company}
        label="median wait, signature to crew start"
        note="the promise, measured"
      />
    ),
    invalidates: VP_INVALIDATES,
    fields: VP_FIELDS,
  },
  {
    id: 'vp-single-contractor',
    label: 'Sell installation on its own, without the maintenance contract',
    group: 'value propositions',
    note: (
      <MetricLine
        metric={revenueLine('Service contracts')}
        company={company}
        label="service contracts"
        note="the line that funds the field organisation between projects"
      />
    ),
    invalidates: VP_INVALIDATES,
    fields: VP_FIELDS,
  },
];

/** Straight off the graph: who reads what this canvas writes. */
const DOWNSTREAM: StaleDownstream[] = edgesFor(framework.id).out.map((edge) => {
  const target = byId(edge.to);
  return {
    id: target.id,
    name: target.name,
    question: target.coreQuestion,
    reads: edge.fields.map((f) => stateField(f).label),
  };
});

/* ---------------------------------------------------------------- the compare */

const COMPARE = (
  <LensSwitch
    label="Two blocks, one business"
    lenses={[
      {
        id: 'sold',
        label: 'As sold',
        caption: 'revenue streams · what the model promises',
        content: (
          <div className="grid gap-2">
            <MetricLine
              metric={revenueLine('Installation projects')}
              company={company}
              label="installation revenue"
            />
            <MetricLine metric={operating('Proposal win rate')} company={company} label="proposal win rate" />
            <MetricLine
              metric={operating('Signed projects awaiting a crew')}
              company={company}
              label="signed and waiting"
            />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Read from the earning side, this is a company having its best year: it sells
              more, it converts better, and the order book has never been fuller.
            </p>
          </div>
        ),
      },
      {
        id: 'delivered',
        label: 'As delivered',
        caption: 'key resources · what the model can carry',
        content: (
          <div className="grid gap-2">
            <MetricLine
              metric={operating('Installation utilisation')}
              company={company}
              label="installation crews"
            />
            <MetricLine metric={operating('Service utilisation')} company={company} label="service technicians" />
            <MetricLine
              metric={operating('Projects sold, not completed')}
              company={company}
              label="sold and not completed"
            />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Read from the resource side, the same year is a company selling work it has no
              hours to install. Neither reading is wrong. The canvas is where they meet.
            </p>
          </div>
        ),
      },
    ]}
  />
);

/* ----------------------------------------------------------------- the config */

export const bmcPageConfig: FrameworkPageConfig = {
  id: 'bmc',
  showpiece: {
    recipe: 'fw/bmc-assemble',
    actTitle: 'the map',
    headline: (
      <>
        The canvas fills in the order you actually <em className="italic">reason</em>.
      </>
    ),
    note: 'Nine blocks assembled from payroll, dispatch and contract data. Watch key resources: the block the revenue line leans on is the block with no room left in it.',
    pin: 2.2,
    diagram: <BmcAssemble blocks={BLOCKS} company={company.name} />,
    evidenceRefs: SHOWPIECE_SOURCES,
    caption: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          assembled from
        </span>
        <EvidenceChips company={company} refs={SHOWPIECE_SOURCES} />
      </div>
    ),
  },
  lesson: {
    Body: BmcLesson,
    path: 'src/content/frameworks/bmc/lesson.mdx',
  },
  explore: {
    title: (
      <>
        Change one input. Watch how far the change <em className="italic">travels</em>.
      </>
    ),
    lede: 'The canvas is not the deliverable — it is the top of a dependency chain. Turn an input off and the blocks that leaned on it flag stale, and so do the frameworks downstream that were reading them.',
    prediction: {
      kicker: 'predict before you look',
      question: "Beacon's canvas holds one internal disagreement. Which two blocks are in it?",
      options: [
        {
          id: 'kr-rev',
          label: 'Key resources and revenue streams',
          detail: 'what the business has, against what it sells most of',
        },
        {
          id: 'cs-ch',
          label: 'Customer segments and channels',
          detail: 'who it serves, against how it reaches them',
        },
        {
          id: 'cost-rev',
          label: 'Cost structure and revenue streams',
          detail: 'what it spends, against what it earns',
        },
        {
          id: 'vp-cr',
          label: 'Value propositions and customer relationships',
          detail: 'what it promises, against how it stays close',
        },
      ],
      correctId: 'kr-rev',
      reveal: (
        <div className="grid gap-3">
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            The revenue block grew on the back of installation work. The resource block that
            delivers installation work is the one thing this business cannot add quickly.
            Both statements are sourced, and they cannot both be comfortable.
          </p>
          {beaconProfile.headline.slice(0, 2).map((claim) => (
            <ClaimLine key={claim.text} claim={claim} company={company} />
          ))}
        </div>
      ),
    },
    interaction: (
      <BmcStaleExplorer blocks={CANVAS_BLOCKS} toggles={TOGGLES} downstream={DOWNSTREAM} />
    ),
    compare: COMPARE,
  },
  unlocked: [
    'Nine blocks of typed state, each carrying the evidence behind it and how sure it is.',
    'One contradiction on the record rather than in the room: the model sells most of the thing it has least of.',
    'Enough structure for the instruments downstream — segments and partners for Five Forces, resources and activities for VRIO, the whole shape for the conductor.',
  ],
};

export default bmcPageConfig;
