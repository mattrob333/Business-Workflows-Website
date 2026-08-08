/**
 * `/frameworks/five-forces` — the terrain instrument, running on Beacon Mechanical.
 *
 * Built to the pattern in `./bmc.tsx`: showpiece, lesson, explore, unlocked, with the
 * company taken off the registry record's primary example binding and every figure pulled
 * through an accessor that throws rather than a literal that lies.
 *
 * Two things are specific to this page.
 *
 * **The scores are assumptions, and the page says so twice.** `fw/forces-gauges` labels its
 * own sliders "assumption sliders"; the reading under the stage then gives each of the five
 * a written basis with a status chip on it, exactly as the conductor page does for its
 * capacities. A force score is the least evidenced number on this site — it is a judgement
 * about a market compressed into one figure — and pretending otherwise would be the single
 * easiest way to break Ruling 4 while appearing to obey it.
 *
 * **No amber.** Beacon has a constraint and this page can see the edge of it: the invariant
 * panel at the bottom of the interaction says out loud that none of the five pressures moves
 * the delivery rate. That is a handoff, not a diagnosis. The constraint belongs to
 * `/frameworks/theory-of-constraints`, and so does the colour (00-LAW Ruling 2).
 */

import { LensSwitch, MONO_LABEL } from '@/components';
import {
  beaconMechanical,
  beaconProfile,
  beaconStory,
} from '@/content/companies/beacon-mechanical';
import FiveForcesLesson from '@/content/frameworks/five-forces/lesson.mdx';
import type { Claim, Metric } from '@/lib/claim';
import { ForcesGauges, type Force } from '@/motion/fw-forces-gauges';
import { ClaimLine, EvidenceChips, MetricLine } from '../Claims';
import {
  ForcePressureFlip,
  type PressureFlip,
  type PressureForce,
} from '../interactions/ForcePressureFlip';
import type { FrameworkPageConfig } from '../types';

const company = beaconMechanical;

/* --------------------------------------------------- figures, from the pack */

function operating(label: string): Metric {
  const found = beaconProfile.operating.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's operating measures have no "${label}"`);
  return found;
}

function revenueLine(label: string): Metric {
  const found = beaconProfile.revenueMix.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's revenue mix has no line "${label}"`);
  return found;
}

function capability(name: string) {
  const found = beaconProfile.capabilities.items.find((c) => c.name === name);
  if (!found) throw new Error(`Beacon's profile has no capability "${name}"`);
  return found;
}

function system(name: string) {
  const found = beaconProfile.systems.items.find((s) => s.name === name);
  if (!found) throw new Error(`Beacon's profile has no system of record "${name}"`);
  return found;
}

function segmentNote(segment: string, prefix: string): Claim {
  const found = beaconProfile.segments.items.find((s) => s.name === segment);
  if (!found) throw new Error(`Beacon's profile has no segment "${segment}"`);
  const note = found.notes.find((n) => n.text.startsWith(prefix));
  if (!note) throw new Error(`Beacon's "${segment}" segment has no note starting "${prefix}"`);
  return note;
}

function misreading(prefix: string): Claim {
  const found = beaconStory.constraint.misreadings.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's story has no misreading starting "${prefix}"`);
  return found;
}

function headline(prefix: string): Claim {
  const found = beaconProfile.headline.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's profile has no headline claim starting "${prefix}"`);
  return found;
}

/* ------------------------------------------------------------- the showpiece */

/**
 * Zero to ten, pressure on the firm. Every one of these is an authored judgement; what makes
 * them honest is the basis table below, not the precision of the figure.
 */
const SCORES = {
  buyers: 7,
  suppliers: 6,
  rivalry: 5,
  substitutes: 3.5,
  entrants: 3,
} as const;

const FORCES: Force[] = [
  {
    id: 'buyers',
    label: 'buyer power',
    score: SCORES.buyers,
    note: 'A handful of accounts carry much of the revenue, and one of them has already moved work over a start date.',
  },
  {
    id: 'suppliers',
    label: 'supplier power',
    score: SCORES.suppliers,
    note: 'One distributor carries most of the equipment spend, and its lead times doubled at the last renewal.',
  },
  {
    id: 'rivalry',
    label: 'rivalry',
    score: SCORES.rivalry,
    note: 'Several regional contractors offer the same service coverage; price is the reason recorded on most lost proposals.',
  },
  {
    id: 'substitutes',
    label: 'substitutes',
    score: SCORES.substitutes,
    note: 'In-house facilities teams, and the option of deferring a replacement another season.',
  },
  {
    id: 'entrants',
    label: 'new entrants',
    score: SCORES.entrants,
    note: 'Crews who can retrofit an occupied building take months to assemble — the same scarcity that limits Beacon protects it.',
  },
];

const SHOWPIECE_SOURCES = ['ev_104', 'ev_107', 'ev_109', 'ev_110', 'ev_117', 'ev_119'];

interface ForceBasis {
  force: string;
  claim: Claim;
}

const FORCE_BASIS: ForceBasis[] = [
  {
    force: 'buyer power · high',
    claim: {
      text: 'The five largest customers hold two-fifths of revenue and three of them sit in one segment. A facilities director at one of those accounts has already given a chiller replacement to somebody else on the strength of the date. That is real leverage over price and over terms.',
      status: 'supported_inference',
      evidenceRefs: ['ev_107', 'ev_119'],
    },
  },
  {
    force: 'supplier power · elevated',
    claim: {
      text: 'The primary distributor supplies more than three-quarters of equipment spend on net-thirty terms, and quoted lead times for packaged rooftop units doubled at the last renewal. Concentration plus a moving lead time is the definition of a supplier with leverage.',
      status: 'supported_inference',
      evidenceRefs: ['ev_109'],
    },
  },
  {
    force: 'rivalry · moderate',
    claim: {
      text: 'Three regional contractors offer comparable service coverage, and price is the reason recorded on the majority of lost proposals. Scored as an assumption: nobody has counted the competing bids, and the loss reasons are recorded inconsistently.',
      status: 'assumption',
      evidenceRefs: ['ev_104', 'ev_111'],
    },
  },
  {
    force: 'substitutes · low',
    claim: {
      text: 'The substitutes for a contractor are an in-house facilities team and another season of running the old plant. Neither shows up in the pack at all, which is why this is the weakest score on the page and is marked as such rather than quietly averaged in.',
      status: 'assumption',
      evidenceRefs: ['ev_111'],
    },
  },
  {
    force: 'new entrants · low',
    claim: {
      text: 'Entry needs crews who can work in occupied buildings, and those take months to hire: three roles are open here, the oldest for most of a year, against an average time to hire of over three months. The barrier that holds the market open is the same one that holds this business back.',
      status: 'supported_inference',
      evidenceRefs: ['ev_117', 'ev_119'],
    },
  },
];

const READING = (
  <div className="grid gap-4">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
        where each score comes from
      </span>
      <span className="text-[14px]" style={{ color: 'var(--muted)' }}>
        Five judgements, each with a status on it.
      </span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {FORCE_BASIS.map((row) => (
        <ClaimLine key={row.force} claim={row.claim} company={company} label={row.force} />
      ))}
    </div>
    <p className="max-w-[68ch] text-[15px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
      Two of the five are supported by system exports; three are judgements the pack can only
      bound. That distribution is normal for this framework and it is the thing most industry
      analyses hide — a force score is an opinion until somebody goes and counts, and the
      useful question is not "is it seven?" but "which of these would have to be wrong for the
      ranking to change?"
    </p>
  </div>
);

/* ------------------------------------------------------------ the interaction */

const PRESSURE_FORCES: PressureForce[] = [
  {
    id: 'buyers',
    label: 'buyer power',
    base: SCORES.buyers,
    basis: 'concentration, and a customer who has already walked over a date',
    evidence: (
      <MetricLine
        metric={operating('Top-five customer concentration')}
        company={company}
        label="largest accounts, share of revenue"
      />
    ),
  },
  {
    id: 'suppliers',
    label: 'supplier power',
    base: SCORES.suppliers,
    basis: 'one distributor, and a lead time that moved',
    evidence: (
      <MetricLine
        metric={operating('Equipment lead time')}
        company={company}
        label="quoted lead time, packaged rooftop units"
        note="double the prior renewal"
      />
    ),
  },
  {
    id: 'rivalry',
    label: 'rivalry',
    base: SCORES.rivalry,
    basis: 'look-alike coverage, and price on the loss reasons',
    evidence: (
      <ClaimLine
        claim={capability('Contracted service coverage').assessment}
        company={company}
        label="the coverage everyone offers"
      />
    ),
  },
  {
    id: 'substitutes',
    label: 'substitutes',
    base: SCORES.substitutes,
    basis: 'in-house teams, and another season on the old plant',
    evidence: (
      <ClaimLine
        claim={system('Estimating log').note}
        company={company}
        label="how far this read can be pushed"
      />
    ),
  },
  {
    id: 'entrants',
    label: 'new entrants',
    base: SCORES.entrants,
    basis: 'crews take months to assemble',
    evidence: (
      <MetricLine
        metric={operating('Average time to hire')}
        company={company}
        label="average time to hire, field roles"
      />
    ),
  },
];

const FLIPS: PressureFlip[] = [
  {
    id: 'lead-times',
    label: "The distributor's lead times return to what they were at the prior renewal",
    deltas: { suppliers: -2.5 },
    implication:
      'Supply pressure eases and the ranking does not change. The equipment story was always shorter than the wait for a crew.',
    note: <ClaimLine claim={misreading('Equipment lead times are the problem')} company={company} />,
  },
  {
    id: 'multi-year',
    label: 'The largest accounts sign multi-year cover instead of renewing annually',
    deltas: { buyers: -3 },
    implication:
      'Buyer power drops below supply and the strongest pressure changes hands. Note what has not changed: not one project moves out of the door any faster.',
    note: (
      <ClaimLine
        claim={segmentNote('Multi-tenant property management', 'Three of the five largest')}
        company={company}
      />
    ),
  },
  {
    id: 'national',
    label: 'A national contractor opens a branch in the region',
    deltas: { rivalry: 2.5, entrants: 1.5 },
    implication:
      'Rivalry becomes the pressure that sets price. It is also the flip with the least evidence under it — a scenario, and the panel should not let it wear the same weight as the other two.',
    note: (
      <MetricLine
        metric={operating('Proposal win rate')}
        company={company}
        label="proposal win rate"
        note="rising, on more proposals — not what a crowding market looks like"
      />
    ),
  },
];

const INVARIANT = (
  <ClaimLine claim={headline('The business is selling faster')} company={company} />
);

/* ---------------------------------------------------------------- the compare */

const COMPARE = (
  <LensSwitch
    label="Two ceilings, one company"
    lenses={[
      {
        id: 'margin',
        label: 'The ceiling on price',
        caption: 'five forces · what the terrain allows',
        content: (
          <div className="grid gap-2">
            <MetricLine
              metric={operating('Top-five customer concentration')}
              company={company}
              label="buyer concentration"
            />
            <MetricLine
              metric={operating('Equipment lead time')}
              company={company}
              label="supplier lead time"
            />
            <MetricLine
              metric={revenueLine('Installation gross margin')}
              company={company}
              label="installation gross margin"
            />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Read from the terrain, this is a company with less pricing room than it thinks:
              concentrated buyers on one side, a concentrated supplier on the other, and a
              margin that has already moved.
            </p>
          </div>
        ),
      },
      {
        id: 'volume',
        label: 'The ceiling on volume',
        caption: 'the same year, read from the dispatch board',
        content: (
          <div className="grid gap-2">
            <MetricLine
              metric={operating('Signed projects awaiting a crew')}
              company={company}
              label="signed and waiting"
            />
            <MetricLine
              metric={operating('Median wait, signature to start')}
              company={company}
              label="median wait, signature to crew start"
            />
            <MetricLine
              metric={operating('Projects sold, not completed')}
              company={company}
              label="sold and not completed"
            />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              None of these numbers appears anywhere in a Five Forces analysis, and none of the
              five forces moves them. Two ceilings, two instruments. Running only the first one
              is how a company spends a year negotiating terms while the work stacks up.
            </p>
          </div>
        ),
      },
    ]}
  />
);

/* ----------------------------------------------------------------- the config */

export const fiveForcesPageConfig: FrameworkPageConfig = {
  id: 'five-forces',
  showpiece: {
    recipe: 'fw/forces-gauges',
    actTitle: 'the terrain',
    headline: (
      <>
        Five pressures arrive. Only one of them sets the <em className="italic">price</em>.
      </>
    ),
    note: 'Beacon at the centre, five wedges pressing inward, length bound to score. The sliders are labelled assumption for a reason — move one and watch whether the ranking survives it.',
    pin: 2.1,
    diagram: <ForcesGauges company={company.name} forces={FORCES} />,
    evidenceRefs: SHOWPIECE_SOURCES,
    caption: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          scored from
        </span>
        <EvidenceChips company={company} refs={SHOWPIECE_SOURCES} />
      </div>
    ),
    reading: READING,
  },
  lesson: {
    Body: FiveForcesLesson,
    path: 'src/content/frameworks/five-forces/lesson.mdx',
  },
  explore: {
    title: (
      <>
        Change the fact, not the <em className="italic">score</em>.
      </>
    ),
    lede: 'A force score is a consequence of something true about the world, so the honest way to move one is to name the thing and turn it around. Each assumption below is a dated statement from the evidence pack, reversed.',
    prediction: {
      kicker: 'commit before the scores',
      question:
        'Beacon sells into a market with concentrated buyers, one dominant distributor and several look-alike competitors. Which force presses hardest on its margin?',
      options: [
        { id: 'buyers', label: 'Buyer power', detail: 'a handful of accounts carry the revenue' },
        { id: 'suppliers', label: 'Supplier power', detail: 'one distributor, lead times moving' },
        { id: 'rivalry', label: 'Rivalry', detail: 'regional contractors offering the same thing' },
        { id: 'substitutes', label: 'Substitutes', detail: 'in-house teams, deferred replacement' },
        { id: 'entrants', label: 'New entrants', detail: 'whoever could arrive next' },
      ],
      correctId: 'buyers',
      reveal: (
        <div className="grid gap-3">
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            Buyer power scores highest, and it is a genuine finding rather than a scary
            adjective — concentration on this scale sets terms, sets price and sets who gets
            told about a competing quote. Then read the second sentence of the claim below,
            which is the sentence this whole site is arranged around: the strongest pressure in
            a market is not automatically the thing limiting the business.
          </p>
          <ClaimLine claim={misreading('Customer concentration is the problem')} company={company} />
        </div>
      ),
    },
    interaction: (
      <ForcePressureFlip forces={PRESSURE_FORCES} flips={FLIPS} invariant={INVARIANT} />
    ),
    compare: COMPARE,
  },
  unlocked: [
    'Five scored forces with a status on each, so next quarter can compare figures instead of re-reading prose.',
    'One primary economic pressure named — buyer power — with the concentration evidence and the customer interview that support it.',
    'A tested ranking: two of the three assumptions reorder the pressures, and none of them changes how much work leaves the building. That last fact is what the conductor is for.',
  ],
};

export default fiveForcesPageConfig;
