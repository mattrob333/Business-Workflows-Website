/**
 * `/frameworks/theory-of-constraints` — the conductor, running on Beacon Mechanical.
 *
 * The second reference config, and the page the whole site is arranged around: thirteen of
 * the seventeen frameworks feed this one, and this is where a visitor is supposed to feel
 * why. It follows exactly the same shape as `./bmc.tsx` — showpiece, lesson, explore,
 * unlocked — with two things unique to it.
 *
 * **The capacity model.** `fw/toc-flow` computes the constraint from capacity, so the
 * capacities have to be honest before the amber can be. One of them is derived arithmetic
 * on the pack (projects completed ÷ crew utilisation); the rest are modelled, labelled
 * `assumption`, and printed with the basis and the evidence that bounds them. The line
 * under the table says the quiet part: only the narrow number has to be right.
 *
 * **The amber.** This page is the site's one authored constraint surface. Amber arrives in
 * exactly three places, all of them the same fact: the stage the recipe computes as
 * narrowest, the badge that names it, and the verdict panel that closes the elimination
 * (`../ConstraintVerdict`). It appears nowhere else on this page and nowhere at all on the
 * other five (00-LAW Ruling 2, team rule 3).
 */

import { LensSwitch, MONO_LABEL } from '@/components';
import {
  BEACON_DERIVED as D,
  BEACON_FIGURES as F,
  beaconMechanical,
  beaconProfile,
  beaconStory,
} from '@/content/companies/beacon-mechanical';
import TocLesson from '@/content/frameworks/theory-of-constraints/lesson.mdx';
import type { Claim, Metric } from '@/lib/claim';
import { TocFlow, type TocIntervention, type TocStage } from '@/motion/fw-toc-flow';
import { ClaimLine, EvidenceChips, MetricLine } from '../Claims';
import { ConstraintVerdict } from '../ConstraintVerdict';
import {
  ConstraintNarrowing,
  type NarrowingCandidate,
} from '../interactions/ConstraintNarrowing';
import type { FrameworkPageConfig } from '../types';

const company = beaconMechanical;

/* --------------------------------------------------- claims, from the pack */

/** Matched on their opening words rather than by index: reordering the pack must not lie. */
function misreading(prefix: string): Claim {
  const found = beaconStory.constraint.misreadings.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's story has no misreading starting "${prefix}"`);
  return found;
}

function beat(prefix: string): Claim {
  const found = beaconStory.constraint.beats.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's story has no constraint beat starting "${prefix}"`);
  return found;
}

function operating(label: string): Metric {
  const found = beaconProfile.operating.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's operating measures have no "${label}"`);
  return found;
}

function capability(name: string) {
  const found = beaconProfile.capabilities.items.find((c) => c.name === name);
  if (!found) throw new Error(`Beacon's profile has no capability "${name}"`);
  return found;
}

/* -------------------------------------------------------- the capacity model */

const UNIT = 'projects / yr';

/**
 * The one derived capacity: forty-seven projects completed at ninety-three per cent crew
 * utilisation is what the stage can carry at full utilisation. Arithmetic on the pack, not
 * a number anybody chose.
 */
const INSTALL_CAPACITY = Math.round(F.projectsCompletedTtm / (D.installUtilization / 100));

const STAGES: TocStage[] = [
  { id: 'estimating', label: 'estimating', capacity: F.proposalsWonTtm },
  { id: 'approvals', label: 'approvals', capacity: 58 },
  { id: 'installation', label: 'installation', capacity: INSTALL_CAPACITY },
  { id: 'commissioning', label: 'commissioning', capacity: 56 },
  { id: 'invoicing', label: 'invoicing', capacity: 66 },
];

const INTERVENTIONS: TocIntervention[] = [
  { id: 'iv-estimator', label: 'add a second estimator', stageId: 'estimating', delta: 18 },
  { id: 'iv-approvals', label: 'delegate change-order approval', stageId: 'approvals', delta: 9 },
  { id: 'iv-crew', label: 'stand up a fourth crew', stageId: 'installation', delta: 16 },
  { id: 'iv-invoice', label: 'automate invoicing', stageId: 'invoicing', delta: 20 },
];

interface StageBasis {
  stage: string;
  capacity: number;
  claim: Claim;
}

const STAGE_BASIS: StageBasis[] = [
  {
    stage: 'estimating',
    capacity: F.proposalsWonTtm,
    claim: {
      text: 'The stage demonstrably passed this many signed projects through in the trailing twelve months, on rising proposal volume and a rising win rate. Treated as a floor, not a ceiling.',
      status: 'supported_inference',
      evidenceRefs: ['ev_110', 'ev_106'],
    },
  },
  {
    stage: 'approvals',
    capacity: 58,
    claim: {
      text: 'Modelled just below the rate of sale: every change order and schedule change routes through one approver at a median of six days, and crews stood down on four projects while one waited. The pack shows the stage delaying work, not how much it could carry.',
      status: 'assumption',
      evidenceRefs: ['ev_116', 'ev_115'],
    },
  },
  {
    stage: 'installation',
    capacity: INSTALL_CAPACITY,
    claim: {
      text: `Derived, not assumed: ${F.projectsCompletedTtm} projects completed at ${D.installUtilization} per cent crew utilisation is about ${INSTALL_CAPACITY} at full utilisation. This is the number the diagnosis rests on.`,
      status: 'supported_inference',
      evidenceRefs: ['ev_102', 'ev_103'],
    },
  },
  {
    stage: 'commissioning',
    capacity: 56,
    claim: {
      text: 'Modelled above installation and below the rate of sale: the stage carries the installation rate plus the rework that comes back to it, and rework is running at two dozen events a year, most of them on compressed schedules.',
      status: 'assumption',
      evidenceRefs: ['ev_114'],
    },
  },
  {
    stage: 'invoicing',
    capacity: 66,
    claim: {
      text: 'Modelled comfortably above demand. Days sales outstanding is a collection measure rather than a throughput one, and billing has never been recorded as the reason a project start slipped.',
      status: 'assumption',
      evidenceRefs: ['ev_120', 'ev_115'],
    },
  },
];

const READING = (
  <div className="grid gap-4">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
        where each capacity comes from
      </span>
      <span className="text-[14px]" style={{ color: 'var(--muted)' }}>
        Five stages, one unit, and a status on every figure.
      </span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {STAGE_BASIS.map((row) => (
        <ClaimLine
          key={row.stage}
          claim={row.claim}
          company={company}
          label={`${row.stage} · capacity ${row.capacity} ${UNIT}`}
        />
      ))}
    </div>
    <p className="max-w-[68ch] text-[15px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
      Only one of those numbers has to be right for the diagnosis to hold: the narrow one.
      Every other stage is modelled as an assumption, and the model would survive being
      wrong about any of them by a wide margin — which is exactly the test a constraint
      claim should have to pass before it earns any colour.
    </p>
  </div>
);

/* ---------------------------------------------------------- the set narrowing */

const CANDIDATES: NarrowingCandidate[] = [
  {
    id: 'demand',
    label: 'Demand — there is not enough work coming in',
    basis: 'The obvious read on flat delivery, and the one that gets salespeople hired.',
    outcome: 'rejected',
    detail: <ClaimLine claim={misreading('Demand is the problem')} company={company} />,
  },
  {
    id: 'concentration',
    label: 'Buyer power — a handful of customers set the terms',
    basis: 'A real risk, and a genuine finding of the terrain frameworks.',
    outcome: 'rejected',
    detail: <ClaimLine claim={misreading('Customer concentration is the problem')} company={company} />,
  },
  {
    id: 'equipment',
    label: "Equipment — the distributor's lead times",
    basis: 'Lead times doubled at the last renewal, and everyone in the trade is talking about them.',
    outcome: 'rejected',
    detail: <ClaimLine claim={misreading('Equipment lead times are the problem')} company={company} />,
  },
  {
    id: 'approvals',
    label: 'Approvals — one desk signs every change',
    basis: 'The best of the wrong answers: a real queue, in front of the real one.',
    outcome: 'rejected',
    detail: <ClaimLine claim={misreading('Approvals are the problem')} company={company} />,
  },
  {
    id: 'capacity',
    label: 'Installation capacity — crew hours',
    basis: 'The least visible candidate, because a stage running flat out looks like a stage doing well.',
    outcome: 'binding',
    detail: (
      <div className="grid gap-3">
        <ClaimLine claim={beat('Installation crews run at')} company={company} />
        <ClaimLine claim={beat('The company signed')} company={company} />
      </div>
    ),
  },
];

const VERDICT = (
  <ConstraintVerdict
    company={company}
    subject="installation"
    headline={beaconStory.constraint.headline}
    diagnosis={beaconStory.constraint.diagnosis}
    caveat={misreading('Hiring alone will resolve it')}
  />
);

/* ---------------------------------------------------------------- the compare */

const CREW = capability('Complex retrofit installation');

const COMPARE = (
  <LensSwitch
    label="Two instruments, one crew"
    lenses={[
      {
        id: 'vrio',
        label: 'VRIO',
        caption: 'what is durable here?',
        content: (
          <div className="grid gap-2">
            <ClaimLine claim={CREW.assessment} company={company} label="the advantage lens" />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Valuable, rare, hard to imitate. On the advantage stack this crew is the one
              capability worth defending — the thing customers are actually buying.
            </p>
          </div>
        ),
      },
      {
        id: 'toc',
        label: 'Theory of Constraints',
        caption: 'what limits the whole system?',
        content: (
          <div className="grid gap-2">
            <MetricLine metric={operating('Installation utilisation')} company={company} label="the same crew" />
            <MetricLine
              metric={operating('Median wait, signature to start')}
              company={company}
              label="what the queue behind it costs"
            />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              The same crew is the ceiling on every project the company sells. One lens calls
              it the advantage; the other calls it the limit. Both are reading the same fact,
              and only one of them tells you what to do on Monday.
            </p>
          </div>
        ),
      },
    ]}
  />
);

/* ----------------------------------------------------------------- the config */

export const tocPageConfig: FrameworkPageConfig = {
  id: 'theory-of-constraints',
  showpiece: {
    recipe: 'fw/toc-flow',
    actTitle: 'the constraint',
    headline: (
      <>
        Improve a non-constraint and <em className="italic">nothing</em> happens.
      </>
    ),
    note: 'Beacon as a pipe: five stages, one unit, throughput set by the narrowest. The amber is computed from capacity, never authored — apply an intervention and watch where it moves.',
    pin: 2,
    diagram: <TocFlow stages={STAGES} interventions={INTERVENTIONS} demand={F.projectsSoldTtm} unit={UNIT} />,
    evidenceRefs: ['ev_102', 'ev_103', 'ev_106', 'ev_110', 'ev_114', 'ev_116'],
    caption: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          modelled from
        </span>
        <EvidenceChips
          company={company}
          refs={['ev_102', 'ev_103', 'ev_106', 'ev_110', 'ev_114', 'ev_116']}
        />
      </div>
    ),
    reading: READING,
  },
  lesson: {
    Body: TocLesson,
    path: 'src/content/frameworks/theory-of-constraints/lesson.mdx',
  },
  explore: {
    title: (
      <>
        Five true findings. Only one of them is <em className="italic">binding</em>.
      </>
    ),
    lede: 'Every candidate below is a real statement about this business, and four of them will not move a single project out of the door. Test them one at a time and watch the set narrow.',
    prediction: {
      kicker: 'commit before the evidence',
      question:
        'Beacon finished forty-seven installation projects this year and forty-six last year, on nearly a quarter more revenue. What is holding the rate down?',
      options: [
        { id: 'demand', label: 'Demand', detail: 'not enough work coming in' },
        { id: 'concentration', label: 'Buyer power', detail: 'a handful of customers set the terms' },
        { id: 'equipment', label: 'Equipment lead times', detail: 'the distributor got slower' },
        { id: 'approvals', label: 'Approvals', detail: 'one desk signs every change' },
        { id: 'capacity', label: 'Installation capacity', detail: 'crew hours, and only crew hours' },
      ],
      correctId: 'capacity',
      reveal: (
        <div className="grid gap-3">
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            All five are true statements. The constraint is not the worst problem in the
            business, it is the one that sets the rate — and it hides in the stage that looks
            healthiest, because a stage running flat out looks like a stage doing well.
          </p>
          <ClaimLine claim={beat('Installation crews run at')} company={company} />
        </div>
      ),
    },
    interaction: <ConstraintNarrowing candidates={CANDIDATES} verdict={VERDICT} />,
    compare: COMPARE,
  },
  unlocked: [
    'One constraint on the record, with the four alternatives written down and rejected on evidence rather than in a meeting.',
    'A rate for the whole system, so every proposed improvement can be asked the only question that matters: does this touch the narrow stage?',
    'Exploit, subordinate and elevate actions for delegation — which is the next framework, and the point at which some of this work goes to agents and some stays with people.',
  ],
};

export default tocPageConfig;
