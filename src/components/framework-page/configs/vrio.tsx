/**
 * `/frameworks/vrio` — the advantage instrument, running on Beacon Mechanical.
 *
 * Same shape as `./bmc.tsx`. What is particular to this page is the shape of the *answers*:
 * four capabilities enter the gates and they stop in four different places, which is the
 * only arrangement that teaches what the model is for. A page where three of four docked as
 * sustained would be the exact failure the lesson describes — the slide that flatters
 * everything — reproduced by the site that is complaining about it.
 *
 * The verdicts are the pack's, not this file's. Beacon's profile already carries an
 * assessment claim on each of the four capabilities, written before any of these gates
 * existed; the gate walk quotes them rather than inventing kinder ones. Where a gate needs a
 * line the profile does not carry — "rare compared to whom?" is the usual gap — the claim is
 * authored here with its status and its evidence refs, and it resolves against Beacon's pack
 * at build or the page does not ship (00-LAW Ruling 4).
 *
 * No amber. The sustained advantage on this page happens to be the same crews the conductor
 * later names as the narrow stage, and the verdict says so in words — but the colour, and the
 * diagnosis, belong to `/frameworks/theory-of-constraints` alone (Ruling 2).
 */

import { LensSwitch, MONO_LABEL } from '@/components';
import { beaconMechanical, beaconProfile } from '@/content/companies/beacon-mechanical';
import VrioLesson from '@/content/frameworks/vrio/lesson.mdx';
import type { Claim, Metric } from '@/lib/claim';
import { VrioGates, type Capability } from '@/motion/fw-vrio-gates';
import { ClaimLine, EvidenceChips, MetricLine } from '../Claims';
import { evidenceSource } from '../evidence';
import { VrioGateWalk, type GateCandidate } from '../interactions/VrioGateWalk';
import type { FrameworkPageConfig } from '../types';

const company = beaconMechanical;

/* --------------------------------------------------- figures, from the pack */

function capability(name: string) {
  const found = beaconProfile.capabilities.items.find((c) => c.name === name);
  if (!found) throw new Error(`Beacon's profile has no capability "${name}"`);
  return found;
}

function measure(capabilityName: string, label: string): Metric {
  const found = capability(capabilityName).measures.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's "${capabilityName}" has no measure "${label}"`);
  return found;
}

function operating(label: string): Metric {
  const found = beaconProfile.operating.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's operating measures have no "${label}"`);
  return found;
}

function org(role: string): Claim {
  const found = beaconProfile.org.items.find((u) => u.role === role);
  if (!found) throw new Error(`Beacon's profile has no role "${role}"`);
  return found.note;
}

const CREW = 'Complex retrofit installation';
const COVERAGE = 'Contracted service coverage';
const ESTIMATING = 'Estimating and bid conversion';
const APPROVER = 'Single-approver project control';

/* ------------------------------------------------------------- the showpiece */

/**
 * The gate results. `passCount` in the recipe stops at the first `false`, which is why the
 * approver row is scored honestly rather than defensively: it is a well-organised routine
 * around something that does not clear the value gate, and the recipe will never ask about
 * the other three.
 */
const CAPABILITIES: Capability[] = [
  {
    id: 'crews',
    label: 'complex retrofit crews',
    v: true,
    r: true,
    i: true,
    o: true,
    note: 'Three crews who can replace rooftop and chiller plant in an occupied building without shutting the tenant down. Scarce locally, slow to assemble, and sold through a book the business already holds.',
    evidence: evidenceSource(company, 'ev_103'),
  },
  {
    id: 'coverage',
    label: 'contracted service coverage',
    v: true,
    r: false,
    i: false,
    o: true,
    note: 'Valuable and well run — and matched by three regional contractors, which is where it stops.',
    evidence: evidenceSource(company, 'ev_104'),
  },
  {
    id: 'estimating',
    label: 'estimating and bid conversion',
    v: true,
    r: true,
    i: true,
    o: false,
    note: 'Fifteen years of local pricing in one head, converting better every year — into a queue the company cannot install.',
    evidence: evidenceSource(company, 'ev_110'),
  },
  {
    id: 'approver',
    label: 'single-approver control',
    v: false,
    r: false,
    i: false,
    o: true,
    note: 'Consistently applied, thoroughly organised, and a queue in front of the constrained stage. Organisation cannot rescue a capability that fails the first gate.',
    evidence: evidenceSource(company, 'ev_116'),
  },
];

const SHOWPIECE_SOURCES = ['ev_103', 'ev_104', 'ev_110', 'ev_115', 'ev_116', 'ev_117'];

const VERDICT_LABEL: [string, string][] = [
  [CREW, 'sustained · clears all four'],
  [ESTIMATING, 'uncaptured · fails organised'],
  [COVERAGE, 'parity · fails rare'],
  [APPROVER, 'parity · fails valuable'],
];

const READING = (
  <div className="grid gap-4">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
        the four verdicts, in the pack&apos;s own words
      </span>
      <span className="text-[14px]" style={{ color: 'var(--muted)' }}>
        Written before the gates were drawn.
      </span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {VERDICT_LABEL.map(([name, label]) => (
        <ClaimLine
          key={name}
          claim={capability(name).assessment}
          company={company}
          label={`${name.toLowerCase()} · ${label}`}
        />
      ))}
    </div>
    <p className="max-w-[68ch] text-[15px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
      One sustained advantage out of four candidates is a healthy result, not a poor one. The
      two that stop early are the ordinary substance of a working business, and the one that
      stops at the last gate is the most useful finding on the page: an advantage that exists
      and cannot be collected is usually one incentive or one scheduling rule away from being
      collected, which is a cheaper fix than anything the other three gates could suggest.
    </p>
  </div>
);

/* ------------------------------------------------------------ the interaction */

const CANDIDATES: GateCandidate[] = [
  {
    id: 'crews',
    label: 'Complex retrofit crews',
    billing: 'Sold as the reason customers choose Beacon at all.',
    failsAt: 'none',
    outcome: 'sustained',
    gates: [
      {
        key: 'v',
        letter: 'V',
        label: 'valuable',
        passed: true,
        detail: <ClaimLine claim={capability(CREW).assessment} company={company} />,
      },
      {
        key: 'r',
        letter: 'R',
        label: 'rare',
        passed: true,
        detail: (
          <ClaimLine
            claim={{
              text: 'Rare against the named comparators: the three regional contractors that match Beacon on service coverage are not the ones customers describe as the best they use. Scored as an inference — nobody has audited the competitors, and the strongest support is a customer saying it out loud.',
              status: 'supported_inference',
              evidenceRefs: ['ev_119', 'ev_104'],
            }}
            company={company}
            label="rare compared to whom"
          />
        ),
      },
      {
        key: 'i',
        letter: 'I',
        label: 'inimitable',
        passed: true,
        detail: (
          <ClaimLine
            claim={{
              text: 'Copying it means assembling crews with the same certifications and the same occupied-building experience. Beacon cannot do that quickly itself: three installation roles are open, the oldest for most of a year, against an average time to hire of over three months. The barrier is real precisely because it is also holding this company back.',
              status: 'supported_inference',
              evidenceRefs: ['ev_117'],
            }}
            company={company}
            label="how fast could a rival copy it"
          />
        ),
      },
      {
        key: 'o',
        letter: 'O',
        label: 'organised',
        passed: true,
        detail: (
          <ClaimLine
            claim={{
              text: 'The business is arranged to sell and bill this work: installation is the largest revenue line and it is sold into the same accounts the service book already holds. Note the gate being asked here — whether the value can be captured, not whether the company could deliver more of it. That second question belongs to a different instrument.',
              status: 'supported_inference',
              evidenceRefs: ['ev_101'],
            }}
            company={company}
            label="can the business collect the value"
          />
        ),
      },
    ],
    verdict: (
      <ClaimLine
        claim={{
          text: 'Sustained advantage — and the same crews run at the highest utilisation in the company while signed work waits months for them. The advantage worth defending and the place with no room left in it are one thing, which is the pairing the rest of this stack exists to catch.',
          status: 'supported_inference',
          evidenceRefs: ['ev_103', 'ev_105'],
        }}
        company={company}
        label="verdict · sustained"
      />
    ),
  },
  {
    id: 'estimating',
    label: 'Estimating and bid conversion',
    billing: 'One estimator, fifteen years of local pricing, a win rate that keeps improving.',
    failsAt: 'o',
    outcome: 'uncaptured',
    gates: [
      {
        key: 'v',
        letter: 'V',
        label: 'valuable',
        passed: true,
        detail: (
          <MetricLine
            metric={operating('Proposal win rate')}
            company={company}
            label="proposal win rate"
            note="up on the prior year, on more proposals issued"
          />
        ),
      },
      {
        key: 'r',
        letter: 'R',
        label: 'rare',
        passed: true,
        detail: (
          <ClaimLine
            claim={{
              text: 'A competitor can hire an estimator. It cannot hire fifteen years of local pricing history, which is what turns a quote into a bid that wins. Marked an assumption: the pack shows the conversion, not the mechanism behind it.',
              status: 'assumption',
              evidenceRefs: ['ev_110', 'ev_115'],
            }}
            company={company}
            label="rare compared to whom"
          />
        ),
      },
      {
        key: 'i',
        letter: 'I',
        label: 'inimitable',
        passed: true,
        detail: (
          <ClaimLine
            claim={{
              text: 'Slow to copy and fragile for exactly the same reason: it lives with one person. An advantage that would leave the building in a single resignation is inimitable and a capability gap at once, and both belong in the output.',
              status: 'supported_inference',
              evidenceRefs: ['ev_115', 'ev_117'],
            }}
            company={company}
            label="how fast could a rival copy it"
          />
        ),
      },
      {
        key: 'o',
        letter: 'O',
        label: 'organised',
        passed: false,
        detail: (
          <div className="grid gap-2">
            <ClaimLine claim={capability(ESTIMATING).assessment} company={company} />
            <ClaimLine
              claim={org('Estimator')}
              company={company}
              label="how the role is measured"
            />
          </div>
        ),
      },
    ],
    verdict: (
      <ClaimLine
        claim={{
          text: 'Uncaptured advantage. The capability works and the organisation cannot collect what it produces: every additional win lands on a dispatch board that is already the length of a season, so better conversion turns into a longer queue rather than into revenue. The remedy is an incentive and a scheduling rule, not an investment.',
          status: 'supported_inference',
          evidenceRefs: ['ev_110', 'ev_105', 'ev_106'],
        }}
        company={company}
        label="verdict · uncaptured"
      />
    ),
  },
  {
    id: 'coverage',
    label: 'Contracted service coverage',
    billing: 'Presented as the backbone of the business, and in cash terms it is.',
    failsAt: 'r',
    outcome: 'parity',
    gates: [
      {
        key: 'v',
        letter: 'V',
        label: 'valuable',
        passed: true,
        detail: (
          <MetricLine
            metric={operating('Service utilisation')}
            company={company}
            label="service technicians, booked"
            note="genuine headroom, and the line that funds the field organisation between projects"
          />
        ),
      },
      {
        key: 'r',
        letter: 'R',
        label: 'rare',
        passed: false,
        detail: <ClaimLine claim={capability(COVERAGE).assessment} company={company} />,
      },
      {
        key: 'i',
        letter: 'I',
        label: 'inimitable',
        passed: false,
        detail: null,
      },
      {
        key: 'o',
        letter: 'O',
        label: 'organised',
        passed: true,
        detail: null,
      },
    ],
    verdict: (
      <ClaimLine
        claim={{
          text: 'Parity, and that is the right home for it. Coverage three competitors can match will not win an argument about strategy — but it funds the payroll between projects and it holds the accounts the installation work is sold into, which is what parity capabilities are for.',
          status: 'supported_inference',
          evidenceRefs: ['ev_101', 'ev_104'],
        }}
        company={company}
        label="verdict · parity"
      />
    ),
  },
  {
    id: 'approver',
    label: 'Single-approver project control',
    billing: 'Named in the room as a strength: one hand on the schedule, consistent decisions.',
    failsAt: 'v',
    outcome: 'parity',
    gates: [
      {
        key: 'v',
        letter: 'V',
        label: 'valuable',
        passed: false,
        detail: (
          <div className="grid gap-2">
            <ClaimLine claim={capability(APPROVER).assessment} company={company} />
            <MetricLine
              metric={measure(APPROVER, 'Median approval time')}
              company={company}
              label="median time, request to approval"
              note="with crews stood down on four projects while one waited"
            />
          </div>
        ),
      },
      { key: 'r', letter: 'R', label: 'rare', passed: false, detail: null },
      { key: 'i', letter: 'I', label: 'inimitable', passed: false, detail: null },
      { key: 'o', letter: 'O', label: 'organised', passed: true, detail: null },
    ],
    verdict: (
      <ClaimLine
        claim={{
          text: 'Parity at best, and a cost at worst — it is thoroughly organised around work it should not be doing. This is the row that shows what the gate order is for: a capability that fails the value question is never scored on the other three, and a table that gives it four ticks anyway has stopped being an assessment.',
          status: 'supported_inference',
          evidenceRefs: ['ev_116', 'ev_115'],
        }}
        company={company}
        label="verdict · parity"
      />
    ),
  },
];

/* ---------------------------------------------------------------- the compare */

const COMPARE = (
  <LensSwitch
    label="The single approver, two ways"
    lenses={[
      {
        id: 'presented',
        label: 'As presented',
        caption: 'the capability slide · one hand on the schedule',
        content: (
          <div className="grid gap-2">
            <ClaimLine
              claim={org('Installation project manager')}
              company={company}
              label="how the role is described"
            />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Described this way it is a genuine virtue: consistent decisions, a named owner for
              every customer commitment, nothing approved by somebody who has not seen the site.
              Every word of that is true, and it is how the row gets four ticks.
            </p>
          </div>
        ),
      },
      {
        id: 'tested',
        label: 'As tested',
        caption: 'the same role, put through the first gate',
        content: (
          <div className="grid gap-2">
            <MetricLine
              metric={measure(APPROVER, 'Change orders raised')}
              company={company}
              label="change orders, trailing twelve months"
            />
            <MetricLine
              metric={measure(APPROVER, 'Median approval time')}
              company={company}
              label="median time, request to approval"
            />
            <ClaimLine claim={capability(APPROVER).assessment} company={company} />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Same role, same evidence, one question asked of it. The gate does not accuse
              anybody of doing their job badly — it asks whether the arrangement creates value
              or absorbs it, and here the answer arrives with crews standing idle in it.
            </p>
          </div>
        ),
      },
    ]}
  />
);

/* ----------------------------------------------------------------- the config */

export const vrioPageConfig: FrameworkPageConfig = {
  id: 'vrio',
  showpiece: {
    recipe: 'fw/vrio-gates',
    actTitle: 'the gates',
    headline: (
      <>
        Four gates, in order. Most capabilities stop at the <em className="italic">first</em>{' '}
        one they meet.
      </>
    ),
    note: "Beacon's four candidates travel valuable, rare, inimitable, organised. Watch where each one drops — the shelf a token lands on is the finding, and only one token reaches the far end.",
    pin: 2.3,
    diagram: <VrioGates capabilities={CAPABILITIES} />,
    evidenceRefs: SHOWPIECE_SOURCES,
    caption: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          assessed from
        </span>
        <EvidenceChips company={company} refs={SHOWPIECE_SOURCES} />
      </div>
    ),
    reading: READING,
  },
  lesson: {
    Body: VrioLesson,
    path: 'src/content/frameworks/vrio/lesson.mdx',
  },
  explore: {
    title: (
      <>
        Guess the gate. Then watch the filter <em className="italic">stop</em>.
      </>
    ),
    lede: 'Four capabilities, four different fates. Commit to where you think each one fails before the walk runs — the flattering answer is available every time, and noticing that you want it is most of the lesson.',
    prediction: {
      kicker: 'predict before the gates',
      question:
        'One of these four is named internally as a strength and does not clear the very first gate. Which one?',
      options: [
        {
          id: 'crews',
          label: 'Complex retrofit crews',
          detail: 'the work customers say they are buying',
        },
        {
          id: 'coverage',
          label: 'Contracted service coverage',
          detail: 'the maintenance book that funds the payroll',
        },
        {
          id: 'estimating',
          label: 'Estimating and bid conversion',
          detail: 'one estimator, a rising win rate',
        },
        {
          id: 'approver',
          label: 'Single-approver project control',
          detail: 'one desk signs every change',
        },
      ],
      correctId: 'approver',
      reveal: (
        <div className="grid gap-3">
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            The value gate is not asking whether people are doing their jobs well. It is asking
            whether the arrangement creates value or absorbs it — and this one absorbs it in
            measurable days, with crews standing idle inside them. Everything downstream of a
            failed value gate goes unasked, which is why the order the model puts them in is
            the argument rather than the formatting.
          </p>
          <ClaimLine claim={capability(APPROVER).assessment} company={company} />
        </div>
      ),
    },
    interaction: <VrioGateWalk candidates={CANDIDATES} />,
    compare: COMPARE,
  },
  unlocked: [
    'Four capabilities classified with the gate each one stops at, so a strength list downstream carries verdicts rather than adjectives.',
    'One sustained advantage named — the retrofit crews — and one uncaptured advantage, which is the cheapest finding here: the conversion works and the organisation cannot collect it.',
    'Two capability gaps that fall out of the same run: pricing history held by one person, and an incentive that pays for work the delivery side cannot absorb.',
  ],
};

export default vrioPageConfig;
